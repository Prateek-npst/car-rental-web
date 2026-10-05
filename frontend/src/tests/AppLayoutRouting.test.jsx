import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App.jsx';
import { ROLES } from '@/constants/roles.js';
import { ROUTES } from '@/constants/routes.js';

const { authContext } = vi.hoisted(() => ({ authContext: { value: null } }));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authContext.value,
}));

describe('App route layouts', () => {
  beforeEach(() => {
    authContext.value = {
      isAuthenticated: false,
      isRestoring: false,
      logout: vi.fn(),
      user: null,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it.each([ROUTES.LOGIN, ROUTES.REGISTER])(
    'keeps public route %s outside the dashboard shell',
    (path) => {
      window.history.replaceState({}, '', path);
      render(<App />);

      expect(document.querySelector('.app-layout')).toBeInTheDocument();
      expect(document.querySelector('.dashboard-layout')).not.toBeInTheDocument();
    },
  );

  it('renders a protected page inside the shared dashboard shell', () => {
    authContext.value = {
      isAuthenticated: true,
      isRestoring: false,
      logout: vi.fn(),
      user: { id: 10, role: ROLES.USER },
    };
    window.history.replaceState({}, '', ROUTES.VEHICLES);
    render(<App />);

    expect(document.querySelector('.dashboard-layout')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Vehicles' })).toBeVisible();
  });

  it('opens and closes role navigation and closes it after selecting a page', () => {
    authContext.value = {
      isAuthenticated: true,
      isRestoring: false,
      logout: vi.fn(),
      user: { id: 10, name: 'Renter', email: 'renter@example.com', role: ROLES.USER },
    };
    window.history.replaceState({}, '', ROUTES.VEHICLES);
    render(<App />);

    const menuToggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    fireEvent.click(menuToggle);

    expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('link', { name: 'Profile' }));

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeVisible();
    expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    expect(menuToggle).toHaveFocus();
  });

  it('closes the open navigation with Escape and restores focus to its toggle', () => {
    authContext.value = {
      isAuthenticated: true,
      isRestoring: false,
      logout: vi.fn(),
      user: { id: 10, role: ROLES.USER },
    };
    window.history.replaceState({}, '', ROUTES.VEHICLES);
    render(<App />);
    const menuToggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    fireEvent.click(menuToggle);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
    expect(menuToggle).toHaveFocus();
  });
});