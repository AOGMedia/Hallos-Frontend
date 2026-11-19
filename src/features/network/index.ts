/**
 * Network awareness for the whole website: one monitor that knows whether
 * the person is offline, on a slow connection, or can't reach Hallos; one
 * status bar that tells them; and one function that turns request errors
 * into precise messages.
 */
export { getNetworkMonitor } from './networkStatus'
export { useNetworkStatus } from './useNetworkStatus'
export { friendlyErrorMessage, isOfflineError, NETWORK_MESSAGES, OFFLINE_ERROR_CODE } from './friendlyError'
export { NetworkStatusBar } from './NetworkStatusBar'
export type { NetworkState, NetworkStatus, SlowCause } from './networkMonitor'
