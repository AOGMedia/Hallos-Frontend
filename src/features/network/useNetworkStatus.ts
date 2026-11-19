'use client'

import { useSyncExternalStore } from 'react'
import type { NetworkState } from './networkMonitor'
import { getNetworkMonitor } from './networkStatus'

const ONLINE: NetworkState = { status: 'online', slowCause: null, justReconnected: false, checking: false }
const noopUnsubscribe = () => {}

const subscribe = (listener: () => void) => getNetworkMonitor()?.subscribe(listener) ?? noopUnsubscribe
const getSnapshot = () => getNetworkMonitor()?.getState() ?? ONLINE
const getServerSnapshot = () => ONLINE

/** The current network state; re-renders when it changes. */
export function useNetworkStatus(): NetworkState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
