/**
 * Decides what state the connection is in, from what the app's own requests
 * report plus small confirmation checks. Pure logic (no browser or React
 * code) so it can be tested on its own; the browser wiring is in
 * networkStatus.ts.
 *
 * Being "smart" here means not crying wolf:
 *  - A failed request never shows "offline" by itself. Two failures in a row
 *    (or the device saying it's offline) trigger a check: can we reach our
 *    own website? our API? Only a failed check changes the status, and it
 *    tells "your internet is off" apart from "Hallos can't be reached".
 *  - "Slow" needs several slow requests (the median, so one outlier doesn't
 *    count), and switches off at a lower bar than it switches on, so it
 *    doesn't flicker. When it's slow, a tiny timed request to our own website
 *    tells whether it's the person's connection or our server.
 *  - Recovery is automatic: re-checks back off (2s, 4s, 8s, then every 15s),
 *    and any successful request clears the problem straight away.
 */

export type NetworkStatus = 'online' | 'slow' | 'offline' | 'unreachable'
export type SlowCause = 'network' | 'server'

export interface NetworkState {
  status: NetworkStatus
  /** Why it's slow, when status is 'slow' (null for a moment while that's being checked). */
  slowCause: SlowCause | null
  /** True for a few seconds after coming back from offline / unreachable. */
  justReconnected: boolean
  /** A confirmation check is running. */
  checking: boolean
}

export interface MonitorDeps {
  /** Can we reach our own website (i.e. is the internet on)? */
  probeInternet: () => Promise<boolean>
  /** Can we reach the API? */
  probeApi: () => Promise<boolean>
  /** How long a tiny request to our own website takes, in ms (null if it failed). */
  timeInternet: () => Promise<number | null>
  /** What the device says (navigator.onLine). */
  isDeviceOnline: () => boolean
  /** The device reports a very slow link (e.g. 2G). */
  connectionLooksSlow: () => boolean
  setTimer: (fn: () => void, ms: number) => unknown
  clearTimer: (id: unknown) => void
}

export interface NetworkMonitor {
  getState: () => NetworkState
  subscribe: (listener: () => void) => () => void
  /** Any HTTP response from the API (even 4xx): the server is reachable. `durationMs` only for requests worth timing. */
  reportResponse: (durationMs?: number) => void
  /** 502/503/504: the server (or its proxy) isn't answering properly. */
  reportGatewayError: () => void
  /** No response at all: a timeout or a network error. */
  reportNoResponse: (kind: 'timeout' | 'network') => void
  deviceWentOffline: () => void
  deviceWentOnline: () => void
  /** The page became visible again, or the person asked to retry. */
  recheck: () => Promise<void>
  connectionChanged: () => void
  isSlow: () => boolean
}

