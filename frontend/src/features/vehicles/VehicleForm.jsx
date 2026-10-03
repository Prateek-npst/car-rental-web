import { zodResolver } from '@hookform/resolvers/zod';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '@/components/ui/Button.jsx';
import FormField from '@/components/ui/FormField.jsx';
import TextInput from '@/components/ui/TextInput.jsx';
import { FORM_FIELD_IDS } from '@/constants/formFieldIds.js';
import { LIMITS } from '@/constants/limits.js';
import { MESSAGES } from '@/constants/messages.js';

const vehicleSchema = z.object({
  regNumber: z
    .string()
    .trim()
    .min(1, MESSAGES.VEHICLES.REG_NUMBER_REQUIRED)
    .max(
      LIMITS.VEHICLE.REG_NUMBER_MAX_LENGTH,
      MESSAGES.VEHICLES.REG_NUMBER_TOO_LONG,
    ),
  model: z
    .string()
    .trim()
    .min(1, MESSAGES.VEHICLES.MODEL_REQUIRED)
    .max(LIMITS.VEHICLE.MODEL_MAX_LENGTH, MESSAGES.VEHICLES.MODEL_TOO_LONG),
  dailyRate: z
    .number({ error: MESSAGES.VEHICLES.DAILY_RATE_REQUIRED })
    .min(LIMITS.VEHICLE.DAILY_RATE_MIN, MESSAGES.VEHICLES.DAILY_RATE_TOO_LOW)
    .max(LIMITS.VEHICLE.DAILY_RATE_MAX, MESSAGES.VEHICLES.DAILY_RATE_TOO_HIGH),
  location: z
    .string()
    .trim()
    .min(1, MESSAGES.VEHICLES.LOCATION_REQUIRED)
    .max(
      LIMITS.VEHICLE.LOCATION_MAX_LENGTH,
      MESSAGES.VEHICLES.LOCATION_TOO_LONG,
    ),
});

function VehicleForm({ vehicle, onSubmit, onCancel, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      regNumber: vehicle?.regNumber ?? '',
      model: vehicle?.model ?? '',
      dailyRate: vehicle?.dailyRate ?? '',
      location: vehicle?.location ?? '',
    },
  });
  const regNumberRegistration = register('regNumber');
  const modelRegistration = register('model');
  const dailyRateRegistration = register('dailyRate', { valueAsNumber: true });
  const locationRegistration = register('location');

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormField
        error={errors.regNumber?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_ADMIN.REG_NUMBER}
        label={MESSAGES.VEHICLES.REG_NUMBER_LABEL}
      >
        <TextInput
          {...regNumberRegistration}
          autoComplete="off"
          aria-invalid={Boolean(errors.regNumber)}
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_ADMIN.REG_NUMBER}
        />
      </FormField>

      <FormField
        error={errors.model?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_ADMIN.MODEL}
        label={MESSAGES.VEHICLES.MODEL_LABEL}
      >
        <TextInput
          {...modelRegistration}
          aria-invalid={Boolean(errors.model)}
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_ADMIN.MODEL}
        />
      </FormField>

      <FormField
        error={errors.dailyRate?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_ADMIN.DAILY_RATE}
        label={MESSAGES.VEHICLES.DAILY_RATE_LABEL}
      >
        <TextInput
          {...dailyRateRegistration}
          aria-invalid={Boolean(errors.dailyRate)}
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_ADMIN.DAILY_RATE}
          max={LIMITS.VEHICLE.DAILY_RATE_MAX}
          min={LIMITS.VEHICLE.DAILY_RATE_MIN}
          step="0.01"
          type="number"
        />
      </FormField>

      <FormField
        error={errors.location?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_ADMIN.LOCATION}
        label={MESSAGES.VEHICLES.LOCATION_LABEL}
      >
        <TextInput
          {...locationRegistration}
          aria-invalid={Boolean(errors.location)}
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_ADMIN.LOCATION}
        />
      </FormField>

      <div className="admin-vehicles-page__form-actions">
        <Button isLoading={isSubmitting} type="submit">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {MESSAGES.VEHICLES.ADMIN_CANCEL}
          </Button>
        )}
      </div>
    </form>
  );
}

VehicleForm.propTypes = {
  vehicle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    regNumber: PropTypes.string,
    model: PropTypes.string,
    dailyRate: PropTypes.number,
    location: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitLabel: PropTypes.string.isRequired,
};

export default VehicleForm;