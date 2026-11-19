import axios from 'axios'
import { getNetworkMonitor } from './networkStatus'

/** The words people see, kept in one place so every screen says the same thing. */
export const NETWORK_MESSAGES = {
  offline: "You're offline. Check your internet connection and try again.",
  slow: 'This is taking longer than usual. Your connection may be slow, so please try again.',
  unreachable: "We can't reach Hallos right now. Please try again in a moment.",
  noConnection: "We couldn't connect. Check your internet connection and try again.",
  server: 'Something went wrong on our side. Please try again in a moment.',
  busy: 'Too many attempts. Please wait a moment and try again.',
} as const

/** Set on a request the app refused to send because the device is offline. */
export const OFFLINE_ERROR_CODE = 'ERR_OFFLINE'

const deviceOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false
const monitorStatus = () => getNetworkMonitor()?.getState().status

/** True when the failure is because there's no connection. */
export function isOfflineError(error: unknown): boolean {
  if (axios.isAxiosError(error) && error.code === OFFLINE_ERROR_CODE) return true
  const noResponse = axios.isAxiosError(error) ? !error.response : error instanceof TypeError
  return noResponse && (deviceOffline() || monitorStatus() === 'offline')
}

/**
 * A message people can act on, for any error from a request.
 *
 * The server's own message wins when it sent one (e.g. "Email already in
 * use"). Otherwise: no connection, a slow connection, Hallos unreachable or
 * our server failing each get their own precise sentence instead of "Network
 * Error" or "timeout of 10000ms exceeded". Anything else gets `fallback`.
 */
export function friendlyErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (error.code === OFFLINE_ERROR_CODE) return NETWORK_MESSAGES.offline
    const response = error.response
    if (!response) {
      if (error.code === 'ERR_CANCELED') return fallback
      if (deviceOffline() || monitorStatus() === 'offline') return NETWORK_MESSAGES.offline
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || /timeout/i.test(error.message)) {
        return NETWORK_MESSAGES.slow
      }
      if (monitorStatus() === 'unreachable') return NETWORK_MESSAGES.unreachable
      return NETWORK_MESSAGES.noConnection
    }
    const data = response.data as { message?: unknown } | undefined
    if (data && typeof data.message === 'string' && data.message.trim()) return data.message
    if (response.status === 429) return NETWORK_MESSAGES.busy
    if (response.status >= 500) return NETWORK_MESSAGES.server
    return fallback
  }

  // fetch() failures ("Failed to fetch", "NetworkError when attempting to fetch resource").
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return deviceOffline() || monitorStatus() === 'offline' ? NETWORK_MESSAGES.offline : NETWORK_MESSAGES.noConnection
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
