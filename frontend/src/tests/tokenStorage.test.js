import { afterEach, describe, expect, it } from 'vitest';
import {
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from '@/utils/tokenStorage.js';

describe('tokenStorage', () => {
  afterEach(() => {
    removeAuthToken();
  });

  it('stores, retrieves, and removes the authentication token', () => {
    expect(getAuthToken()).toBeNull();

    setAuthToken('test-token');
    expect(getAuthToken()).toBe('test-token');

    removeAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});
