import {
  API_CONFIG,
  apiClient,
  logoutAuthSession,
  refreshAuthSession,
} from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';
import { resolveApiError } from '@/utils/apiError.js';

export async function login(credentials) {
  try {
    const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, credentials, {
      headers: { 'X-Auth-Action': 'login' },
    });

    return response.data;
  } catch (error) {
    const message = resolveApiError(error, MESSAGES.AUTH.NETWORK_LOGIN_ERROR, {
      400: MESSAGES.AUTH.INVALID_CREDENTIALS,
      401: MESSAGES.AUTH.INVALID_CREDENTIALS,
    });

    throw new Error(message, { cause: error });
  }
}

export async function refresh() {
  return refreshAuthSession();
}

export function logout() {
  return logoutAuthSession();
}

export async function register(registrationData) {
  try {
    const response = await apiClient.post(
      API_CONFIG.AUTH.REGISTER,
      registrationData,
    );

    return response.data;
  } catch (error) {
    const message = resolveApiError(error, MESSAGES.AUTH.REGISTRATION_NETWORK_ERROR, {
      400: MESSAGES.AUTH.REGISTRATION_FAILED,
      409: MESSAGES.AUTH.REGISTRATION_DUPLICATE_EMAIL,
      500: MESSAGES.AUTH.REGISTRATION_FAILED,
    });

    throw new Error(message, { cause: error });
  }
}
