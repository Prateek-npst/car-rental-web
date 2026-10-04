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

function renderHeader(initialEntry = ROUTES.BOOKINGS) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Header />
      <Routes>
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

  it('shows authenticated navigation and a logout control', () => {
    renderHeader(ROUTES.BOOKINGS);

    expect(
      screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }),
    ).toHaveAttribute('href', ROUTES.VEHICLES);
    expect(
      screen.getByRole('link', { name: MESSAGES.NAVIGATION.MY_BOOKINGS }),
    ).toHaveAttribute('href', ROUTES.BOOKINGS);
    expect(
      screen.getByRole('link', { name: MESSAGES.NAVIGATION.MY_BOOKINGS }),
    ).toHaveAttribute('aria-current', 'page');
    fireEvent.click(
      screen.getByRole('button', { name: /Prateek Singh, Profile/ }),
    );
    expect(
      screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT }),
    ).toBeVisible();
  });

  it('closes the profile menu when the user navigates via header links', () => {
    renderHeader(ROUTES.BOOKINGS);

    fireEvent.click(screen.getByRole('button', { name: /Prateek Singh, Profile/ }));
    expect(screen.getByRole('button', { name: MESSAGES.AUTH.LOGOUT })).toBeVisible();

    fireEvent.click(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }));

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

  it('hides authenticated navigation when signed out', () => {
    authContext.value = { isAuthenticated: false, logout };
    renderHeader();

    expect(
      screen.queryByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: MESSAGES.NAVIGATION.MY_BOOKINGS }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: MESSAGES.AUTH.LOGOUT }),
    ).not.toBeInTheDocument();
  });

  it('shows vehicle management navigation only to ADMIN users', () => {
    const { unmount } = renderHeader();
    expect(
      screen.queryByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV }),
    ).not.toBeInTheDocument();
    unmount();

    authContext.value = {
      isAuthenticated: true,
      logout,
      user: {
        id: 1,
        name: 'A User',
        email: 'admin@example.com',
        role: ROLES.ADMIN,
      },
    };
    renderHeader(ROUTES.ADMIN_VEHICLES);

    expect(
      screen.getByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV }),
    ).toHaveAttribute('href', ROUTES.ADMIN_VEHICLES);
    expect(
      screen.getByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('link', { name: MESSAGES.NAVIGATION.ALL_BOOKINGS }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: MESSAGES.NAVIGATION.MY_BOOKINGS }),
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
