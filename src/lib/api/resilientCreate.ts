import axios, { type AxiosError, type AxiosProgressEvent } from 'axios'
import { apiClient } from './client'

export type CreateKind = 'liveClass' | 'liveSeries'

export const JSON_CREATE_TIMEOUT_MS = 30_000
export const MULTIPART_CREATE_TIMEOUT_MS = 120_000

const RETRY_DELAYS_MS = [1500, 4000]
const MAX_OFFLINE_WAIT_MS = 60_000

export interface RetryStatus {
  phase: 'offline' | 'retrying'
  attempt: number
  maxAttempts: number
}

export interface CreateRequestOptions {
  idempotencyKey?: string
  onUploadProgress?: (fraction: number) => void
  onRetryStatus?: (status: RetryStatus) => void
}

export class CreateRequestError extends Error {
  readonly networkIssue: boolean

  constructor(message: string, networkIssue: boolean) {
    super(message)
    this.name = 'CreateRequestError'
    this.networkIssue = networkIssue
  }
}

let capabilityPromise: Promise<Record<CreateKind, boolean>> | null = null

// Auto retry is only safe when the backend dedupes by idempotency key; an older
// backend (or a failed lookup) reports false and we fall back to a single attempt.
export function supportsIdempotentCreate(kind: CreateKind): Promise<boolean> {
  if (!capabilityPromise) {
    capabilityPromise = apiClient
      .get<{ idempotentCreate?: Partial<Record<CreateKind, boolean>> }>('/live/create-capabilities', { timeout: 8000 })
      .then((res) => ({
        liveClass: res.data?.idempotentCreate?.liveClass === true,
        liveSeries: res.data?.idempotentCreate?.liveSeries === true,
      }))
      .catch(() => {
        capabilityPromise = null
        return { liveClass: false, liveSeries: false }
      })
  }
  return capabilityPromise.then((caps) => caps[kind]).catch(() => false)
}

export function isTransientNetworkError(e: unknown): boolean {
  if (e instanceof CreateRequestError) return e.networkIssue
  if (!axios.isAxiosError(e)) return false
  const err = e as AxiosError
  if (err.code === 'ERR_CANCELED') return false
  if (!err.response) return true
  const status = err.response.status
  return status === 408 || status === 502 || status === 503 || status === 504
}

export function toCreateError(e: unknown): CreateRequestError {
  const err = e as AxiosError<{ message?: string }>
  const msg = err?.response?.data?.message || err?.message || 'Request failed'
  return new CreateRequestError(msg, isTransientNetworkError(e))
}

export function progressFraction(e: AxiosProgressEvent): number | undefined {
  if (typeof e.progress === 'number') return e.progress
  if (e.total) return e.loaded / e.total
  return undefined
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false

function waitForOnline(maxMs: number): Promise<void> {
  if (!isOffline() || typeof window === 'undefined') return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener('online', done)
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(done, maxMs)
    window.addEventListener('online', done)
  })
}

export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  opts: { canRetry?: () => Promise<boolean>; onStatus?: (s: RetryStatus) => void; maxAttempts?: number } = {}
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      if (attempt >= maxAttempts || !isTransientNetworkError(e)) throw e
      if (opts.canRetry && !(await opts.canRetry())) throw e
      await sleep(RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1])
      if (isOffline()) {
        opts.onStatus?.({ phase: 'offline', attempt: attempt + 1, maxAttempts })
        await waitForOnline(MAX_OFFLINE_WAIT_MS)
      }
      opts.onStatus?.({ phase: 'retrying', attempt: attempt + 1, maxAttempts })
    }
  }
}

export function retryStatusLabel(s: RetryStatus): string {
  return s.phase === 'offline'
    ? 'Waiting for connection...'
    : `Retrying (${s.attempt} of ${s.maxAttempts})...`
}

export function uploadProgressLabel(fraction: number): string {
  return fraction >= 1 ? 'Finishing up...' : `Uploading ${Math.round(fraction * 100)}%`
}

// Message for a failed create. When the failure was the network and the backend
// dedupes, tapping again is safe and we say so; otherwise warn about duplicates.
export async function describeCreateError(e: unknown, fallback: string, kind: CreateKind): Promise<string> {
  if (isTransientNetworkError(e)) {
    const safe = await supportsIdempotentCreate(kind)
    return safe
      ? 'Your connection dropped before we could confirm. Your details are saved, so tap again and we will continue without creating a duplicate.'
      : 'Your connection dropped before we could confirm. Please check your schedule before trying again so you do not create a duplicate.'
  }
  return e instanceof Error && e.message ? e.message : fallback
}
