import { render, screen } from '@testing-library/react';
import FormField from '@/components/ui/FormField.jsx';
import TextInput from '@/components/ui/TextInput.jsx';

describe('FormField', () => {
  it('connects the label to the input', () => {
    render(
      <FormField htmlFor="email" label="Email">
        <TextInput id="email" name="email" />
      </FormField>,
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('announces a validation error', () => {
    render(
      <FormField error="Email is required." htmlFor="email" label="Email">
        <TextInput id="email" name="email" />
      </FormField>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Email is required.');
  });
});
