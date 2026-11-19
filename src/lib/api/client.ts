// import axios, { type AxiosError } from 'axios';

// // Create axios instance with base configuration
// export const apiClient = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000,
//   withCredentials: true,
// });

// // Request interceptor to add auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('auth_token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     // Handle 401 Unauthorized
//     if (error.response?.status === 401) {
//       localStorage.removeItem('auth_token');
//       // Do not globally redirect here; let route-level logic decide
//     }
    
//     // Handle 429 Rate Limit
//     if (error.response?.status === 429) {
//       console.error('Rate limit exceeded. Please try again later.');
//     }
    
//     return Promise.reject(error);
//   }
// );

// lib/api/client.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getNetworkMonitor } from '@/features/network/networkStatus';
import { OFFLINE_ERROR_CODE } from '@/features/network/friendlyError';

declare global {
  interface Window {
    __TOKEN__?: string;
    getAuthToken?: () => string | undefined;
  }
}

/**
 * Robust token getter for client requests.
 * Adjust to use your auth store getter if you have one (preferred).
 */
function getAuthToken(): string | undefined {
  try {
    if (typeof window === 'undefined') return undefined;

    // 1. common explicit key
    const keys = ['auth_token', 'token', 'accessToken', 'access_token', 'authToken'];
    for (const k of keys) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }

    // 2. auth object in localStorage
    const authRaw = localStorage.getItem('auth');
    if (authRaw) {
      try {
        const parsed = JSON.parse(authRaw);
        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
        if (parsed?.auth_token) return parsed.auth_token;
      } catch {}
    }

    // 3. window global (set by some login flows)
    if (typeof window !== 'undefined' && typeof window.__TOKEN__ === 'string') return window.__TOKEN__;

    // 4. optional: window-level getter (if your app sets it)
    if (typeof window !== 'undefined' && typeof window.getAuthToken === 'function') {
      const t = window.getAuthToken();
      if (t) return t;
    }
  } catch {
    // ignore
  }
  return undefined;
}

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // ensure cookies like connect.sid are sent
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        // dev-only: log what header will be sent (remove in prod)
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[apiClient] Authorization header set for', config.url, token.slice ? `${token.slice(0, 8)}...` : token);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[apiClient] No auth token found for request', config.url);
        }
      }
    } catch {
      // noop
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Network awareness ────────────────────────────────────────────────────
// Every request reports how it went to the network monitor (features/network),
// which decides whether the person is offline, on a slow connection, or can't
// reach Hallos, and shows the status bar.

const DEFAULT_TIMEOUT_MS = 10000;
/** Reads given more time when the connection is slow. */
const SLOW_NETWORK_TIMEOUT_MS = 20000;
/** Endpoints that are slow on the server itself: timing them says nothing about the connection. */
const KNOWN_SLOW_PATHS = ['/live/getLive'];

type NetworkAwareConfig = InternalAxiosRequestConfig & {
  __networkStartedAt?: number;
  __networkSample?: boolean;
  __retryCount?: number;
};

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const c = config as NetworkAwareConfig;
  const method = (c.method ?? 'get').toLowerCase();

  // Don't send saves or payments when the device is definitely offline: they
  // would only fail after a wait. Reads are left to retry and pause as usual.
  if (method !== 'get' && navigator.onLine === false) {
    getNetworkMonitor()?.deviceWentOffline();
    throw new AxiosError("You're offline. Check your internet connection and try again.", OFFLINE_ERROR_CODE, c);
  }

  // Only time ordinary reads (not uploads, long-running creates or known-slow endpoints).
  const url = c.url ?? '';
  c.__networkSample =
    method === 'get' &&
    c.__retryCount === undefined &&
    (c.timeout ?? DEFAULT_TIMEOUT_MS) <= DEFAULT_TIMEOUT_MS &&
    !KNOWN_SLOW_PATHS.some((p) => url.includes(p));
  c.__networkStartedAt = Date.now();

  // On a slow connection, give reads more time rather than letting them fail.
  if (method === 'get' && c.timeout === DEFAULT_TIMEOUT_MS && getNetworkMonitor()?.isSlow()) {
    c.timeout = SLOW_NETWORK_TIMEOUT_MS;
  }
  return c;
});

