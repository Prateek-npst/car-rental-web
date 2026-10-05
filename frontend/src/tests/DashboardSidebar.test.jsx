import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import DashboardSidebar from '@/components/layout/DashboardSidebar.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { ROLES } from '@/constants/roles.js';

const { authContext } = vi.hoisted(() => ({ authContext: { user: null } }));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authContext,
}));

function renderSidebar(role, route) {
  authContext.user = { id: 10, role };

  return render(
    <MemoryRouter initialEntries={[route]}>
      <DashboardSidebar />
    </MemoryRouter>,
  );
}

describe('DashboardSidebar', () => {
  it('shows the USER menu and omits admin-only entries', () => {
    renderSidebar(ROLES.USER, ROUTES.VEHICLES);

    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES })).toBeVisible();
    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.MY_BOOKINGS })).toBeVisible();
    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.PROFILE })).toBeVisible();
    expect(screen.queryByRole('link', { name: MESSAGES.NAVIGATION.ALL_BOOKINGS })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV })).not.toBeInTheDocument();
  });

  it('shows the ADMIN menu and omits the user-specific booking label', () => {
    renderSidebar(ROLES.ADMIN, ROUTES.BOOKINGS);

    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES })).toBeVisible();
    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.ALL_BOOKINGS })).toBeVisible();
    expect(screen.getByRole('link', { name: MESSAGES.VEHICLES.ADMIN_NAV })).toBeVisible();
    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.PROFILE })).toBeVisible();
    expect(screen.queryByRole('link', { name: MESSAGES.NAVIGATION.MY_BOOKINGS })).not.toBeInTheDocument();
  });

  it('highlights the active route using NavLink state', () => {
    renderSidebar(ROLES.USER, ROUTES.VEHICLES);

    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }))
      .toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }))
      .toHaveClass('dashboard-sidebar__link--active');
    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }))
      .not.toBeDisabled();
  });

  it('keeps Vehicles active while viewing vehicle details', () => {
    renderSidebar(ROLES.USER, '/vehicles/42');

    expect(screen.getByRole('link', { name: MESSAGES.NAVIGATION.VEHICLES }))
      .toHaveAttribute('aria-current', 'page');
  });
});