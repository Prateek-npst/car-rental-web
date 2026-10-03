import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { login, register } from '@/services/authService.js';
import { API_CONFIG, apiClient } from '@/config/api.js';

vi.mock('@/config/api.js', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:8081/api',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
    },
  },
  apiClient: {
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends login credentials to the configured login endpoint via axios', async () => {
    const credentials = { email: 'renter@example.com', password: 'secret' };
    const apiResponse = { token: 'jwt-token', user: { id: 1 } };
    apiClient.post.mockResolvedValue({ data: apiResponse });

    await expect(login(credentials)).resolves.toBe(apiResponse);

    expect(apiClient.post).toHaveBeenCalledWith(
      API_CONFIG.AUTH.LOGIN,
      credentials,
    );
  });

  it('sends registration data to the configured registration endpoint via axios', async () => {
    const registrationData = { email: 'renter@example.com' };
    const apiResponse = { id: 1, email: 'renter@example.com' };
    apiClient.post.mockResolvedValue({ data: apiResponse });

    await expect(register(registrationData)).resolves.toBe(apiResponse);

    expect(apiClient.post).toHaveBeenCalledWith(
      API_CONFIG.AUTH.REGISTER,
      registrationData,
    );
  });

  it('uses the generic invalid credentials message for 401 login failures', async () => {
    apiClient.post.mockRejectedValue({ response: { status: 401 } });

    await expect(login({})).rejects.toThrow(MESSAGES.AUTH.INVALID_CREDENTIALS);
  });

  it('uses the safe registration failure message for registration errors', async () => {
    apiClient.post.mockRejectedValue({ response: { status: 409 } });

    await expect(register({})).rejects.toThrow(
      MESSAGES.AUTH.REGISTRATION_FAILED,
    );
  });
});
