import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  searchAvailableVehicles,
  updateVehicle,
} from '@/services/vehicleService.js';
import { API_CONFIG, apiClient } from '@/config/api.js';

vi.mock('@/config/api.js', () => ({
  API_CONFIG: {
    VEHICLES: {
      BASE: '/vehicles',
      SEARCH: '/vehicles/search',
    },
  },
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('vehicleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('searches with the backend query parameter names and returns response data', async () => {
    const criteria = {
      location: 'Central City',
      pickupDate: '2026-10-10',
      dropoffDate: '2026-10-12',
    };
    const vehicles = [{ id: 42, model: 'Backend Sedan' }];
    apiClient.get.mockResolvedValue({ data: vehicles });

    await expect(searchAvailableVehicles(criteria)).resolves.toBe(vehicles);

    expect(apiClient.get).toHaveBeenCalledWith(API_CONFIG.VEHICLES.SEARCH, {
      params: {
        location: 'Central City',
        pickupDate: '2026-10-10',
        dropoffDate: '2026-10-12',
      },
    });
  });

  it('maps API failures to a safe user-facing message', async () => {
    apiClient.get.mockRejectedValue(new Error('Internal database details'));

    await expect(
      searchAvailableVehicles({
        location: 'Central City',
        pickupDate: '2026-10-10',
        dropoffDate: '2026-10-12',
      }),
    ).rejects.toThrow(MESSAGES.VEHICLES.SEARCH_FAILED);
  });

  it('lists vehicles through the centralized API endpoint', async () => {
    const vehicles = [{ id: 42, model: 'Backend Sedan' }];
    apiClient.get.mockResolvedValue({ data: vehicles });

    await expect(getVehicles()).resolves.toBe(vehicles);

    expect(apiClient.get).toHaveBeenCalledWith(API_CONFIG.VEHICLES.BASE);
  });

  it('loads one vehicle through its authenticated ID endpoint', async () => {
    const vehicle = { id: 42, model: 'Backend Sedan' };
    apiClient.get.mockResolvedValue({ data: vehicle });

    await expect(getVehicleById(42)).resolves.toBe(vehicle);

    expect(apiClient.get).toHaveBeenCalledWith('/vehicles/42');
  });

  it('creates a vehicle with the submitted fields', async () => {
    const vehicleData = {
      regNumber: 'NEW-202',
      model: 'New Sedan',
      dailyRate: 85.5,
      location: 'West End',
    };
    const vehicle = { id: 12, ...vehicleData };
    apiClient.post.mockResolvedValue({ data: vehicle });

    await expect(createVehicle(vehicleData)).resolves.toBe(vehicle);

    expect(apiClient.post).toHaveBeenCalledWith(
      API_CONFIG.VEHICLES.BASE,
      vehicleData,
    );
  });

  it('updates and deletes vehicles at their ID endpoints', async () => {
    const vehicleData = {
      regNumber: 'NEW-202',
      model: 'Updated Sedan',
      dailyRate: 90,
      location: 'North Harbor',
    };
    const vehicle = { id: 12, ...vehicleData };
    apiClient.put.mockResolvedValue({ data: vehicle });
    apiClient.delete.mockResolvedValue({ data: undefined });

    await expect(updateVehicle(12, vehicleData)).resolves.toBe(vehicle);
    await expect(deleteVehicle(12)).resolves.toBeUndefined();

    expect(apiClient.put).toHaveBeenCalledWith(
      `${API_CONFIG.VEHICLES.BASE}/12`,
      vehicleData,
    );
    expect(apiClient.delete).toHaveBeenCalledWith(
      `${API_CONFIG.VEHICLES.BASE}/12`,
    );
  });

  it.each([
    [400, MESSAGES.VEHICLES.INVALID_DATA],
    [403, MESSAGES.VEHICLES.PERMISSION_DENIED],
    [404, MESSAGES.VEHICLES.NOT_FOUND],
    [409, MESSAGES.VEHICLES.DUPLICATE_REG_NUMBER],
  ])('maps HTTP %s to a safe vehicle message', async (status, message) => {
    apiClient.post.mockRejectedValue({
      response: { status, data: { message: 'Internal backend details' } },
    });

    await expect(
      createVehicle({
        regNumber: 'NEW-202',
        model: 'New Sedan',
        dailyRate: 85.5,
        location: 'West End',
      }),
    ).rejects.toThrow(message);
  });
});