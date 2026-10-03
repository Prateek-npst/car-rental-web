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

  it('shows the password when Show is clicked', () => {
    render(
      <PasswordInput aria-label="Password" id="password" name="password" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('hides the password again when Hide is clicked', () => {
    render(
      <PasswordInput aria-label="Password" id="password" name="password" />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });
});
