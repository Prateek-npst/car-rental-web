import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/layout/Header.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { ROLES } from '@/constants/roles.js';

const { authContext, logout } = vi.hoisted(() => ({
  authContext: { value: null },
  logout: vi.fn(),
}));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authContext.value,
}));

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.BOOKINGS]}>
      <Header />
      <Routes>
        <Route path={ROUTES.BOOKINGS} element={<h1>Bookings page</h1>} />
        <Route path={ROUTES.LOGIN} element={<h1>Login page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    logout.mockReset();
    authContext.value = {
      isAuthenticated: true,
      logout,
      user: { id: 1, role: ROLES.USER },
    };
  });

  it('shows authenticated navigation and a logout control', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'Vehicles' })).toHaveAttribute(
      'href',
      ROUTES.VEHICLES,
    );
    expect(screen.getByRole('link', { name: 'My Bookings' })).toHaveAttribute(
      'href',
      ROUTES.BOOKINGS,
    );
    expect(
      screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT }),
    ).toBeVisible();
  });

  it('calls AuthContext.logout and navigates to login', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT }));

    expect(logout).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeVisible();
  });

  it('hides authenticated navigation when signed out', () => {
    authContext.value = { isAuthenticated: false, logout };
    renderHeader();

    expect(screen.queryByRole('link', { name: 'Vehicles' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My Bookings' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: MESSAGES.AUTH.LOGOUT }),
    ).not.toBeInTheDocument();
  });

  it('shows vehicle management navigation only to ADMIN users', () => {
    renderHeader();
    expect(
      screen.queryByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV }),
    ).not.toBeInTheDocument();

    authContext.value = {
      isAuthenticated: true,
      logout,
      user: { id: 1, role: ROLES.ADMIN },
    };
    renderHeader();

    expect(
      screen.getByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV }),
    ).toHaveAttribute('href', ROUTES.ADMIN_VEHICLES);
  });
});