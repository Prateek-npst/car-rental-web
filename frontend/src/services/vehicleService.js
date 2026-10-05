import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';
import { resolveApiError } from '@/utils/apiError.js';

async function performVehicleRequest(request, fallbackMessage) {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(
      resolveApiError(error, fallbackMessage, {
        400: MESSAGES.VEHICLES.INVALID_DATA,
        403: MESSAGES.VEHICLES.PERMISSION_DENIED,
        404: MESSAGES.VEHICLES.NOT_FOUND,
        409: MESSAGES.VEHICLES.DUPLICATE_REG_NUMBER,
      }),
      { cause: error },
    );
  }
}

export async function searchAvailableVehicles({
  location,
  pickupDate,
  dropoffDate,
}) {
  return performVehicleRequest(
    () =>
      apiClient.get(API_CONFIG.VEHICLES.SEARCH, {
      params: { location, pickupDate, dropoffDate },
      }),
    MESSAGES.VEHICLES.SEARCH_FAILED,
  );
}

export function getVehicles() {
  return performVehicleRequest(
    () => apiClient.get(API_CONFIG.VEHICLES.BASE),
    MESSAGES.VEHICLES.ADMIN_LOAD_FAILED,
  );
}

export function getVehicleById(vehicleId) {
  return performVehicleRequest(
    () => apiClient.get(`${API_CONFIG.VEHICLES.BASE}/${vehicleId}`),
    MESSAGES.VEHICLES.DETAILS_FAILED,
  );
}

export function createVehicle(vehicleData) {
  return performVehicleRequest(
    () => apiClient.post(API_CONFIG.VEHICLES.BASE, vehicleData),
    MESSAGES.VEHICLES.ADMIN_CREATE_FAILED,
  );
}

export function updateVehicle(vehicleId, vehicleData) {
  return performVehicleRequest(
    () => apiClient.put(`${API_CONFIG.VEHICLES.BASE}/${vehicleId}`, vehicleData),
    MESSAGES.VEHICLES.ADMIN_UPDATE_FAILED,
  );
}

export function deleteVehicle(vehicleId) {
  return performVehicleRequest(
    () => apiClient.delete(`${API_CONFIG.VEHICLES.BASE}/${vehicleId}`),
    MESSAGES.VEHICLES.ADMIN_DELETE_FAILED,
  );
}