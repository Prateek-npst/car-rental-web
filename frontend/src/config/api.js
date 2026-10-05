import axios from 'axios';
import { API_CONFIG } from '@/constants/api.js';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/utils/tokenStorage.js';

export { API_CONFIG };

const REFRESH_RETRY_KEY = '__authRefreshAttempted';
const baseURL = API_CONFIG.BASE_URL.replace(/\/+$/, '');
const authSessionClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
let refreshPromise = null;

export function refreshAuthSession() {
  if (!refreshPromise) {
    refreshPromise = authSessionClient
      .post(API_CONFIG.AUTH.REFRESH, null, {
        headers: { 'X-Auth-Action': 'refresh' },
      })
      .then((response) => response.data)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function logoutAuthSession() {
  return authSessionClient
    .post(API_CONFIG.AUTH.LOGOUT, null, {
      headers: { 'X-Auth-Action': 'logout' },
    })
    .catch(() => undefined);
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const requestPath = originalRequest?.url;
    const isAuthRequest = Object.values(API_CONFIG.AUTH).includes(requestPath);

    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest[REFRESH_RETRY_KEY] &&
      !isAuthRequest
    ) {
      try {
        originalRequest[REFRESH_RETRY_KEY] = true;
        const session = await refreshAuthSession();
        const nextToken = session?.token ?? null;

        if (nextToken) {
          setAuthToken(nextToken);
          window.dispatchEvent(
            new CustomEvent('auth:token-refreshed', { detail: session }),
          );
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${nextToken}`,
          };
          return apiClient(originalRequest);
        }
      } catch {
        // Expire the local session when the refresh cookie is no longer valid.
      }

      removeAuthToken();
      window.dispatchEvent(new Event('auth:token-expired'));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