export const TIMING = {
  slowEnterMs: 4000,
  slowExitMs: 2000,
  sampleWindow: 6,
  minSamples: 3,
  failuresBeforeCheck: 2,
  offlineDebounceMs: 1500,
  recheckDelaysMs: [2000, 4000, 8000, 15000],
  reconnectedMs: 3500,
  /** A tiny same-site request slower than this means the person's connection is slow. */
  internetSlowMs: 1500,
}

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const safely = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export function createNetworkMonitor(deps: MonitorDeps): NetworkMonitor {
  let offline = false
  let unreachable = false
  let sampleSlow = false
  let hintSlow = deps.connectionLooksSlow()
  let slowCause: SlowCause | null = hintSlow ? 'network' : null
  let justReconnected = false
  let checking = false
  let failures = 0
  let samples: number[] = []
  let recheckAttempt = 0
  let recheckTimer: unknown = null
  let reconnectTimer: unknown = null
  let offlineTimer: unknown = null
  let inFlight: Promise<void> | null = null
  let causeCheckRunning = false
  const listeners = new Set<() => void>()

  const compute = (): NetworkState => {
    const slow = sampleSlow || hintSlow
    const status: NetworkStatus = offline ? 'offline' : unreachable ? 'unreachable' : slow ? 'slow' : 'online'
    return {
      status,
      // null while the cause is still being checked: better to say nothing
      // for a moment than to blame the person's connection wrongly.
      slowCause: status === 'slow' ? (hintSlow ? 'network' : slowCause) : null,
      justReconnected,
      checking,
    }
  }

  let state = compute()

  const emit = () => {
    const next = compute()
    if (
      next.status !== state.status ||
      next.slowCause !== state.slowCause ||
      next.justReconnected !== state.justReconnected ||
      next.checking !== state.checking
    ) {
      state = next
      listeners.forEach((l) => l())
    }
  }

  const clearRecheck = () => {
    if (recheckTimer !== null) deps.clearTimer(recheckTimer)
    recheckTimer = null
  }

  const recovered = () => {
    const wasDown = offline || unreachable
    offline = false
    unreachable = false
    failures = 0
    recheckAttempt = 0
    clearRecheck()
    if (wasDown) {
      justReconnected = true
      if (reconnectTimer !== null) deps.clearTimer(reconnectTimer)
      reconnectTimer = deps.setTimer(() => {
        justReconnected = false
        reconnectTimer = null
        emit()
      }, TIMING.reconnectedMs)
    }
    emit()
  }

  const scheduleRecheck = () => {
    clearRecheck()
    const delays = TIMING.recheckDelaysMs
    const delay = delays[Math.min(recheckAttempt, delays.length - 1)]
    recheckAttempt += 1
    recheckTimer = deps.setTimer(() => {
      recheckTimer = null
      void check()
    }, delay)
  }

  const check = (): Promise<void> => {
    if (inFlight) return inFlight
    checking = true
    emit()
    inFlight = (async () => {
      let result: 'ok' | 'offline' | 'unreachable'
      if (!deps.isDeviceOnline()) result = 'offline'
      else if (!(await safely(deps.probeInternet, false))) result = 'offline'
      else if (!(await safely(deps.probeApi, false))) result = 'unreachable'
      else result = 'ok'

      checking = false
      if (result === 'ok') {
        recovered()
      } else {
        offline = result === 'offline'
        unreachable = result === 'unreachable'
        emit()
        scheduleRecheck()
      }
    })().finally(() => {
      inFlight = null
    })
    return inFlight
  }

  /** It's slow: is it the person's connection or our server? */
  const findSlowCause = async () => {
    if (causeCheckRunning) return
    causeCheckRunning = true
    const ms = await safely(deps.timeInternet, null)
    causeCheckRunning = false
    slowCause = ms === null || ms > TIMING.internetSlowMs ? 'network' : 'server'
    emit()
  }

  const addSample = (ms: number) => {
    samples.push(ms)
    if (samples.length > TIMING.sampleWindow) samples = samples.slice(-TIMING.sampleWindow)
    if (samples.length < TIMING.minSamples) return
    const m = median(samples)
    if (!sampleSlow && m > TIMING.slowEnterMs) {
      sampleSlow = true
      slowCause = null
      void findSlowCause()
    } else if (sampleSlow && m < TIMING.slowExitMs) {
      sampleSlow = false
      slowCause = null
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    reportResponse(durationMs) {
      failures = 0
      if (typeof durationMs === 'number' && durationMs >= 0) addSample(durationMs)
      if (offline || unreachable) recovered()
      else emit()
    },
    reportGatewayError() {
      failures += 1
      if (failures >= TIMING.failuresBeforeCheck) void check()
    },
    reportNoResponse(kind) {
      failures += 1
      if (kind === 'timeout') addSample(TIMING.slowEnterMs * 2)
      if (!deps.isDeviceOnline()) {
        this.deviceWentOffline()
      } else if (failures >= TIMING.failuresBeforeCheck) {
        void check()
      } else {
        emit()
      }
    },
    deviceWentOffline() {
      // Brief blips (switching networks) shouldn't flash a banner.
      if (offlineTimer !== null) return
      offlineTimer = deps.setTimer(() => {
        offlineTimer = null
        if (!deps.isDeviceOnline()) void check()
      }, TIMING.offlineDebounceMs)
    },
    deviceWentOnline() {
      if (offlineTimer !== null) {
        deps.clearTimer(offlineTimer)
        offlineTimer = null
      }
      if (offline || unreachable) void check()
    },
    recheck() {
      if (offline || unreachable) return check()
      return Promise.resolve()
    },
    connectionChanged() {
      hintSlow = deps.connectionLooksSlow()
      emit()
    },
    isSlow: () => sampleSlow || hintSlow,
  }
}
