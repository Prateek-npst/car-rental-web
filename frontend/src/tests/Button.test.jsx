import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button.jsx';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Login</Button>);

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('disables itself while loading', () => {
    render(<Button isLoading>Login</Button>);

    const button = screen.getByRole('button', { name: 'Loading...' });

    expect(button).toBeDisabled();
  });
});
