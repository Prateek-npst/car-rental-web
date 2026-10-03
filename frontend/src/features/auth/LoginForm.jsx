import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/Button.jsx';
import FormField from '@/components/ui/FormField.jsx';
import PasswordInput from '@/components/ui/PasswordInput.jsx';
import TextInput from '@/components/ui/TextInput.jsx';
import { FORM_FIELD_IDS } from '@/constants/formFieldIds.js';
import { LIMITS } from '@/constants/limits.js';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import './LoginForm.css';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, MESSAGES.COMMON.REQUIRED_FIELD)
    .max(LIMITS.AUTH.EMAIL_MAX_LENGTH, MESSAGES.AUTH.EMAIL_TOO_LONG)
    .email(MESSAGES.AUTH.EMAIL_INVALID),
  password: z
    .string()
    .min(1, MESSAGES.COMMON.REQUIRED_FIELD)
    .min(LIMITS.AUTH.PASSWORD_MIN_LENGTH, MESSAGES.AUTH.PASSWORD_TOO_SHORT)
    .max(LIMITS.AUTH.PASSWORD_MAX_LENGTH, MESSAGES.AUTH.PASSWORD_TOO_LONG),
});

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [authError, setAuthError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const emailRegistration = register('email');
  const passwordRegistration = register('password');

  async function submitLogin(credentials) {
    try {
      await login(credentials);
      navigate(location.state?.from || ROUTES.VEHICLES, { replace: true });
    } catch {
      setAuthError(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
  }

  return (
    <form
      className="login-form"
      noValidate
      onSubmit={(event) => {
        if (isSubmitting) {
          event.preventDefault();
          return;
        }

        setAuthError('');
        handleSubmit(submitLogin)(event);
      }}
    >
      <FormField
        error={errors.email?.message}
        htmlFor={FORM_FIELD_IDS.AUTH_LOGIN.EMAIL}
        label={MESSAGES.AUTH.EMAIL_LABEL}
      >
        <TextInput
          {...emailRegistration}
          aria-describedby={
            errors.email ? FORM_FIELD_IDS.AUTH_LOGIN.EMAIL_ERROR : undefined
          }
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.AUTH_LOGIN.EMAIL}
          onChange={(event) => {
            emailRegistration.onChange(event);
            setAuthError('');
          }}
          type="email"
        />
      </FormField>

      <FormField
        error={errors.password?.message}
        htmlFor={FORM_FIELD_IDS.AUTH_LOGIN.PASSWORD}
        label={MESSAGES.AUTH.PASSWORD_LABEL}
      >
        <PasswordInput
          {...passwordRegistration}
          aria-describedby={
            errors.password
              ? FORM_FIELD_IDS.AUTH_LOGIN.PASSWORD_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.password)}
          autoComplete="current-password"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.AUTH_LOGIN.PASSWORD}
          onChange={(event) => {
            passwordRegistration.onChange(event);
            setAuthError('');
          }}
        />
      </FormField>

      {authError && (
        <p className="login-form__error" role="alert">
          {authError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {MESSAGES.AUTH.LOGIN}
      </Button>
    </form>
  );
}

export default LoginForm;
