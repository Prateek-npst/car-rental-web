import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LIMITS } from '@/constants/limits.js';
import { MESSAGES } from '@/constants/messages.js';
import AdminVehiclesPage from '@/pages/AdminVehiclesPage.jsx';
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from '@/services/vehicleService.js';

vi.mock('@/services/vehicleService.js', () => ({
  createVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
  getVehicles: vi.fn(),
  updateVehicle: vi.fn(),
}));

const vehicle = {
  id: 12,
  regNumber: 'NEW-202',
  model: 'New Sedan',
  dailyRate: 85.5,
  location: 'West End',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminVehiclesPage />
    </MemoryRouter>,
  );
}

function fillVehicleForm(values = vehicle) {
  fireEvent.change(
    screen.getByLabelText(MESSAGES.VEHICLES.REG_NUMBER_LABEL),
    { target: { value: values.regNumber } },
  );
  fireEvent.change(screen.getByLabelText(MESSAGES.VEHICLES.MODEL_LABEL), {
    target: { value: values.model },
  });
  fireEvent.change(
    screen.getByLabelText(MESSAGES.VEHICLES.DAILY_RATE_LABEL),
    { target: { value: String(values.dailyRate) } },
  );
  fireEvent.change(screen.getByLabelText(MESSAGES.VEHICLES.LOCATION_LABEL), {
    target: { value: values.location },
  });
}

