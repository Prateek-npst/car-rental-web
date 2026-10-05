import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import DashboardPage from '@/pages/DashboardPage.jsx';
import { getBookings } from '@/services/bookingService.js';

vi.mock('@/services/bookingService.js', () => ({
  getBookings: vi.fn(),
}));

const bookings = [
  {
    id: 1,
    userId: 7,
    startDate: '2026-11-01',
    endDate: '2026-11-03',
    vehicle: { model: 'First Sedan', location: 'Central City' },
  },
  {
    id: 2,
    userId: 7,
    startDate: '2026-12-01',
    endDate: '2026-12-03',
    vehicle: { model: 'Latest Sedan', location: 'West End' },
  },
];

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBookings.mockResolvedValue(bookings);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a loading state while fetching authenticated booking data', () => {
    getBookings.mockReturnValue(new Promise(() => {}));
    renderDashboard();

    expect(screen.getByRole('status')).toHaveTextContent(MESSAGES.COMMON.LOADING);
  });

  it('displays the booking count and recent API data', async () => {
    const { container } = renderDashboard();

    await screen.findByRole('heading', { name: 'Latest Sedan' });
    expect(container.querySelector('.dashboard-page__count')).toHaveTextContent('2');
    expect(screen.getByRole('heading', { name: 'Latest Sedan' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'First Sedan' })).toBeVisible();
    expect(getBookings).toHaveBeenCalledOnce();
  });

  it('shows an empty state when there are no bookings', async () => {
    getBookings.mockResolvedValue([]);
    renderDashboard();

    expect(
      await screen.findByRole('heading', {
        name: MESSAGES.DASHBOARD.EMPTY_TITLE,
      }),
    ).toBeVisible();
    expect(
      screen.getAllByRole('link', { name: MESSAGES.DASHBOARD.FIND_VEHICLE }).at(-1),
    ).toHaveAttribute('href', '/vehicles');
  });

  it('shows an error and retries the dashboard request', async () => {
    getBookings
      .mockRejectedValueOnce(new Error(MESSAGES.DASHBOARD.LOAD_FAILED))
      .mockResolvedValueOnce(bookings);
    renderDashboard();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.DASHBOARD.LOAD_FAILED,
    );
    fireEvent.click(screen.getByRole('button', { name: MESSAGES.DASHBOARD.RETRY }));

    await waitFor(() => {
      expect(getBookings).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByRole('heading', { name: 'Latest Sedan' })).toBeVisible();
  });
});