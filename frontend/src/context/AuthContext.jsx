import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import * as authService from '@/services/authService.js';
import { MESSAGES } from '@/constants/messages.js';
import {
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from '@/utils/tokenStorage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(null);

  async function login(credentials) {
    const response = await authService.login(credentials);
    const authToken = response?.token;

    if (!authToken) {
      throw new Error(MESSAGES.COMMON.SERVER_ERROR);
    }

    setAuthToken(authToken);
    setToken(authToken);
    setUser(null);

    return response;
  }

  function logout() {
    removeAuthToken();
    setToken(null);
    setUser(null);
  }

  function register(registrationData) {
    return authService.register(registrationData);
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// The hook is exported here with its provider as required by the context API.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
