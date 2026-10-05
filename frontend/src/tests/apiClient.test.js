import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/utils/tokenStorage.js';

describe('apiClient', () => {
  beforeEach(() => {
    vi.resetModules();
    removeAuthToken();
  });

  afterEach(() => {
    removeAuthToken();
    vi.unstubAllEnvs();
  });

  it('uses the configured base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8081/api');

    const { API_CONFIG, apiClient } = await import('@/config/api.js');

    expect(API_CONFIG.BASE_URL).toBe('http://localhost:8081/api');
    expect(apiClient.defaults.baseURL).toBe('http://localhost:8081/api');
  });

  it('attaches a bearer token when present', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8081/api');
    setAuthToken('jwt-token');

    const { apiClient } = await import('@/config/api.js');
    const requestHandler = apiClient.interceptors.request.handlers.find(
      (handler) => typeof handler?.fulfilled === 'function',
    );

    const config = await requestHandler.fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer jwt-token');
  });

  it('does not attach an Authorization header when no token exists', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8081/api');
    removeAuthToken();

    const { apiClient } = await import('@/config/api.js');
    const requestHandler = apiClient.interceptors.request.handlers.find(
      (handler) => typeof handler?.fulfilled === 'function',
    );

    const config = await requestHandler.fulfilled({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('clears the stored token on an unrecoverable 401 and leaves it intact on 403', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8081/api');
    const { apiClient } = await import('@/config/api.js');
    const responseHandler = apiClient.interceptors.response.handlers.find(
      (handler) => typeof handler?.rejected === 'function',
    );

    setAuthToken('jwt-token');
    await expect(
      responseHandler.rejected({
        config: { url: '/bookings', headers: {} },
        response: { status: 401 },
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(getAuthToken()).toBeNull();

    setAuthToken('jwt-token');
    await expect(
      responseHandler.rejected({ response: { status: 403 } }),
    ).rejects.toMatchObject({ response: { status: 403 } });
    expect(getAuthToken()).toBe('jwt-token');
  });
});