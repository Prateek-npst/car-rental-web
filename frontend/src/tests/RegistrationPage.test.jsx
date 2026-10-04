import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import RegistrationPage from '@/pages/RegistrationPage.jsx';

const { mockRegister } = vi.hoisted(() => ({
  mockRegister: vi.fn(),
}));

vi.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => ({ register: mockRegister }),
}));

function renderRegistrationPage() {
  return render(
    <MemoryRouter initialEntries={[ROUTES.REGISTER]}>
      <Routes>
        <Route path={ROUTES.REGISTER} element={<RegistrationPage />} />
        <Route path={ROUTES.LOGIN} element={<h1>Login destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

function fillRegistrationForm({
  name = 'Renter Name',
  email = 'renter@example.com',
  password = 'Correct-horse-battery1!',
  confirmPassword = password,
} = {}) {
  fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.NAME_LABEL), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.EMAIL_LABEL), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.PASSWORD_LABEL), {
    target: { value: password },
  });
  fireEvent.change(
    screen.getByLabelText(MESSAGES.AUTH.CONFIRM_PASSWORD_LABEL),
    {
      target: { value: confirmPassword },
    },
  );
}

describe('RegistrationPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('renders labelled fields and a link back to login', () => {
    renderRegistrationPage();

    expect(screen.getByLabelText(MESSAGES.AUTH.NAME_LABEL)).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: MESSAGES.AUTH.EMAIL_LABEL }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.AUTH.PASSWORD_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(MESSAGES.AUTH.CONFIRM_PASSWORD_LABEL),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: MESSAGES.AUTH.LOGIN }),
    ).toHaveAttribute('href', ROUTES.LOGIN);
  });

  it('shows required-field errors for an empty form without registering', async () => {
    renderRegistrationPage();

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    expect(
      await screen.findAllByText(MESSAGES.COMMON.REQUIRED_FIELD),
    ).toHaveLength(4);
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('rejects an invalid email without registering', async () => {
    renderRegistrationPage();
    fillRegistrationForm({ email: 'not-an-email' });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    expect(await screen.findByText(MESSAGES.AUTH.EMAIL_INVALID)).toBeVisible();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows password strength guidance when the password field is used', async () => {
    renderRegistrationPage();

    fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.PASSWORD_LABEL), {
      target: { value: 'Rohit@2004' },
    });

    expect(
      await screen.findByText(MESSAGES.AUTH.PASSWORD_STRENGTH_TITLE),
    ).toBeVisible();
    expect(screen.getByText(/Minimum length/i)).toBeInTheDocument();
    expect(screen.getByText(/Uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/Lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/Number/i)).toBeInTheDocument();
    expect(screen.getByText(/Special character/i)).toBeInTheDocument();

    const passwordRequirements = screen.getAllByRole('listitem');
    expect(passwordRequirements).toHaveLength(5);
    expect(passwordRequirements.every((item) => item.dataset.met === 'true')).toBe(true);
  });

  it('rejects a password below the configured minimum', async () => {
    renderRegistrationPage();
    fillRegistrationForm({ password: 'short' });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    expect(
      await screen.findByText(MESSAGES.AUTH.PASSWORD_TOO_SHORT),
    ).toBeVisible();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords without registering', async () => {
    renderRegistrationPage();
    fillRegistrationForm({ confirmPassword: 'different-password' });

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    expect(
      await screen.findByText(MESSAGES.AUTH.PASSWORDS_DO_NOT_MATCH),
    ).toBeVisible();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('registers without confirmPassword and navigates to login on success', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderRegistrationPage();
    fillRegistrationForm();

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Login destination' }),
    ).toBeInTheDocument();
    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Renter Name',
      email: 'renter@example.com',
      password: 'Correct-horse-battery1!',
    });
  });

  it('displays a safe error after registration fails and clears it when edited', async () => {
    mockRegister.mockRejectedValue(new Error('backend details'));
    renderRegistrationPage();
    fillRegistrationForm();

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      MESSAGES.AUTH.REGISTRATION_FAILED,
    );
    expect(screen.queryByText('backend details')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(MESSAGES.AUTH.NAME_LABEL), {
      target: { value: 'Updated Name' },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('prevents duplicate registration while the request is pending', async () => {
    let resolveRegistration;
    mockRegister.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegistration = resolve;
        }),
    );
    renderRegistrationPage();
    fillRegistrationForm();

    fireEvent.click(
      screen.getByRole('button', { name: MESSAGES.AUTH.REGISTER_LINK }),
    );

    const loadingButton = await screen.findByRole('button', {
      name: MESSAGES.COMMON.LOADING,
    });
    expect(loadingButton).toBeDisabled();

    fireEvent.click(loadingButton);
    fireEvent.submit(loadingButton.closest('form'));
    expect(mockRegister).toHaveBeenCalledTimes(1);

    resolveRegistration();
    expect(
      await screen.findByRole('heading', { name: 'Login destination' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: MESSAGES.COMMON.LOADING }),
    ).not.toBeInTheDocument();
  });
});
