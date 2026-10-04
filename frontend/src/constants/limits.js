export const LIMITS = Object.freeze({
  AUTH: {
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 254,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    PASSWORD_PATTERN: /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
    PASSWORD_REQUIREMENTS: Object.freeze([
      {
        key: 'minLength',
        label: 'Minimum length',
        test: (value) => value.length >= 8,
      },
      {
        key: 'uppercase',
        label: 'Uppercase letter',
        test: (value) => /[A-Z]/.test(value),
      },
      {
        key: 'lowercase',
        label: 'Lowercase letter',
        test: (value) => /[a-z]/.test(value),
      },
      { key: 'number', label: 'Number', test: (value) => /\d/.test(value) },
      {
        key: 'special',
        label: 'Special character',
        test: (value) => /[^A-Za-z0-9]/.test(value),
      },
    ]),
  },

  VEHICLE: {
    REG_NUMBER_MAX_LENGTH: 20,
    MODEL_MAX_LENGTH: 100,
    LOCATION_MAX_LENGTH: 100,
    DAILY_RATE_MIN: 1,
    DAILY_RATE_MAX: 100000,
  },

  BOOKING: {
    MIN_RENTAL_DAYS: 1,
    MAX_DATE: '2050-12-31',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
});