describe('AdminVehiclesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    getVehicles.mockResolvedValue([vehicle]);
    createVehicle.mockResolvedValue(vehicle);
    updateVehicle.mockResolvedValue(vehicle);
    deleteVehicle.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading state while vehicles are fetched', async () => {
    let resolveVehicles;
    getVehicles.mockReturnValue(
      new Promise((resolve) => {
        resolveVehicles = resolve;
      }),
    );
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.COMMON.LOADING);

    resolveVehicles([vehicle]);
    expect(await screen.findByRole('heading', { name: vehicle.model })).toBeVisible();
  });

  it('lists vehicles with details and management controls', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: vehicle.model })).toBeVisible();
    expect(screen.getByText(vehicle.regNumber)).toBeInTheDocument();
    expect(screen.getByText(vehicle.location)).toBeInTheDocument();
    expect(screen.getByText(String(vehicle.dailyRate))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: MESSAGES.VEHICLES.ADMIN_EDIT })).toBeVisible();
    expect(screen.getByRole('button', { name: MESSAGES.VEHICLES.ADMIN_DELETE })).toBeVisible();
  });

  it('shows an empty state when no vehicles exist', async () => {
    getVehicles.mockResolvedValue([]);
    renderPage();

    expect(await screen.findByRole('status')).toHaveTextContent(
      MESSAGES.VEHICLES.ADMIN_EMPTY,
    );
  });

  it('shows a safe error when the vehicle list fails to load', async () => {
    getVehicles.mockRejectedValue(
      new Error(MESSAGES.VEHICLES.ADMIN_LOAD_FAILED),
    );
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.VEHICLES.ADMIN_LOAD_FAILED,
    );
  });

  it('validates required fields and daily rate limits before creating', async () => {
    getVehicles.mockResolvedValue([]);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: MESSAGES.VEHICLES.ADMIN_ADD }));

    fireEvent.change(screen.getByLabelText(MESSAGES.VEHICLES.DAILY_RATE_LABEL), {
      target: { value: String(LIMITS.VEHICLE.DAILY_RATE_MAX + 1) },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: MESSAGES.VEHICLES.ADMIN_CREATE_SUBMIT,
      }),
    );

    expect(await screen.findByText(MESSAGES.VEHICLES.REG_NUMBER_REQUIRED)).toBeVisible();
    expect(screen.getByText(MESSAGES.VEHICLES.MODEL_REQUIRED)).toBeVisible();
    expect(screen.getByText(MESSAGES.VEHICLES.DAILY_RATE_TOO_HIGH)).toBeVisible();
    expect(screen.getByText(MESSAGES.VEHICLES.LOCATION_REQUIRED)).toBeVisible();
    expect(createVehicle).not.toHaveBeenCalled();
  });

  it('creates a vehicle and refreshes the list', async () => {
    getVehicles.mockResolvedValueOnce([]).mockResolvedValueOnce([vehicle]);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: MESSAGES.VEHICLES.ADMIN_ADD }));
    fillVehicleForm();
    fireEvent.click(
      screen.getByRole('button', {
        name: MESSAGES.VEHICLES.ADMIN_CREATE_SUBMIT,
      }),
    );

    expect(await screen.findByText(MESSAGES.VEHICLES.ADMIN_CREATED)).toBeVisible();
    expect(createVehicle).toHaveBeenCalledWith({
      regNumber: vehicle.regNumber,
      model: vehicle.model,
      dailyRate: vehicle.dailyRate,
      location: vehicle.location,
    });
    expect(await screen.findByRole('heading', { name: vehicle.model })).toBeVisible();
    expect(getVehicles).toHaveBeenCalledTimes(2);
  });

  it('shows a submitting state while creating a vehicle', async () => {
    let resolveCreate;
    createVehicle.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: MESSAGES.VEHICLES.ADMIN_ADD }));
    fillVehicleForm();
    fireEvent.click(
      screen.getByRole('button', {
        name: MESSAGES.VEHICLES.ADMIN_CREATE_SUBMIT,
      }),
    );

    expect(
      await screen.findByRole('button', { name: MESSAGES.COMMON.LOADING }),
    ).toBeDisabled();
    resolveCreate(vehicle);
    expect(await screen.findByText(MESSAGES.VEHICLES.ADMIN_CREATED)).toBeVisible();
  });

  it('edits a vehicle and refreshes the list', async () => {
    const editedVehicle = { ...vehicle, model: 'Updated Sedan', dailyRate: 95 };
    getVehicles.mockResolvedValueOnce([vehicle]).mockResolvedValueOnce([editedVehicle]);
    updateVehicle.mockResolvedValue(editedVehicle);
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: MESSAGES.VEHICLES.ADMIN_EDIT }),
    );
    fillVehicleForm(editedVehicle);
    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.VEHICLES.ADMIN_UPDATE_SUBMIT }),
    );

    expect(await screen.findByText(MESSAGES.VEHICLES.ADMIN_UPDATED)).toBeVisible();
    expect(updateVehicle).toHaveBeenCalledWith(vehicle.id, {
      regNumber: vehicle.regNumber,
      model: editedVehicle.model,
      dailyRate: editedVehicle.dailyRate,
      location: vehicle.location,
    });
    expect(await screen.findByRole('heading', { name: editedVehicle.model })).toBeVisible();
    expect(getVehicles).toHaveBeenCalledTimes(2);
  });

  it('requires confirmation before deleting a vehicle', async () => {
    window.confirm.mockReturnValue(false);
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: MESSAGES.VEHICLES.ADMIN_DELETE }),
    );

    expect(window.confirm).toHaveBeenCalledWith(
      MESSAGES.VEHICLES.ADMIN_CONFIRM_DELETE,
    );
    expect(deleteVehicle).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: vehicle.model })).toBeVisible();
  });

  it('deletes a vehicle after confirmation and refreshes the list', async () => {
    getVehicles.mockResolvedValueOnce([vehicle]).mockResolvedValueOnce([]);
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: MESSAGES.VEHICLES.ADMIN_DELETE }),
    );

    expect(deleteVehicle).toHaveBeenCalledWith(vehicle.id);
    expect(await screen.findByText(MESSAGES.VEHICLES.ADMIN_DELETED)).toBeVisible();
    expect(await screen.findByText(MESSAGES.VEHICLES.ADMIN_EMPTY)).toBeVisible();
    expect(getVehicles).toHaveBeenCalledTimes(2);
  });
});