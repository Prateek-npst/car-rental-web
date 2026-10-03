import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

export async function login(credentials) {
  try {
    const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, credentials);

    return response.data;
  } catch (error) {
    if (error?.response?.status === 401) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS, { cause: error });
    }

    throw new Error(MESSAGES.COMMON.SERVER_ERROR, { cause: error });
  }
}

export async function register(registrationData) {
  try {
    const response = await apiClient.post(
      API_CONFIG.AUTH.REGISTER,
      registrationData,
    );

    return response.data;
  } catch (error) {
    if (
      [400, 409, 422].includes(error?.response?.status) ||
      error?.response?.status === 500
    ) {
      throw new Error(MESSAGES.AUTH.REGISTRATION_FAILED, { cause: error });
    }

    throw new Error(MESSAGES.AUTH.REGISTRATION_FAILED, { cause: error });
  }
}
