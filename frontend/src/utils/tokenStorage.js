import { STORAGE_KEYS } from '@/constants/storageKeys.js';

export function getAuthToken() {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setAuthToken(token) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function removeAuthToken() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}
