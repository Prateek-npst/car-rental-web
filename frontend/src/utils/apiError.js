export function resolveApiError(error, fallbackMessage, statusMessages = {}) {
  if (error?.code === 'ERR_NETWORK') {
    return fallbackMessage;
  }

  const status = error?.response?.status;

  if (status && statusMessages[status]) {
    return statusMessages[status];
  }

  return fallbackMessage;
}
