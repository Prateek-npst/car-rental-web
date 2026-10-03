import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

function getBookingErrorMessage(status) {
  if (status === 400) {
    return MESSAGES.BOOKING.CREATE_VALIDATION_FAILED;
  }

  if (status === 404) {
    return MESSAGES.BOOKING.VEHICLE_NOT_FOUND;
  }

  if (status === 409) {
    return MESSAGES.BOOKING.BOOKING_CONFLICT;
  }

  return MESSAGES.BOOKING.CREATE_FAILED;
}

export async function createBooking({ vehicleId, startDate, endDate }) {
  try {
    const response = await apiClient.post(API_CONFIG.BOOKINGS.CREATE, {
      vehicleId,
      startDate,
      endDate,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      getBookingErrorMessage(error?.response?.status),
      { cause: error },
    );
  }
}