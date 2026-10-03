import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
} from '@/services/bookingService.js';
import { API_CONFIG, apiClient } from '@/config/api.js';

vi.mock('@/config/api.js', () => ({
  API_CONFIG: {
    BOOKINGS: {
      BASE: '/bookings',
    },
  },
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
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

  it('posts only vehicle ID and dates to the create endpoint', async () => {
    const bookingResponse = { id: 17, ...bookingRequest };
    apiClient.post.mockResolvedValue({ data: bookingResponse });

    await expect(createBooking(bookingRequest)).resolves.toBe(bookingResponse);

    expect(apiClient.post).toHaveBeenCalledWith(
      API_CONFIG.BOOKINGS.BASE,
      bookingRequest,
    );
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty('userId');
    expect(apiClient.post.mock.calls[0][1]).not.toHaveProperty('customerName');
  });

  it('gets the authenticated bookings list without user ID parameters', async () => {
    const bookings = [{ id: 17 }];
    apiClient.get.mockResolvedValue({ data: bookings });

    await expect(getBookings()).resolves.toBe(bookings);

    expect(apiClient.get).toHaveBeenCalledWith(API_CONFIG.BOOKINGS.BASE);
  });

  it('updates a booking with the expected endpoint and request body', async () => {
    const updatedBooking = { id: 17, ...bookingRequest };
    apiClient.put.mockResolvedValue({ data: updatedBooking });

    await expect(updateBooking(17, bookingRequest)).resolves.toBe(updatedBooking);

    expect(apiClient.put).toHaveBeenCalledWith(
      `${API_CONFIG.BOOKINGS.BASE}/17`,
      bookingRequest,
    );
    expect(apiClient.put.mock.calls[0][1]).not.toHaveProperty('userId');
  });

  it('deletes a booking at its ID endpoint', async () => {
    apiClient.delete.mockResolvedValue({ data: undefined });

    await expect(deleteBooking(17)).resolves.toBeUndefined();

    expect(apiClient.delete).toHaveBeenCalledWith(
      `${API_CONFIG.BOOKINGS.BASE}/17`,
    );
  });

  it.each([
    [400, MESSAGES.BOOKING.CREATE_VALIDATION_FAILED],
    [404, MESSAGES.BOOKING.NOT_FOUND],
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