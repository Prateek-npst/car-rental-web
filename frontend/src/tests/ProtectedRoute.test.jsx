import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';
import { ROUTES } from '@/constants/routes.js';
import ProtectedRoute from '@/components/routing/ProtectedRoute.jsx';
import RoleRoute from '@/components/routing/RoleRoute.jsx';

const { authContext } = vi.hoisted(() => ({ authContext: { value: null } }));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authContext.value,
}));

function LoginDestination() {
  const location = useLocation();

  return (
    <p>
      Login destination: {location.state?.from?.pathname}
      {location.state?.from?.search}
    </p>
  );
}

function GuardedRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute guestOnly />}>
        <Route path={ROUTES.LOGIN} element={<LoginDestination />} />
        <Route path={ROUTES.REGISTER} element={<h1>Register screen</h1>} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<h1>Dashboard screen</h1>} />
        <Route path={ROUTES.VEHICLES} element={<h1>Vehicles screen</h1>} />
        <Route path={ROUTES.BOOKINGS} element={<h1>Bookings screen</h1>} />
      </Route>
      <Route
        path={ROUTES.ADMIN_VEHICLES}
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <h1>Admin screen</h1>
          </RoleRoute>
        }
      />
    </Routes>
  );
}

function renderGuardedRoutes(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <GuardedRoutes />
    </MemoryRouter>,
  );
}

function setAuthState({
  isAuthenticated = false,
  isRestoring = false,
  role = ROLES.USER,
} = {}) {
  authContext.value = {
    isAuthenticated,
    isRestoring,
    user: isAuthenticated ? { id: 1, role } : null,
  };
}

describe('ProtectedRoute and RoleRoute', () => {
  beforeEach(() => {
    setAuthState();
  });

  it('redirects unauthenticated protected-route users to login', () => {
    renderGuardedRoutes(ROUTES.BOOKINGS);

    expect(screen.getByText('Login destination: /bookings')).toBeVisible();
  });

  it('preserves the requested pathname and query when redirecting to login', () => {
    renderGuardedRoutes({
      pathname: ROUTES.BOOKINGS,
      search: '?page=2',
    });

    expect(
      screen.getByText('Login destination: /bookings?page=2'),
    ).toBeVisible();
  });

  it('renders protected content for an authenticated user', () => {
    setAuthState({ isAuthenticated: true });
    renderGuardedRoutes(ROUTES.BOOKINGS);

    expect(screen.getByRole('heading', { name: 'Bookings screen' })).toBeVisible();
  });

  it('waits for authentication restoration before redirecting', () => {
    setAuthState({ isRestoring: true });
    const view = renderGuardedRoutes(ROUTES.BOOKINGS);

    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.COMMON.LOADING);
    expect(screen.queryByText(/Login destination/)).not.toBeInTheDocument();

    setAuthState({ isAuthenticated: true, role: ROLES.USER });
    view.rerender(
      <MemoryRouter initialEntries={[ROUTES.BOOKINGS]}>
        <GuardedRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Bookings screen' })).toBeVisible();
    expect(screen.queryByText(/Login destination/)).not.toBeInTheDocument();
  });

  it.each([ROUTES.LOGIN, ROUTES.REGISTER])(
    'redirects authenticated users away from %s',
    (path) => {
      setAuthState({ isAuthenticated: true });
      renderGuardedRoutes(path);

      expect(screen.getByRole('heading', { name: 'Dashboard screen' })).toBeVisible();
    },
  );

  it('allows ADMIN to access the admin route', () => {
    setAuthState({ isAuthenticated: true, role: ROLES.ADMIN });
    renderGuardedRoutes(ROUTES.ADMIN_VEHICLES);

    expect(screen.getByRole('heading', { name: 'Admin screen' })).toBeVisible();
  });

  it('shows the 403 page to an authenticated USER on the admin route', () => {
    setAuthState({ isAuthenticated: true, role: ROLES.USER });
    renderGuardedRoutes(ROUTES.ADMIN_VEHICLES);

    expect(
      screen.getByRole('heading', { name: MESSAGES.ACCESS.FORBIDDEN_TITLE }),
    ).toBeVisible();
    expect(screen.getByText(MESSAGES.ACCESS.FORBIDDEN_MESSAGE)).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: MESSAGES.ACCESS.BACK_TO_VEHICLES,
      }),
    ).toBeVisible();
  });

  it('redirects unauthenticated RoleRoute users to login', () => {
    renderGuardedRoutes(ROUTES.ADMIN_VEHICLES);

    expect(
      screen.getByText('Login destination: /admin/vehicles'),
    ).toBeVisible();
  });

  it('ForbiddenPage button navigates to Vehicles', () => {
    setAuthState({ isAuthenticated: true, role: ROLES.USER });
    renderGuardedRoutes(ROUTES.ADMIN_VEHICLES);

    fireEvent.click(
      screen.getByRole('button', {
        name: MESSAGES.ACCESS.BACK_TO_VEHICLES,
      }),
    );

    expect(screen.getByRole('heading', { name: 'Vehicles screen' })).toBeVisible();
  });
});