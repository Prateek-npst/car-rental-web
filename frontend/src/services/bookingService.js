import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';
import { resolveApiError } from '@/utils/apiError.js';

function throwBookingError(error, fallbackMessage) {
  throw new Error(
    resolveApiError(error, fallbackMessage, {
      400: MESSAGES.BOOKING.CREATE_VALIDATION_FAILED,
      403: MESSAGES.BOOKING.PERMISSION_DENIED,
      404: MESSAGES.BOOKING.NOT_FOUND,
      409: MESSAGES.BOOKING.BOOKING_CONFLICT,
    }),
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