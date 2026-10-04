import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';
import MyBookingsPage from '@/pages/MyBookingsPage.jsx';
import {
  deleteBooking,
  getBookings,
  updateBooking,
} from '@/services/bookingService.js';

vi.mock('@/services/bookingService.js', () => ({
  deleteBooking: vi.fn(),
  getBookings: vi.fn(),
  updateBooking: vi.fn(),
}));

const { authState } = vi.hoisted(() => ({ authState: { user: null } }));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authState,
}));

const booking = {
  id: 17,
  userId: 5,
  vehicleId: 42,
  startDate: '2026-11-01',
  endDate: '2026-11-03',
  vehicle: {
    id: 42,
    model: 'Backend Sedan',
    regNumber: 'API-042',
    location: 'Central City',
    dailyRate: 87.5,
  },
};

function renderPage(role = ROLES.USER) {
  authState.user = { id: 5, role };
  return render(<MyBookingsPage />);
}

describe('MyBookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    getBookings.mockResolvedValue([booking]);
    updateBooking.mockResolvedValue(booking);
    deleteBooking.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading state while bookings are fetched', async () => {
    let resolveBookings;
    getBookings.mockReturnValue(
      new Promise((resolve) => {
        resolveBookings = resolve;
      }),
    );
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      MESSAGES.COMMON.LOADING,
    );

    resolveBookings([booking]);
    expect(
      await screen.findByRole('heading', { name: booking.vehicle.model }),
    ).toBeVisible();
  });

  it('uses My Bookings as the USER page title', () => {
    renderPage(ROLES.USER);

    expect(
      screen.getByRole('heading', { name: MESSAGES.BOOKING.MY_BOOKINGS_TITLE }),
    ).toBeVisible();
  });

  it('uses All Bookings as the ADMIN page title', () => {
    renderPage(ROLES.ADMIN);

    expect(
      screen.getByRole('heading', {
        name: MESSAGES.BOOKING.ALL_BOOKINGS_TITLE,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(MESSAGES.BOOKING.ALL_BOOKINGS_DESCRIPTION),
    ).toBeVisible();
  });

  it('displays booking and vehicle details from the backend', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: booking.vehicle.model }),
    ).toBeVisible();
    expect(screen.getByText(String(booking.id))).toBeInTheDocument();
    expect(screen.getByText(booking.vehicle.regNumber)).toBeInTheDocument();
    expect(screen.getByText(booking.vehicle.location)).toBeInTheDocument();
    expect(screen.getByText(booking.startDate)).toBeInTheDocument();
    expect(screen.getByText(booking.endDate)).toBeInTheDocument();
  });

  it('shows an empty state when the backend returns no bookings', async () => {
    getBookings.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByRole('status')).toHaveTextContent(
      MESSAGES.BOOKING.EMPTY_LIST,
    );
  });

  it('shows a safe error when listing bookings fails', async () => {
    getBookings.mockRejectedValue(new Error(MESSAGES.BOOKING.LOAD_FAILED));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.BOOKING.LOAD_FAILED,
    );
  });

  it('updates booking dates and refreshes the list', async () => {
    const updatedBooking = {
      ...booking,
      startDate: '2026-11-05',
      endDate: '2026-11-07',
    };
    getBookings
      .mockResolvedValueOnce([booking])
      .mockResolvedValueOnce([updatedBooking]);
    updateBooking.mockResolvedValue(updatedBooking);
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: MESSAGES.BOOKING.EDIT }),
    );
    fireEvent.change(screen.getByLabelText(MESSAGES.BOOKING.START_DATE_LABEL), {
      target: { value: updatedBooking.startDate },
    });
    fireEvent.change(screen.getByLabelText(MESSAGES.BOOKING.END_DATE_LABEL), {
      target: { value: updatedBooking.endDate },
    });
    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.UPDATE }),
    );

    await waitFor(() => {
      expect(updateBooking).toHaveBeenCalledWith(booking.id, {
        vehicleId: booking.vehicleId,
        startDate: updatedBooking.startDate,
        endDate: updatedBooking.endDate,
      });
      expect(getBookings).toHaveBeenCalledTimes(2);
    });
    expect(
      await screen.findByText(updatedBooking.startDate),
    ).toBeInTheDocument();
    expect(screen.getByText(MESSAGES.BOOKING.UPDATED)).toBeVisible();
  });

  it('requires confirmation before cancelling a booking', async () => {
    window.confirm.mockReturnValue(false);
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: MESSAGES.BOOKING.CANCEL_BOOKING,
      }),
    );

    expect(window.confirm).toHaveBeenCalledWith(
      MESSAGES.BOOKING.CONFIRM_CANCEL,
    );
    expect(deleteBooking).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: booking.vehicle.model }),
    ).toBeVisible();
  });

  it('cancels after confirmation and refreshes the booking list', async () => {
    getBookings.mockResolvedValueOnce([booking]).mockResolvedValueOnce([]);
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: MESSAGES.BOOKING.CANCEL_BOOKING,
      }),
    );

    expect(deleteBooking).toHaveBeenCalledWith(booking.id);
    expect(await screen.findByText(MESSAGES.BOOKING.EMPTY_LIST)).toBeVisible();
    expect(getBookings).toHaveBeenCalledTimes(2);
    expect(screen.getByText(MESSAGES.BOOKING.DELETED)).toBeVisible();
  });
});
