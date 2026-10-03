import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import CreateBookingPage from '@/pages/CreateBookingPage.jsx';
import VehiclesPage from '@/pages/VehiclesPage.jsx';

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

  it('shows matching available vehicles and the submitted criteria', async () => {
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
      screen.getByRole('heading', { name: 'City Sedan' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'City Compact' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Trail SUV' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('CC-202')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('treats a booking drop-off date as occupied', async () => {
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-15',
      dropoffDate: '2026-10-16',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findByRole('heading', { name: 'City Sedan' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'City Compact' }),
    ).not.toBeInTheDocument();
  });

  it('keeps a vehicle available when the search starts the day after a booking', async () => {
    renderVehiclesPage();
    fillSearchForm({
      location: 'Central City',
      pickupDate: '2026-10-16',
      dropoffDate: '2026-10-17',
    });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.SEARCH }),
    );

    expect(
      await screen.findByRole('heading', { name: 'City Compact' }),
    ).toBeInTheDocument();
  });

  it('displays an empty state when no available vehicles match', async () => {
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

  it('opens booking creation with the selected vehicle', async () => {
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
      name: 'City Compact',
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
    expect(screen.getByText('City Compact')).toBeInTheDocument();
    expect(screen.getByText('CC-101')).toBeInTheDocument();
  });
});
