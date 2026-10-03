import { API_CONFIG } from '@/config/api.js';
import { MESSAGES } from '@/constants/messages.js';

async function post(endpoint, data) {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(MESSAGES.COMMON.SERVER_ERROR);
  }

  return response.json();
}

export function login(credentials) {
  return post(API_CONFIG.AUTH.LOGIN, credentials);
}

export function register(registrationData) {
  return post(API_CONFIG.AUTH.REGISTER, registrationData);
}
