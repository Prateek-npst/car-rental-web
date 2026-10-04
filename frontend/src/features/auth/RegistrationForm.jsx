import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';

const registrationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, MESSAGES.COMMON.REQUIRED_FIELD)
      .max(LIMITS.AUTH.NAME_MAX_LENGTH, MESSAGES.AUTH.NAME_TOO_LONG),
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
      .max(LIMITS.AUTH.PASSWORD_MAX_LENGTH, MESSAGES.AUTH.PASSWORD_TOO_LONG)
      .refine(
        (value) => LIMITS.AUTH.PASSWORD_PATTERN.test(value),
        {
          message: 'Password must include uppercase, lowercase, number, and special character.',
        },
      ),
    confirmPassword: z.string().min(1, MESSAGES.COMMON.REQUIRED_FIELD),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: MESSAGES.AUTH.PASSWORDS_DO_NOT_MATCH,
    path: ['confirmPassword'],
  })
  .transform(({ name, email, password }) => ({
    name,
    email,
    password,
  }));

function RegistrationForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [registrationError, setRegistrationError] = useState('');
  const {
    register: registerField,
    handleSubmit,
    clearErrors,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const passwordValue = useWatch({
    control,
    name: 'password',
    defaultValue: '',
  });
  const confirmPasswordValue = useWatch({
    control,
    name: 'confirmPassword',
    defaultValue: '',
  });
  const passwordRequirementStatus = LIMITS.AUTH.PASSWORD_REQUIREMENTS.map(
    (requirement) => ({
      ...requirement,
      isMet: requirement.test(passwordValue),
    }),
  );
  const nameRegistration = registerField('name');
  const emailRegistration = registerField('email');
  const passwordRegistration = registerField('password');
  const confirmPasswordRegistration = registerField('confirmPassword');

  function clearFieldError(fieldName) {
    clearErrors(fieldName);
    setRegistrationError('');
  }

  async function submitRegistration(registrationData) {
    try {
      await registerUser(registrationData);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      const nextError =
        error?.message === MESSAGES.AUTH.REGISTRATION_NETWORK_ERROR ||
        error?.message === MESSAGES.AUTH.REGISTRATION_DUPLICATE_EMAIL
          ? error.message
          : MESSAGES.AUTH.REGISTRATION_FAILED;

      setRegistrationError(nextError);
    }
  }

  return (
    <form
      className="registration-form"
      noValidate
      onSubmit={(event) => {
        if (isSubmitting) {
          event.preventDefault();
          return;
        }

        setRegistrationError('');
        handleSubmit(submitRegistration)(event);
      }}
    >
      <FormField
        error={errors.name?.message}
        htmlFor={FORM_FIELD_IDS.AUTH_REGISTRATION.NAME}
        label={MESSAGES.AUTH.NAME_LABEL}
      >
        <TextInput
          {...nameRegistration}
          aria-describedby={
            errors.name
              ? FORM_FIELD_IDS.AUTH_REGISTRATION.NAME_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.AUTH_REGISTRATION.NAME}
          onChange={(event) => {
            nameRegistration.onChange(event);
            setRegistrationError('');
          }}
        />
      </FormField>

      <FormField
        error={errors.email?.message}
        htmlFor={FORM_FIELD_IDS.AUTH_REGISTRATION.EMAIL}
        label={MESSAGES.AUTH.EMAIL_LABEL}
      >
        <TextInput
          {...emailRegistration}
          aria-describedby={
            errors.email
              ? FORM_FIELD_IDS.AUTH_REGISTRATION.EMAIL_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.AUTH_REGISTRATION.EMAIL}
          onChange={(event) => {
            emailRegistration.onChange(event);
            setRegistrationError('');
          }}
          type="email"
        />
      </FormField>

      <FormField
        error={errors.password?.message}
        htmlFor={FORM_FIELD_IDS.AUTH_REGISTRATION.PASSWORD}
        label={MESSAGES.AUTH.PASSWORD_LABEL}
      >
        <PasswordInput
          {...passwordRegistration}
          aria-describedby={
            errors.password
              ? FORM_FIELD_IDS.AUTH_REGISTRATION.PASSWORD_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.password)}
          autoComplete="new-password"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.AUTH_REGISTRATION.PASSWORD}
          onChange={(event) => {
            passwordRegistration.onChange(event);
            clearFieldError('password');
            if (confirmPasswordValue) {
              trigger('confirmPassword');
            }
          }}
        />
        <div
          aria-live="polite"
          aria-atomic="true"
          className="registration-form__password-strength"
          role="status"
        >
          <p>{MESSAGES.AUTH.PASSWORD_STRENGTH_TITLE}</p>
          <ul>
            {passwordRequirementStatus.map((requirement) => (
              <li key={requirement.key} data-met={requirement.isMet}>
                {requirement.isMet ? '✓' : '•'} {requirement.label}
              </li>
            ))}
          </ul>
        </div>
      </FormField>

      <FormField
        error={errors.confirmPassword?.message}
        htmlFor={FORM_FIELD_IDS.AUTH_REGISTRATION.CONFIRM_PASSWORD}
        label={MESSAGES.AUTH.CONFIRM_PASSWORD_LABEL}
      >
        <PasswordInput
          {...confirmPasswordRegistration}
          aria-describedby={
            errors.confirmPassword
              ? FORM_FIELD_IDS.AUTH_REGISTRATION.CONFIRM_PASSWORD_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.confirmPassword)}
          autoComplete="new-password"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.AUTH_REGISTRATION.CONFIRM_PASSWORD}
          onChange={(event) => {
            confirmPasswordRegistration.onChange(event);
            clearFieldError('confirmPassword');
          }}
        />
      </FormField>

      {registrationError && (
        <p className="registration-form__error" role="alert">
          {registrationError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        {MESSAGES.AUTH.REGISTER_LINK}
      </Button>
    </form>
  );
}

export default RegistrationForm;
