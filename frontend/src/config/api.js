const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const API_CONFIG = Object.freeze({
  BASE_URL: API_BASE_URL,
  AUTH: Object.freeze({
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  }),
});
