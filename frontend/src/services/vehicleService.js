import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

export async function searchAvailableVehicles({
  location,
  pickupDate,
  dropoffDate,
}) {
  try {
    const response = await apiClient.get(API_CONFIG.VEHICLES.SEARCH, {
      params: { location, pickupDate, dropoffDate },
    });

    return response.data;
  } catch (error) {
    throw new Error(MESSAGES.VEHICLES.SEARCH_FAILED, { cause: error });
  }
}