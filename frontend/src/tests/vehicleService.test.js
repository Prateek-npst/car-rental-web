import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { searchAvailableVehicles } from '@/services/vehicleService.js';
import { API_CONFIG, apiClient } from '@/config/api.js';

vi.mock('@/config/api.js', () => ({
  API_CONFIG: {
    VEHICLES: {
      SEARCH: '/vehicles/search',
    },
  },
  apiClient: {
    get: vi.fn(),
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
});