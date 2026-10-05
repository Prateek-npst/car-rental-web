import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProfilePage from '@/pages/ProfilePage.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';

const { authContext } = vi.hoisted(() => ({ authContext: { user: null } }));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => authContext,
}));

describe('ProfilePage', () => {
  it.each([ROLES.USER, ROLES.ADMIN])('shows the authenticated %s profile', (role) => {
    authContext.user = {
      id: 3,
      name: 'Casey Driver',
      email: 'casey@example.com',
      role,
    };
    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: MESSAGES.PROFILE.TITLE })).toBeVisible();
    expect(screen.getByText('Casey Driver')).toBeVisible();
    expect(screen.getByText('casey@example.com')).toBeVisible();
    expect(screen.getByText(role, { selector: 'dd' })).toBeVisible();
  });

  it('shows a fallback for unavailable profile fields', () => {
    authContext.user = { role: ROLES.USER };
    render(<ProfilePage />);

    expect(
      screen.getAllByText(MESSAGES.PROFILE.VALUE_UNAVAILABLE),
    ).toHaveLength(2);
  });
});