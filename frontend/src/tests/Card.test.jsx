import { render, screen } from '@testing-library/react';
import Card from '@/components/ui/Card.jsx';

describe('Card', () => {
  it('renders its content', () => {
    render(
      <Card title="Login">
        <p>Login form</p>
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Login form')).toBeInTheDocument();
  });

  it('renders without a title', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>,
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
