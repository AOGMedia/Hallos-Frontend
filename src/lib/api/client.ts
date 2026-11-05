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
import axios, { type AxiosError } from 'axios';

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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
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
