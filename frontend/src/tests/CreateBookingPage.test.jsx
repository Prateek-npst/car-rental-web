import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { LIMITS } from '@/constants/limits.js';
import { ROUTES } from '@/constants/routes.js';
import { MOCK_VEHICLES } from '@/features/vehicles/vehicleMockData.js';
import CreateBookingPage from '@/pages/CreateBookingPage.jsx';
import { createBooking } from '@/services/bookingService.js';
import { getTodayDateInputValue } from '@/utils/bookingDates.js';

vi.mock('@/services/bookingService.js', () => ({
  createBooking: vi.fn(),
}));

function renderCreateBookingPage(vehicle) {
  const initialEntry = vehicle
    ? { pathname: ROUTES.CREATE_BOOKING, state: { vehicle } }
    : ROUTES.CREATE_BOOKING;

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={ROUTES.CREATE_BOOKING} element={<CreateBookingPage />} />
        <Route path={ROUTES.VEHICLES} element={<h1>Vehicles page</h1>} />
        <Route path={ROUTES.BOOKINGS} element={<h1>My Bookings page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillBookingForm(startDate, endDate) {
  fireEvent.change(screen.getByLabelText(MESSAGES.BOOKING.START_DATE_LABEL), {
    target: { value: startDate },
  });
  fireEvent.change(screen.getByLabelText(MESSAGES.BOOKING.END_DATE_LABEL), {
    target: { value: endDate },
  });
}

describe('CreateBookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the selected vehicle details and booking fields', () => {
    const vehicle = MOCK_VEHICLES[2];
    renderCreateBookingPage(vehicle);

    expect(
      screen.getByRole('heading', { name: MESSAGES.BOOKING.VEHICLE_DETAILS }),
    ).toBeInTheDocument();
    expect(screen.getByText(vehicle.model)).toBeInTheDocument();
    expect(screen.getByText(vehicle.regNumber)).toBeInTheDocument();
    expect(screen.getByText(vehicle.location)).toBeInTheDocument();
    expect(screen.getByText(String(vehicle.dailyRate))).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.BOOKING.START_DATE_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.BOOKING.START_DATE_LABEL),
    ).toHaveAttribute('min', getTodayDateInputValue());
    expect(
      screen.getByLabelText(MESSAGES.BOOKING.END_DATE_LABEL),
    ).toHaveAttribute('max', LIMITS.BOOKING.MAX_DATE);
    expect(
      screen.getByLabelText(MESSAGES.BOOKING.END_DATE_LABEL),
    ).toBeInTheDocument();
  });

  it('shows required errors when booking dates are empty', async () => {
    renderCreateBookingPage(MOCK_VEHICLES[0]);

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(
      await screen.findAllByText(MESSAGES.COMMON.REQUIRED_FIELD),
    ).toHaveLength(2);
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('rejects an end date that is not after the start date', async () => {
    renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm('2026-10-10', '2026-10-10');

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(
      await screen.findByText(MESSAGES.BOOKING.DATE_AFTER_START),
    ).toBeVisible();
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('rejects dates before today and beyond the maximum booking date', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayValue = getTodayDateInputValue(yesterday);
    const today = getTodayDateInputValue();

    const { unmount } = renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm(yesterdayValue, today);
    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );
    expect(
      await screen.findByText(MESSAGES.BOOKING.DATE_BEFORE_TODAY),
    ).toBeVisible();
    expect(createBooking).not.toHaveBeenCalled();
    unmount();

    renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm('2050-12-30', '2051-01-01');
    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );
    expect(
      await screen.findByText(MESSAGES.BOOKING.DATE_AFTER_MAX),
    ).toBeVisible();
    expect(createBooking).not.toHaveBeenCalled();
  });

  it('accepts today as the booking start date', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    createBooking.mockResolvedValue({ id: 17 });
    renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm(getTodayDateInputValue(), getTodayDateInputValue(tomorrow));

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(await screen.findByText(MESSAGES.BOOKING.CREATED)).toBeVisible();
    expect(createBooking).toHaveBeenCalledOnce();
  });

  it('accepts the maximum allowed drop-off date', async () => {
    createBooking.mockResolvedValue({ id: 17 });
    renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm('2050-12-30', LIMITS.BOOKING.MAX_DATE);

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(await screen.findByText(MESSAGES.BOOKING.CREATED)).toBeVisible();
    expect(createBooking).toHaveBeenCalledOnce();
  });

  it('creates a booking with only the vehicle ID and validated dates', async () => {
    const vehicle = { ...MOCK_VEHICLES[0], id: 42 };
    createBooking.mockResolvedValue({ id: 17, vehicleId: vehicle.id });
    renderCreateBookingPage(vehicle);
    fillBookingForm('2026-10-10', '2026-10-12');

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(await screen.findByText(MESSAGES.BOOKING.CREATED)).toBeVisible();
    expect(createBooking).toHaveBeenCalledWith({
      vehicleId: vehicle.id,
      startDate: '2026-10-10',
      endDate: '2026-10-12',
    });
    expect(screen.getByText(vehicle.model)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: MESSAGES.BOOKING.VIEW_MY_BOOKINGS,
      }),
    ).toHaveAttribute('href', ROUTES.BOOKINGS);
  });

  it('shows loading state and disables duplicate submission while pending', async () => {
    let resolveBooking;
    createBooking.mockReturnValue(
      new Promise((resolve) => {
        resolveBooking = resolve;
      }),
    );
    renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm('2026-10-10', '2026-10-12');

    const form = screen
      .getByLabelText(MESSAGES.BOOKING.START_DATE_LABEL)
      .closest('form');
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(
      await screen.findByRole('button', { name: MESSAGES.COMMON.LOADING }),
    ).toBeDisabled();
    expect(createBooking).toHaveBeenCalledTimes(1);

    resolveBooking({ id: 17 });
    expect(await screen.findByText(MESSAGES.BOOKING.CREATED)).toBeVisible();
  });

  it('shows a safe message when the API rejects booking creation', async () => {
    createBooking.mockRejectedValue(
      new Error(MESSAGES.BOOKING.BOOKING_CONFLICT),
    );
    renderCreateBookingPage(MOCK_VEHICLES[0]);
    fillBookingForm('2026-10-10', '2026-10-12');

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.BOOKING.BOOKING_CONFLICT,
    );
    expect(screen.queryByText('Internal server details')).toBeNull();
  });

  it('asks the user to select a vehicle when route state is missing', () => {
    renderCreateBookingPage();

    expect(screen.getByRole('status')).toHaveTextContent(
      MESSAGES.BOOKING.NO_VEHICLE_SELECTED,
    );
    expect(
      screen.getByRole('link', { name: MESSAGES.BOOKING.BACK_TO_VEHICLES }),
    ).toHaveAttribute('href', ROUTES.VEHICLES);
    expect(
      screen.queryByLabelText(MESSAGES.BOOKING.START_DATE_LABEL),
    ).not.toBeInTheDocument();
  });
});
