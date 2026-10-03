import axios from 'axios';
import { getAuthToken, removeAuthToken } from '@/utils/tokenStorage.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const API_CONFIG = Object.freeze({
  BASE_URL: API_BASE_URL,
  AUTH: Object.freeze({
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  }),
  VEHICLES: Object.freeze({
    BASE: '/vehicles',
    SEARCH: '/vehicles/search',
  }),
  BOOKINGS: Object.freeze({
    BASE: '/bookings',
  }),
});

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL.replace(/\/+$/, ''),
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
  (error) => {
    if (error?.response?.status === 401) {
      removeAuthToken();
      window.dispatchEvent(new Event('auth:token-expired'));
    }

    return Promise.reject(error);
  },
);

export default apiClient;
