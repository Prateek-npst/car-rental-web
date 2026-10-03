import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { createBooking } from '@/services/bookingService.js';
import { API_CONFIG, apiClient } from '@/config/api.js';

vi.mock('@/config/api.js', () => ({
  API_CONFIG: {
    BOOKINGS: {
      CREATE: '/bookings',
    },
  },
  apiClient: {
    post: vi.fn(),
  },
}));

const bookingRequest = {
  vehicleId: 42,
  startDate: '2026-10-10',
  endDate: '2026-10-12',
};

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts only vehicle ID and booking dates to the create endpoint', async () => {
    const bookingResponse = { id: 17, ...bookingRequest };
    apiClient.post.mockResolvedValue({ data: bookingResponse });

    await expect(createBooking(bookingRequest)).resolves.toBe(bookingResponse);

    expect(apiClient.post).toHaveBeenCalledWith(
      API_CONFIG.BOOKINGS.CREATE,
      bookingRequest,
    );
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty('userId');
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty('customerName');
  });

  it.each([
    [400, MESSAGES.BOOKING.CREATE_VALIDATION_FAILED],
    [404, MESSAGES.BOOKING.VEHICLE_NOT_FOUND],
    [409, MESSAGES.BOOKING.BOOKING_CONFLICT],
    [401, MESSAGES.BOOKING.CREATE_FAILED],
    [500, MESSAGES.BOOKING.CREATE_FAILED],
  ])('maps HTTP %s to a safe message', async (status, message) => {
    apiClient.post.mockRejectedValue({
      response: { status, data: { message: 'Internal server details' } },
    });

    await expect(createBooking(bookingRequest)).rejects.toThrow(message);
    await expect(createBooking(bookingRequest)).rejects.not.toThrow(
      'Internal server details',
    );
  });
});