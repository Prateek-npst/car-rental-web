import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import LoginPage from '@/pages/LoginPage.jsx';

const { mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
}));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

function renderLoginPage(initialEntry = ROUTES.LOGIN) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.DASHBOARD} element={<h1>Dashboard destination</h1>} />
        <Route path={ROUTES.VEHICLES} element={<h1>Vehicles destination</h1>} />
        <Route path={ROUTES.BOOKINGS} element={<h1>Bookings destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillLoginForm(email, password) {
  fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.EMAIL_LABEL), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.PASSWORD_LABEL), {
    target: { value: password },
  });
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('renders visibly labelled email and password fields', () => {
    renderLoginPage();

    expect(
      screen.getByRole('textbox', { name: MESSAGES.AUTH.EMAIL_LABEL }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.AUTH.PASSWORD_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: MESSAGES.AUTH.REGISTER_LINK }),
    ).toHaveAttribute('href', ROUTES.REGISTER);
  });

  it('prevents submission when required fields are empty', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    expect(
      await screen.findAllByText(MESSAGES.COMMON.REQUIRED_FIELD),
    ).toHaveLength(2);
    expect(
      screen.queryByText(MESSAGES.AUTH.INVALID_CREDENTIALS),
    ).not.toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('validates email format and configured password length', async () => {
    renderLoginPage();
    fillLoginForm('not-an-email', 'short');

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    expect(await screen.findByText(MESSAGES.AUTH.EMAIL_INVALID)).toBeVisible();
    expect(
      await screen.findByText(MESSAGES.AUTH.PASSWORD_TOO_SHORT),
    ).toBeVisible();
    expect(
      screen.queryByText(MESSAGES.AUTH.INVALID_CREDENTIALS),
    ).not.toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits credentials and navigates to the dashboard on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginPage();
    fillLoginForm('renter@example.com', 'Correct-horse-battery1!');

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    expect(
      await screen.findByRole('heading', { name: 'Dashboard destination' }),
    ).toBeInTheDocument();
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'renter@example.com',
      password: 'Correct-horse-battery1!',
    });
  });

  it('returns to the protected destination after a successful login', async () => {
    mockLogin.mockResolvedValue(undefined);
    renderLoginPage({
      pathname: ROUTES.LOGIN,
      state: { from: { pathname: ROUTES.BOOKINGS } },
    });
    fillLoginForm('renter@example.com', 'correct-horse-battery');

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    expect(
      await screen.findByRole('heading', { name: 'Bookings destination' }),
    ).toBeInTheDocument();
  });

  it('shows a friendly authentication error without exposing backend details', async () => {
    mockLogin.mockRejectedValue(new Error('backend details'));
    renderLoginPage();
    fillLoginForm('renter@example.com', 'correct-horse-battery');

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.AUTH.INVALID_CREDENTIALS,
    );
    expect(screen.queryByText('backend details')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.EMAIL_LABEL), {
      target: { value: 'updated@example.com' },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a network-safe message when login fails because the server is unavailable', async () => {
    mockLogin.mockRejectedValue(new Error(MESSAGES.AUTH.NETWORK_LOGIN_ERROR));
    renderLoginPage();
    fillLoginForm('renter@example.com', 'correct-horse-battery');

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.AUTH.NETWORK_LOGIN_ERROR,
    );
  });

  it('prevents duplicate submissions while login is pending', async () => {
    let resolveLogin;
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    renderLoginPage();
    fillLoginForm('renter@example.com', 'Correct-horse-battery1!');

    fireEvent.click(screen.getByRole('button', { name: MESSAGES.AUTH.LOGIN }));

    const loadingButton = await screen.findByRole('button', {
      name: MESSAGES.COMMON.LOADING,
    });
    expect(loadingButton).toBeDisabled();

    fireEvent.click(loadingButton);
    fireEvent.submit(loadingButton.closest('form'));
    expect(mockLogin).toHaveBeenCalledTimes(1);

    resolveLogin();
    expect(
      await screen.findByRole('heading', { name: 'Dashboard destination' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: MESSAGES.COMMON.LOADING }),
    ).not.toBeInTheDocument();
  });
});
