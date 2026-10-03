export const FORM_FIELD_IDS = Object.freeze({
  AUTH_LOGIN: Object.freeze({
    EMAIL: 'login-email',
    EMAIL_ERROR: 'login-email-error',
    PASSWORD: 'login-password',
    PASSWORD_ERROR: 'login-password-error',
  }),
  AUTH_REGISTRATION: Object.freeze({
    NAME: 'registration-name',
    NAME_ERROR: 'registration-name-error',
    EMAIL: 'registration-email',
    EMAIL_ERROR: 'registration-email-error',
    PASSWORD: 'registration-password',
    PASSWORD_ERROR: 'registration-password-error',
    CONFIRM_PASSWORD: 'registration-confirm-password',
    CONFIRM_PASSWORD_ERROR: 'registration-confirm-password-error',
  }),
  BOOKING_CREATE: Object.freeze({
    START_DATE: 'booking-start-date',
    START_DATE_ERROR: 'booking-start-date-error',
    END_DATE: 'booking-end-date',
    END_DATE_ERROR: 'booking-end-date-error',
  }),
  VEHICLE_SEARCH: Object.freeze({
    LOCATION: 'vehicle-search-location',
    LOCATION_ERROR: 'vehicle-search-location-error',
    PICKUP_DATE: 'vehicle-search-pickup-date',
    PICKUP_DATE_ERROR: 'vehicle-search-pickup-date-error',
    DROPOFF_DATE: 'vehicle-search-dropoff-date',
    DROPOFF_DATE_ERROR: 'vehicle-search-dropoff-date-error',
  }),
});
