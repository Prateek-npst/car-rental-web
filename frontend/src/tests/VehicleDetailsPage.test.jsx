import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VehicleDetailsPage from '@/pages/VehicleDetailsPage.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { getVehicleById } from '@/services/vehicleService.js';

vi.mock('@/services/vehicleService.js', () => ({
  getVehicleById: vi.fn(),
}));

const vehicle = {
  id: 42,
  regNumber: 'API-042',
  model: 'Backend Sedan',
  dailyRate: 87.5,
  location: 'Central City',
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/vehicles/42']}>
      <Routes>
        <Route path={ROUTES.VEHICLE_DETAILS} element={<VehicleDetailsPage />} />
        <Route
          path={ROUTES.CREATE_BOOKING}
          element={<h1>Booking for selected vehicle</h1>}
        />
        <Route path={ROUTES.VEHICLES} element={<h1>Vehicles</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VehicleDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getVehicleById.mockResolvedValue(vehicle);
  });

  it('shows loading while the vehicle request is pending', () => {
    getVehicleById.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.COMMON.LOADING);
  });

  it('shows the vehicle image and API-provided details', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: vehicle.model })).toBeVisible();
    expect(screen.getByRole('img', { name: `${vehicle.model} vehicle` })).toHaveAttribute(
      'src',
      expect.stringContaining('images.unsplash.com'),
    );
    expect(screen.getByText(vehicle.regNumber)).toBeVisible();
    expect(screen.getByText(vehicle.location)).toBeVisible();
    expect(screen.getByText(`${vehicle.dailyRate} / day`)).toBeVisible();
    expect(getVehicleById).toHaveBeenCalledWith('42');
  });

  it('shows a safe error when the details API fails', async () => {
    getVehicleById.mockRejectedValue(new Error('backend error'));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.VEHICLES.DETAILS_FAILED,
    );
  });

  it('shows a not-found state for a 404 response', async () => {
    getVehicleById.mockRejectedValue(
      new Error('not found', { cause: { response: { status: 404 } } }),
    );
    renderPage();

    expect(
      await screen.findByText(MESSAGES.VEHICLES.DETAILS_NOT_FOUND),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: MESSAGES.VEHICLES.BACK_TO_VEHICLES }),
    ).toHaveAttribute('href', ROUTES.VEHICLES);
  });

  it('continues to booking with the loaded vehicle', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: MESSAGES.VEHICLES.CONTINUE_TO_BOOKING,
      }),
    );

    expect(
      screen.getByRole('heading', { name: 'Booking for selected vehicle' }),
    ).toBeVisible();
  });
});