/** Tell the network monitor how a request went (browser only). */
function reportToNetworkMonitor(config: NetworkAwareConfig | undefined, error?: AxiosError) {
  const monitor = getNetworkMonitor();
  if (!monitor || !config || config.__networkStartedAt === undefined) return;
  if (error?.code === 'ERR_CANCELED' || error?.code === OFFLINE_ERROR_CODE) return;

  const response = error ? error.response : undefined;
  if (!error || response) {
    if (response && [502, 503, 504].includes(response.status)) {
      monitor.reportGatewayError();
      return;
    }
    // Any other answer, even 4xx, means the server is reachable.
    monitor.reportResponse(config.__networkSample ? Date.now() - config.__networkStartedAt : undefined);
    return;
  }
  const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || /timeout/i.test(error.message);
  monitor.reportNoResponse(timedOut ? 'timeout' : 'network');
}

/**
 * Reads (GET) are retried when the server is briefly unreachable — a timeout,
 * a dropped connection, or 502/503/504 while the backend restarts or wakes up.
 * Each retry waits a little longer and allows more time. Writes are never
 * retried, so nothing (payments, gifts, messages) can happen twice.
 */
const GET_RETRY_TIMEOUTS_MS = [20000, 30000];
const GET_RETRY_DELAYS_MS = [800, 2000];
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

type RetriableConfig = NonNullable<AxiosError['config']> & { __retryCount?: number };

function shouldRetryGet(error: AxiosError): boolean {
  const config = error.config as RetriableConfig | undefined;
  if (!config || (config.method ?? 'get').toLowerCase() !== 'get') return false;
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return false;
  if ((config.__retryCount ?? 0) >= GET_RETRY_TIMEOUTS_MS.length) return false;
  const status = error.response?.status;
  return status === undefined || RETRYABLE_STATUSES.has(status);
}

/**
 * Staff suspended this account: the server refuses its session everywhere.
 * Sign out once and show the reason on the sign-in page. Only this exact
 * code does it, so no other 403 ever signs anyone out.
 */
let suspendedRedirectStarted = false;
function signOutSuspended(reason: 'account_suspended' | 'account_deleted' = 'account_suspended') {
  if (typeof window === 'undefined' || suspendedRedirectStarted) return;
  if (window.location.pathname.startsWith('/signin')) return; // the form shows the message itself
  suspendedRedirectStarted = true;
  clearAuthToken();
  try {
    localStorage.removeItem('user_id');
    localStorage.removeItem('auth-storage');
  } catch {}
  window.location.replace(`/signin?error=${reason}`);
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    reportToNetworkMonitor(response.config as NetworkAwareConfig);
    return response;
  },
  async (error: AxiosError) => {
    reportToNetworkMonitor(error.config as NetworkAwareConfig | undefined, error);

    if (shouldRetryGet(error)) {
      const config = error.config as RetriableConfig;
      const attempt = config.__retryCount ?? 0;
      config.__retryCount = attempt + 1;
      config.timeout = Math.max(config.timeout ?? 0, GET_RETRY_TIMEOUTS_MS[attempt]);
      await new Promise((resolve) => setTimeout(resolve, GET_RETRY_DELAYS_MS[attempt]));
      return apiClient.request(config);
    }

    const status = error.response?.status;
    const url = error.config?.url ?? 'unknown url';

    if (status === 403 && (error.response?.data as { code?: string } | undefined)?.code === 'ACCOUNT_SUSPENDED') {
      signOutSuspended();
    }
    // The account was deleted (at the person's request): same, once, with its own message.
    if (status === 401 && (error.response?.data as { code?: string } | undefined)?.code === 'ACCOUNT_DELETED') {
      signOutSuspended('account_deleted');
    }

    // Log helpful debug info (response body) for 401s and other failures
    if (status === 401 || status === 403) {
      console.warn(`[apiClient] ${status} from ${url}`, error.response?.data);
      // Do not auto-remove token here so dev can inspect server response.
      // You may call clearAuthToken() from UI if desired.
    }

    if (status === 429) {
      console.error('[apiClient] Rate limit exceeded for', url);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to clear token from localStorage (call on explicit sign out)
 */
export function clearAuthToken() {
  try {
    const keys = ['auth_token', 'token', 'accessToken', 'access_token', 'authToken'];
    for (const k of keys) localStorage.removeItem(k);
    localStorage.removeItem('auth');
    if (typeof window !== 'undefined') {
      if (typeof window.__TOKEN__ !== 'undefined') window.__TOKEN__ = undefined;
    }
  } catch {}
}

export default apiClient;
