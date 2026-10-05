import { createContext, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as authService from '@/services/authService.js';
import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';
import {
  getAuthProfile,
  removeAuthProfile,
  setAuthProfile,
} from '@/utils/authProfileStorage.js';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/utils/tokenStorage.js';

const AuthContext = createContext(null);

function getUserFromToken(token) {
  try {
    const encodedPayload = token.split('.')[1];

    if (!encodedPayload) {
      return null;
    }

    const base64Payload = encodedPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const claims = JSON.parse(window.atob(base64Payload));
    const id = Number(claims.sub);
    const expiration = Number(claims.exp);

    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      !Number.isFinite(expiration) ||
      expiration <= Date.now() / 1000 ||
      !Object.values(ROLES).includes(claims.role)
    ) {
      return null;
    }

    return { id, role: claims.role };
  } catch {
    return null;
  }
}

function getInitialAuthState() {
  const storedToken = getAuthToken();
  const tokenUser = storedToken ? getUserFromToken(storedToken) : null;
  const profile = tokenUser ? getAuthProfile(tokenUser.id) : null;
  const user = tokenUser ? { ...tokenUser, ...profile } : null;

  if (storedToken && !user) {
    removeAuthToken();
    removeAuthProfile();
  }

  return {
    token: user ? storedToken : null,
    user,
    isRestoring: !user,
  };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(getInitialAuthState);
  const authOperation = useRef(0);
  const { token } = authState;

  useEffect(() => {
    const handleTokenExpired = () => {
      authOperation.current += 1;
      removeAuthToken();
      removeAuthProfile();
      setAuthState({ token: null, user: null, isRestoring: false });
    };

    const handleTokenRefreshed = (event) => {
      authOperation.current += 1;
      const session = event.detail;
      const tokenUser = getUserFromToken(session?.token);

      if (!tokenUser) {
        handleTokenExpired();
        return;
      }

      const profile = session.user;
      if (profile?.id === tokenUser.id && profile?.name && profile?.email) {
        setAuthProfile(profile);
      }
      setAuthState((current) => ({
        token: session.token,
        user: {
          ...tokenUser,
          ...(profile?.id === tokenUser.id ? profile : current.user),
          role: tokenUser.role,
        },
        isRestoring: false,
      }));
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
    };
  }, []);

  useEffect(() => {
    if (token) {
      return undefined;
    }

    let isMounted = true;
    const operation = ++authOperation.current;
    authService
      .refresh()
      .then((session) => {
        if (!isMounted || operation !== authOperation.current) {
          return;
        }

        const authToken = session?.token;
        const tokenUser = authToken ? getUserFromToken(authToken) : null;
        if (!tokenUser) {
          throw new Error(MESSAGES.COMMON.SERVER_ERROR);
        }

        const profile = session.user;
        if (profile?.id === tokenUser.id && profile?.name && profile?.email) {
          setAuthProfile(profile);
        }
        setAuthToken(authToken);
        setAuthState({
          token: authToken,
          user: {
            ...tokenUser,
            ...(profile?.id === tokenUser.id ? profile : getAuthProfile(tokenUser.id)),
            role: tokenUser.role,
          },
          isRestoring: false,
        });
      })
      .catch(() => {
        if (!isMounted || operation !== authOperation.current) {
          return;
        }

        removeAuthToken();
        removeAuthProfile();
        setAuthState({ token: null, user: null, isRestoring: false });
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(credentials) {
    const response = await authService.login(credentials);
    const authToken = response?.token;
    const authUser = response?.user ?? null;

    if (!authToken) {
      throw new Error(MESSAGES.COMMON.SERVER_ERROR);
    }

    authOperation.current += 1;
    setAuthToken(authToken);
    if (authUser?.id && authUser?.name && authUser?.email) {
      setAuthProfile(authUser);
    } else {
      removeAuthProfile();
    }
    setAuthState({
      token: authToken,
      user: authUser,
      isRestoring: false,
    });

    return response;
  }

  function logout() {
    authOperation.current += 1;
    void authService.logout();
    removeAuthToken();
    removeAuthProfile();
    setAuthState({ token: null, user: null, isRestoring: false });
  }

  function register(registrationData) {
    return authService.register(registrationData);
  }

  const value = {
    ...authState,
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
