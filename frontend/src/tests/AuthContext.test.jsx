import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/context/AuthContext.jsx';
import * as authService from '@/services/authService.js';
import {
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from '@/utils/tokenStorage.js';

vi.mock('@/services/authService.js', () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    removeAuthToken();
    vi.resetAllMocks();
  });

  afterEach(() => {
    removeAuthToken();
  });

  it('starts unauthenticated when no token is stored', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('starts authenticated when a token is stored', () => {
    setAuthToken('stored-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.token).toBe('stored-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('persists the login token and updates authentication state', async () => {
    const credentials = { email: 'renter@example.com', password: 'secret' };
    const user = {
      id: 1,
      name: 'Renter',
      email: 'renter@example.com',
      role: 'USER',
    };

    authService.login.mockResolvedValue({ token: 'session-token', user });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(result.current.token).toBe('session-token');
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(getAuthToken()).toBe('session-token');
  });

  it('clears the token and user when the app receives an expired-token event', () => {
    setAuthToken('session-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      window.dispatchEvent(new Event('auth:token-expired'));
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(getAuthToken()).toBeNull();
  });

  it('removes the token and clears authentication state on logout', () => {
    setAuthToken('session-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => result.current.logout());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(getAuthToken()).toBeNull();
  });

  it('returns the registration response from the auth service', async () => {
    const registrationData = { email: 'renter@example.com' };
    const apiResponse = {};
    authService.register.mockResolvedValue(apiResponse);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await expect(result.current.register(registrationData)).resolves.toBe(
      apiResponse,
    );
    expect(authService.register).toHaveBeenCalledWith(registrationData);
  });

  it('throws a clear error when used outside the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider.',
    );
  });
});
