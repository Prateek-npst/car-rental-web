export const MESSAGES = Object.freeze({
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    REGISTRATION_FAILED: 'Unable to create your account.',
    LOGIN: 'Log in',
    EMAIL_LABEL: 'Email',
    NAME_LABEL: 'Name',
    PASSWORD_LABEL: 'Password',
    CONFIRM_PASSWORD_LABEL: 'Confirm password',
    NAME_TOO_LONG: 'Name is too long.',
    EMAIL_INVALID: 'Enter a valid email address.',
    EMAIL_TOO_LONG: 'Email is too long.',
    PASSWORD_TOO_SHORT: 'Password is too short.',
    PASSWORD_TOO_LONG: 'Password is too long.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
    REGISTER_PROMPT: "Don't have an account?",
    REGISTER_LINK: 'Register',
  },

  COMMON: {
    REQUIRED_FIELD: 'This field is required.',
    SERVER_ERROR: 'Something went wrong. Please try again.',
    LOADING: 'Loading...',
  },

  PASSWORD_INPUT: {
    SHOW: 'Show',
    HIDE: 'Hide',
  },

  VEHICLES: {
    TITLE: 'Find a vehicle',
    LOCATION_LABEL: 'Location',
    PICKUP_DATE_LABEL: 'Pickup date',
    DROPOFF_DATE_LABEL: 'Drop-off date',
    SEARCH: 'Search',
    SEARCH_CRITERIA: 'Search criteria',
    DROPOFF_DATE_AFTER_PICKUP: 'Drop-off date must be after pickup date.',
    AVAILABLE_VEHICLES: 'Available vehicles',
    NO_AVAILABLE_VEHICLES: 'No available vehicles match this search.',
    SEARCH_FAILED: 'Unable to search vehicles right now. Please try again.',
    MODEL_LABEL: 'Model',
    REG_NUMBER_LABEL: 'Registration number',
    DAILY_RATE_LABEL: 'Daily rate',
    SELECT_VEHICLE: 'Select vehicle',
  },

  BOOKING: {
    CREATE_TITLE: 'Create booking',
    VEHICLE_DETAILS: 'Selected vehicle',
    START_DATE_LABEL: 'Start date',
    END_DATE_LABEL: 'End date',
    DATES_TITLE: 'Booking dates',
    DATE_AFTER_START: 'End date must be after start date.',
    MIN_RENTAL_DURATION: 'Rental period is shorter than the minimum duration.',
    NO_VEHICLE_SELECTED: 'Select a vehicle before creating a booking.',
    BACK_TO_VEHICLES: 'Back to vehicles',
    SUBMIT: 'Review booking details',
    READY_TO_SUBMIT:
      'Booking details are ready to submit. This frontend-only step has not saved a booking.',
  },
});
