import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_CONFIG } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';
import { login, register } from '@/services/authService.js';

describe('authService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends login credentials to the configured login endpoint', async () => {
    const credentials = { email: 'renter@example.com', password: 'secret' };
    const apiResponse = {};
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(apiResponse),
    });

    await expect(login(credentials)).resolves.toBe(apiResponse);

    expect(fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL.replace(/\/+$/, '')}${API_CONFIG.AUTH.LOGIN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      },
    );
  });

  it('sends registration data to the configured registration endpoint', async () => {
    const registrationData = { email: 'renter@example.com' };
    const apiResponse = {};
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(apiResponse),
    });

    await expect(register(registrationData)).resolves.toBe(apiResponse);

    expect(fetch).toHaveBeenCalledWith(
      `${API_CONFIG.BASE_URL.replace(/\/+$/, '')}${API_CONFIG.AUTH.REGISTER}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      },
    );
  });

  it('uses the shared server error message for HTTP failures', async () => {
    fetch.mockResolvedValue({ ok: false });

    await expect(login({})).rejects.toThrow(MESSAGES.COMMON.SERVER_ERROR);
  });
});
