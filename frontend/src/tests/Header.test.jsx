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

function renderHeader(initialEntry = ROUTES.DASHBOARD) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Header />
      <Routes>
        <Route path={ROUTES.DASHBOARD} element={<h1>Dashboard page</h1>} />
        <Route path={ROUTES.VEHICLES} element={<h1>Vehicles page</h1>} />
        <Route path={ROUTES.BOOKINGS} element={<h1>Bookings page</h1>} />
        <Route path={ROUTES.ADMIN_VEHICLES} element={<h1>Admin vehicles</h1>} />
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
      user: {
        id: 1,
        name: 'Prateek Singh',
        email: 'prateek@example.com',
        role: ROLES.USER,
      },
    };
  });

  it('shows the existing authenticated profile and logout controls in the topbar', () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole('button', { name: /Prateek Singh, Profile/ }),
    );
    expect(
      screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT }),
    ).toBeVisible();
  });

  it('closes the profile menu when the user follows the brand link', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('button', { name: /Prateek Singh, Profile/ }));
    expect(screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT })).toBeVisible();

    fireEvent.click(screen.getByRole('link', { name: MESSAGES.APP.NAME }));

    expect(screen.queryByRole('button', { name: MESSAGES.AUTH.LOGOUT })).not.toBeInTheDocument();
  });

  it('calls AuthContext.logout and navigates to login', () => {
    renderHeader();

    fireEvent.click(
      screen.getByRole('button', { name: /Prateek Singh, Profile/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT }));

    expect(logout).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeVisible();
  });

  it('hides the profile and logout controls when signed out', () => {
    authContext.value = { isAuthenticated: false, logout };
    renderHeader();

    expect(
      screen.queryByRole('button', { name: MESSAGES.AUTH.LOGOUT }),
    ).not.toBeInTheDocument();
  });

  it('shows account information and closes the profile on Escape', () => {
    renderHeader();

    const profileButton = screen.getByRole('button', {
      name: /Prateek Singh, Profile/,
    });
    fireEvent.click(profileButton);

    expect(screen.getByText('prateek@example.com')).toBeVisible();
    expect(screen.getByText(ROLES.USER)).toBeVisible();
    expect(profileButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(profileButton).toHaveAttribute('aria-expanded', 'false');
    expect(profileButton).toHaveFocus();
  });
});
