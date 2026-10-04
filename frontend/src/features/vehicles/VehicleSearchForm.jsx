import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';
import { z } from 'zod';
import Button from '@/components/ui/Button.jsx';
import FormField from '@/components/ui/FormField.jsx';
import TextInput from '@/components/ui/TextInput.jsx';
import { FORM_FIELD_IDS } from '@/constants/formFieldIds.js';
import { LIMITS } from '@/constants/limits.js';
import { MESSAGES } from '@/constants/messages.js';
import { getTodayDateInputValue } from '@/utils/bookingDates.js';
import './VehicleSearchForm.css';

const vehicleSearchSchema = z
  .object({
    location: z.string().trim().min(1, MESSAGES.COMMON.REQUIRED_FIELD),
    pickupDate: z.string().min(1, MESSAGES.COMMON.REQUIRED_FIELD),
    dropoffDate: z.string().min(1, MESSAGES.COMMON.REQUIRED_FIELD),
  })
  .refine(
    ({ pickupDate }) => !pickupDate || pickupDate >= getTodayDateInputValue(),
    {
      message: MESSAGES.BOOKING.DATE_BEFORE_TODAY,
      path: ['pickupDate'],
    },
  )
  .refine(
    ({ pickupDate }) => !pickupDate || pickupDate <= LIMITS.BOOKING.MAX_DATE,
    {
      message: MESSAGES.BOOKING.DATE_AFTER_MAX,
      path: ['pickupDate'],
    },
  )
  .refine(
    ({ dropoffDate }) =>
      !dropoffDate || dropoffDate >= getTodayDateInputValue(),
    {
      message: MESSAGES.BOOKING.DATE_BEFORE_TODAY,
      path: ['dropoffDate'],
    },
  )
  .refine(
    ({ dropoffDate }) => !dropoffDate || dropoffDate <= LIMITS.BOOKING.MAX_DATE,
    {
      message: MESSAGES.BOOKING.DATE_AFTER_MAX,
      path: ['dropoffDate'],
    },
  )
  .refine(
    ({ pickupDate, dropoffDate }) =>
      !pickupDate || !dropoffDate || dropoffDate > pickupDate,
    {
      message: MESSAGES.VEHICLES.DROPOFF_DATE_AFTER_PICKUP,
      path: ['dropoffDate'],
    },
  );

function VehicleSearchForm({ onSearch }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vehicleSearchSchema),
    defaultValues: {
      location: '',
      pickupDate: '',
      dropoffDate: '',
    },
  });
  const pickupDate = useWatch({ control, name: 'pickupDate' });
  const today = getTodayDateInputValue();
  const earliestDropoffDate = pickupDate > today ? pickupDate : today;

  return (
    <form
      className="vehicle-search-form"
      noValidate
      onSubmit={handleSubmit(onSearch)}
    >
      <FormField
        error={errors.location?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_SEARCH.LOCATION}
        label={MESSAGES.VEHICLES.LOCATION_LABEL}
      >
        <TextInput
          {...register('location')}
          aria-describedby={
            errors.location
              ? FORM_FIELD_IDS.VEHICLE_SEARCH.LOCATION_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.location)}
          autoComplete="address-level2"
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_SEARCH.LOCATION}
        />
      </FormField>

      <FormField
        error={errors.pickupDate?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_SEARCH.PICKUP_DATE}
        label={MESSAGES.VEHICLES.PICKUP_DATE_LABEL}
      >
        <TextInput
          {...register('pickupDate')}
          aria-describedby={
            errors.pickupDate
              ? FORM_FIELD_IDS.VEHICLE_SEARCH.PICKUP_DATE_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.pickupDate)}
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_SEARCH.PICKUP_DATE}
          max={LIMITS.BOOKING.MAX_DATE}
          min={today}
          type="date"
        />
      </FormField>

      <FormField
        error={errors.dropoffDate?.message}
        htmlFor={FORM_FIELD_IDS.VEHICLE_SEARCH.DROPOFF_DATE}
        label={MESSAGES.VEHICLES.DROPOFF_DATE_LABEL}
      >
        <TextInput
          {...register('dropoffDate')}
          aria-describedby={
            errors.dropoffDate
              ? FORM_FIELD_IDS.VEHICLE_SEARCH.DROPOFF_DATE_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.dropoffDate)}
          disabled={isSubmitting}
          id={FORM_FIELD_IDS.VEHICLE_SEARCH.DROPOFF_DATE}
          max={LIMITS.BOOKING.MAX_DATE}
          min={earliestDropoffDate}
          type="date"
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
        {MESSAGES.VEHICLES.SEARCH}
      </Button>
    </form>
  );
}

VehicleSearchForm.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default VehicleSearchForm;
