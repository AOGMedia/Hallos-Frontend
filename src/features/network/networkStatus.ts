import { createNetworkMonitor, type NetworkMonitor } from './networkMonitor'

/**
 * The one network monitor for the website, wired to the browser. Created on
 * first use in the browser (never on the server, where it returns null), so
 * importing this anywhere is safe.
 *
 * Confirmation checks, both tiny and never cached:
 *  - internet: a HEAD request for our own favicon (same site, served by the CDN)
 *  - API: GET /health on the backend (liveness check). An older backend
 *    without /health answers 404, so it falls back to a lightweight route
 *    that has always existed — deploy order doesn't matter.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/+$/, '')
const PROBE_TIMEOUT_MS = 5000

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, cache: 'no-store', signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Any answer from our own website means the internet is on. */
async function probeInternet(): Promise<boolean> {
  await fetchWithTimeout(`/favicon.ico?network-check=${Date.now()}`, { method: 'HEAD' })
  return true
}

async function probeApi(): Promise<boolean> {
  const health = await fetchWithTimeout(`${API_BASE}/health`, { method: 'GET', credentials: 'omit' })
  if (health.ok) return true
  if (health.status !== 404) return false // e.g. 502/503 while the server is down or waking up
  const legacy = await fetchWithTimeout(`${API_BASE}/live/create-capabilities`, { method: 'GET', credentials: 'omit' })
  return legacy.ok
}

async function timeInternet(): Promise<number | null> {
  const started = performance.now()
  try {
    await probeInternet()
    return performance.now() - started
  } catch {
    return null
  }
}

type NetworkInformationLike = { effectiveType?: string; addEventListener?: (type: 'change', fn: () => void) => void }
const connectionInfo = (): NetworkInformationLike | undefined =>
  (navigator as Navigator & { connection?: NetworkInformationLike }).connection

let monitor: NetworkMonitor | null = null

/** The website's network monitor (null on the server). */
export function getNetworkMonitor(): NetworkMonitor | null {
  if (typeof window === 'undefined') return null
  if (monitor) return monitor

  const m = createNetworkMonitor({
    probeInternet,
    probeApi,
    timeInternet,
    isDeviceOnline: () => navigator.onLine !== false,
    connectionLooksSlow: () => ['slow-2g', '2g'].includes(connectionInfo()?.effectiveType ?? ''),
    setTimer: (fn, ms) => window.setTimeout(fn, ms),
    clearTimer: (id) => window.clearTimeout(id as number),
  })

  window.addEventListener('offline', () => m.deviceWentOffline())
  window.addEventListener('online', () => m.deviceWentOnline())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void m.recheck()
  })
  connectionInfo()?.addEventListener?.('change', () => m.connectionChanged())

  // Opened while already offline.
  if (navigator.onLine === false) m.deviceWentOffline()

  monitor = m
  return m
}
