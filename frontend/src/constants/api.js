const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const API_PATHS = Object.freeze({
  AUTH: Object.freeze({
    BASE: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  }),
  VEHICLES: Object.freeze({
    BASE: '/vehicles',
    SEARCH: '/vehicles/search',
  }),
  BOOKINGS: Object.freeze({
    BASE: '/bookings',
  }),
  H2_CONSOLE: Object.freeze({
    BASE: '/h2-console',
    ALL: '/h2-console/**',
  }),
});

export const API_CONFIG = Object.freeze({
  BASE_URL: API_BASE_URL,
  AUTH: API_PATHS.AUTH,
  VEHICLES: API_PATHS.VEHICLES,
  BOOKINGS: API_PATHS.BOOKINGS,
});
