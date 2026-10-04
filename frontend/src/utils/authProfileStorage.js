import { STORAGE_KEYS } from '@/constants/storageKeys.js';

export function getAuthProfile(userId) {
  try {
    const value = sessionStorage.getItem(STORAGE_KEYS.AUTH_PROFILE);
    const profile = value ? JSON.parse(value) : null;

    if (profile?.id !== userId) {
      return null;
    }

    return {
      name: typeof profile.name === 'string' ? profile.name : '',
      email: typeof profile.email === 'string' ? profile.email : '',
    };
  } catch {
    return null;
  }
}

export function setAuthProfile(user) {
  try {
    sessionStorage.setItem(
      STORAGE_KEYS.AUTH_PROFILE,
      JSON.stringify({ id: user.id, name: user.name, email: user.email }),
    );
  } catch {
    return;
  }
}

export function removeAuthProfile() {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_PROFILE);
  } catch {
    return;
  }
}
