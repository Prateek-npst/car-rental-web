import { API_CONFIG, apiClient } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

export async function login(credentials) {
  try {
    const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, credentials);

    return response.data;
  } catch (error) {
    if (error?.code === 'ERR_NETWORK') {
      throw new Error(MESSAGES.AUTH.NETWORK_LOGIN_ERROR, { cause: error });
    }

    if (error?.response?.status === 401) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS, { cause: error });
    }

    if (error?.response?.status === 400) {
      throw new Error(MESSAGES.AUTH.INVALID_CREDENTIALS, { cause: error });
    }

    throw new Error(MESSAGES.AUTH.NETWORK_LOGIN_ERROR, { cause: error });
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
    if (error?.code === 'ERR_NETWORK') {
      throw new Error(MESSAGES.AUTH.REGISTRATION_NETWORK_ERROR, { cause: error });
    }

    if (error?.response?.status === 409) {
      throw new Error(MESSAGES.AUTH.REGISTRATION_DUPLICATE_EMAIL, {
        cause: error,
      });
    }

    if (error?.response?.status === 400 || error?.response?.status === 500) {
      throw new Error(MESSAGES.AUTH.REGISTRATION_FAILED, { cause: error });
    }

    throw new Error(MESSAGES.AUTH.REGISTRATION_NETWORK_ERROR, { cause: error });
  }
}
