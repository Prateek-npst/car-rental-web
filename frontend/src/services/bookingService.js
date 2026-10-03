import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

function getBookingErrorMessage(status, fallbackMessage) {
  if (status === 400) {
    return MESSAGES.BOOKING.CREATE_VALIDATION_FAILED;
  }

  if (status === 404) {
    return MESSAGES.BOOKING.NOT_FOUND;
  }

  if (status === 409) {
    return MESSAGES.BOOKING.BOOKING_CONFLICT;
  }

  if (status === 403) {
    return MESSAGES.BOOKING.PERMISSION_DENIED;
  }

  return fallbackMessage;
}

function throwBookingError(error, fallbackMessage) {
  throw new Error(
    getBookingErrorMessage(error?.response?.status, fallbackMessage),
    { cause: error },
  );
}

export async function createBooking({ vehicleId, startDate, endDate }) {
  try {
    const response = await apiClient.post(API_CONFIG.BOOKINGS.BASE, {
      vehicleId,
      startDate,
      endDate,
    });

    return response.data;
  } catch (error) {
    throwBookingError(error, MESSAGES.BOOKING.CREATE_FAILED);
  }
}

export async function getBookings() {
  try {
    const response = await apiClient.get(API_CONFIG.BOOKINGS.BASE);

    return response.data;
  } catch (error) {
    throwBookingError(error, MESSAGES.BOOKING.LOAD_FAILED);
  }
}

export async function updateBooking(
  bookingId,
  { vehicleId, startDate, endDate },
) {
  try {
    const response = await apiClient.put(
      `${API_CONFIG.BOOKINGS.BASE}/${bookingId}`,
      { vehicleId, startDate, endDate },
    );

    return response.data;
  } catch (error) {
    throwBookingError(error, MESSAGES.BOOKING.UPDATE_FAILED);
  }
}

export async function deleteBooking(bookingId) {
  try {
    const response = await apiClient.delete(
      `${API_CONFIG.BOOKINGS.BASE}/${bookingId}`,
    );

    return response.data;
  } catch (error) {
    throwBookingError(error, MESSAGES.BOOKING.DELETE_FAILED);
  }
}