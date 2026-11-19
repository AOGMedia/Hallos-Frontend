import { onlineManager, QueryClient } from '@tanstack/react-query';
import { getNetworkMonitor } from '@/features/network/networkStatus';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      // Saves always run (never paused offline to fire later by themselves):
      // the API client refuses them at once while offline, so people see
      // "You're offline" instead of a silent wait, and nothing like a payment
      // can go out unexpectedly later.
      networkMode: 'always',
    },
  },
});

// Online/offline from the network monitor (confirmed, not just the browser's
// flag): queries pause while the person is offline instead of failing, and
// refresh by themselves when they're back (refetchOnReconnect).
if (typeof window !== 'undefined') {
  onlineManager.setEventListener((setOnline) => {
    const monitor = getNetworkMonitor();
    if (!monitor) return undefined;
    const update = () => setOnline(monitor.getState().status !== 'offline');
    update();
    return monitor.subscribe(update);
  });
}
