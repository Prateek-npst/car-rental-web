import { fireEvent, render, screen } from '@testing-library/react';
import PasswordInput from '@/components/ui/PasswordInput.jsx';

describe('PasswordInput', () => {
  it('starts with the password hidden', () => {
    render(
      <PasswordInput aria-label="Password" id="password" name="password" />,
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('exposes accessible show and hide labels for screen readers', () => {
    render(
      <PasswordInput aria-label="Password" id="password" name="password" />,
    );

    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));

    expect(
      screen.getByRole('button', { name: 'Hide password' }),
    ).toBeInTheDocument();
  });

  it('shows the password when Show password is clicked', () => {
    render(
      <PasswordInput aria-label="Password" id="password" name="password" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('hides the password again when Hide password is clicked', () => {
    render(
      <PasswordInput aria-label="Password" id="password" name="password" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });
});
