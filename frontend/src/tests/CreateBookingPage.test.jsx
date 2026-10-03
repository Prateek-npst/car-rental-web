import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { MOCK_VEHICLES } from '@/features/vehicles/vehicleMockData.js';
import CreateBookingPage from '@/pages/CreateBookingPage.jsx';

function renderCreateBookingPage(vehicle) {
  const initialEntry = vehicle
    ? { pathname: ROUTES.CREATE_BOOKING, state: { vehicle } }
    : ROUTES.CREATE_BOOKING;

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={ROUTES.CREATE_BOOKING} element={<CreateBookingPage />} />
        <Route path={ROUTES.VEHICLES} element={<h1>Vehicles page</h1>} />
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
    expect(
      screen.queryByText(MESSAGES.BOOKING.READY_TO_SUBMIT),
    ).not.toBeInTheDocument();
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
  });

  it('shows a frontend-only confirmation and keeps dates visible', async () => {
    const vehicle = MOCK_VEHICLES[0];
    renderCreateBookingPage(vehicle);
    fillBookingForm('2026-10-10', '2026-10-12');

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.BOOKING.SUBMIT }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      MESSAGES.BOOKING.READY_TO_SUBMIT,
    );
    expect(screen.getByText('2026-10-10')).toBeInTheDocument();
    expect(screen.getByText('2026-10-12')).toBeInTheDocument();
    expect(screen.getByText(vehicle.model)).toBeInTheDocument();
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
