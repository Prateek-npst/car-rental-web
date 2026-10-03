import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import CreateBookingPage from '@/pages/CreateBookingPage.jsx';
import VehiclesPage from '@/pages/VehiclesPage.jsx';
import { searchAvailableVehicles } from '@/services/vehicleService.js';

vi.mock('@/services/vehicleService.js', () => ({
  searchAvailableVehicles: vi.fn(),
}));

const backendVehicle = {
  id: 42,
  regNumber: 'API-042',
  model: 'Backend Sedan',
  dailyRate: 87.5,
  location: 'Central City',
};

function renderVehiclesPage() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.VEHICLES]}>
      <Routes>
        <Route path={ROUTES.VEHICLES} element={<VehiclesPage />} />
        <Route path={ROUTES.CREATE_BOOKING} element={<CreateBookingPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillSearchForm({ location, pickupDate, dropoffDate }) {
  fireEvent.change(screen.getByLabelText(MESSAGES.VEHICLES.LOCATION_LABEL), {
    target: { value: location },
  });
  fireEvent.change(screen.getByLabelText(MESSAGES.VEHICLES.PICKUP_DATE_LABEL), {
    target: { value: pickupDate },
  });
  fireEvent.change(
    screen.getByLabelText(MESSAGES.VEHICLES.DROPOFF_DATE_LABEL),
    { target: { value: dropoffDate } },
  );
}

describe('VehiclesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the location and date search fields', () => {
    renderVehiclesPage();

    expect(
      screen.getByRole('textbox', { name: MESSAGES.VEHICLES.LOCATION_LABEL }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.VEHICLES.PICKUP_DATE_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.VEHICLES.DROPOFF_DATE_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    ).toBeInTheDocument();
  });

  it('shows required-field errors for an empty search', async () => {
    renderVehiclesPage();

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findAllByText(MESSAGES.COMMON.REQUIRED_FIELD),
    ).toHaveLength(3);
    expect(
      screen.queryByRole('heading', {
        name: MESSAGES.VEHICLES.SEARCH_CRITERIA,
      }),
    ).not.toBeInTheDocument();
  });

  it('rejects a drop-off date that is not after pickup', async () => {
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-10',
      dropoffDate: '2026-10-10',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findByText(MESSAGES.VEHICLES.DROPOFF_DATE_AFTER_PICKUP),
    ).toBeVisible();
    expect(
      screen.queryByRole('heading', {
        name: MESSAGES.VEHICLES.SEARCH_CRITERIA,
      }),
    ).not.toBeInTheDocument();
  });

  it('displays backend vehicles and the submitted criteria', async () => {
    searchAvailableVehicles.mockResolvedValue([backendVehicle]);
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-10',
      dropoffDate: '2026-10-12',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findByRole('heading', {
        name: MESSAGES.VEHICLES.SEARCH_CRITERIA,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Central City')).toHaveLength(2);
    expect(screen.getByText('2026-10-10')).toBeInTheDocument();
    expect(screen.getByText('2026-10-12')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Backend Sedan' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'City Compact' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Trail SUV' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('API-042')).toBeInTheDocument();
    expect(screen.getByText('87.5')).toBeInTheDocument();
    expect(searchAvailableVehicles).toHaveBeenCalledWith({
      location: 'Central City',
      pickupDate: '2026-10-10',
      dropoffDate: '2026-10-12',
    });
  });

  it('shows a loading state while the API request is pending', async () => {
    let resolveSearch;
    searchAvailableVehicles.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-10',
      dropoffDate: '2026-10-12',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(await screen.findByText(MESSAGES.COMMON.LOADING)).toBeVisible();
    expect(
      screen.getByRole('button', { name: MESSAGES.COMMON.LOADING }),
    ).toBeDisabled();

    resolveSearch([backendVehicle]);
    expect(
      await screen.findByRole('heading', { name: 'Backend Sedan' }),
    ).toBeInTheDocument();
  });

  it('displays an empty state when no available vehicles match', async () => {
    searchAvailableVehicles.mockResolvedValue([]);
    renderVehiclesPage();
    fillSearchForm({
      location: 'West End',
      pickupDate: '2026-10-16',
      dropoffDate: '2026-10-17',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findByText(MESSAGES.VEHICLES.NO_AVAILABLE_VEHICLES),
    ).toBeInTheDocument();
  });

  it('displays a safe error when the API request fails', async () => {
    searchAvailableVehicles.mockRejectedValue(
      new Error('Internal database details'),
    );
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-10',
      dropoffDate: '2026-10-12',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.VEHICLES.SEARCH_FAILED,
    );
    expect(screen.queryByText('Internal database details')).toBeNull();
  });

  it('does not call the API when form values are invalid', async () => {
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-12',
      dropoffDate: '2026-10-12',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findByText(MESSAGES.VEHICLES.DROPOFF_DATE_AFTER_PICKUP),
    ).toBeVisible();
    expect(searchAvailableVehicles).not.toHaveBeenCalled();
  });

  it('opens booking creation with the selected vehicle', async () => {
    searchAvailableVehicles.mockResolvedValue([backendVehicle]);
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-16',
      dropoffDate: '2026-10-17',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    const vehicleTitle = await screen.findByRole('heading', {
      name: 'Backend Sedan',
    });
    fireEvent.click(
      within(vehicleTitle.closest('article')).getByRole('button', {
        name: MESSAGES.VEHICLES.SELECT_VEHICLE,
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: MESSAGES.BOOKING.VEHICLE_DETAILS,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Backend Sedan')).toBeInTheDocument();
    expect(screen.getByText('API-042')).toBeInTheDocument();
  });
});
