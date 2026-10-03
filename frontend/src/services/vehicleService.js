import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

function getVehicleErrorMessage(status, fallbackMessage) {
  if (status === 400) {
    return MESSAGES.VEHICLES.INVALID_DATA;
  }

  if (status === 404) {
    return MESSAGES.VEHICLES.NOT_FOUND;
  }

  if (status === 409) {
    return MESSAGES.VEHICLES.DUPLICATE_REG_NUMBER;
  }

  if (status === 403) {
    return MESSAGES.VEHICLES.PERMISSION_DENIED;
  }

  return fallbackMessage;
}

async function performVehicleRequest(request, fallbackMessage) {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    throw new Error(
      getVehicleErrorMessage(error?.response?.status, fallbackMessage),
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