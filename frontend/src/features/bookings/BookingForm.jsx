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
import './BookingForm.css';
import { getTodayDateInputValue } from '@/utils/bookingDates.js';

function meetsMinimumDuration(startDate, endDate) {
  const earliestEndDate = new Date(`${startDate}T00:00:00Z`);
  earliestEndDate.setUTCDate(
    earliestEndDate.getUTCDate() + LIMITS.BOOKING.MIN_RENTAL_DAYS,
  );

  return endDate >= earliestEndDate.toISOString().slice(0, 10);
}

const bookingSchema = z
  .object({
    startDate: z.string().min(1, MESSAGES.COMMON.REQUIRED_FIELD),
    endDate: z.string().min(1, MESSAGES.COMMON.REQUIRED_FIELD),
  })
  .refine(
    ({ startDate }) => !startDate || startDate >= getTodayDateInputValue(),
    {
      message: MESSAGES.BOOKING.DATE_BEFORE_TODAY,
      path: ['startDate'],
    },
  )
  .refine(
    ({ startDate }) => !startDate || startDate <= LIMITS.BOOKING.MAX_DATE,
    {
      message: MESSAGES.BOOKING.DATE_AFTER_MAX,
      path: ['startDate'],
    },
  )
  .refine(({ endDate }) => !endDate || endDate >= getTodayDateInputValue(), {
    message: MESSAGES.BOOKING.DATE_BEFORE_TODAY,
    path: ['endDate'],
  })
  .refine(({ endDate }) => !endDate || endDate <= LIMITS.BOOKING.MAX_DATE, {
    message: MESSAGES.BOOKING.DATE_AFTER_MAX,
    path: ['endDate'],
  })
  .refine(
    ({ startDate, endDate }) => !startDate || !endDate || endDate > startDate,
    {
      message: MESSAGES.BOOKING.DATE_AFTER_START,
      path: ['endDate'],
    },
  )
  .refine(
    ({ startDate, endDate }) =>
      !startDate ||
      !endDate ||
      endDate <= startDate ||
      meetsMinimumDuration(startDate, endDate),
    {
      message: MESSAGES.BOOKING.MIN_RENTAL_DURATION,
      path: ['endDate'],
    },
  );

function BookingForm({
  onSubmit,
  isLoading = false,
  isComplete = false,
  initialDates,
  submitLabel = MESSAGES.BOOKING.SUBMIT,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: initialDates?.startDate ?? '',
      endDate: initialDates?.endDate ?? '',
    },
  });
  const startDate = useWatch({ control, name: 'startDate' });
  const today = getTodayDateInputValue();
  const earliestEndDate = startDate > today ? startDate : today;
  const startDateRegistration = register('startDate');
  const endDateRegistration = register('endDate');
  const isDisabled = isLoading || isSubmitting || isComplete;

  return (
    <form className="booking-form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormField
        error={errors.startDate?.message}
        htmlFor={FORM_FIELD_IDS.BOOKING_CREATE.START_DATE}
        label={MESSAGES.BOOKING.START_DATE_LABEL}
      >
        <TextInput
          {...startDateRegistration}
          aria-describedby={
            errors.startDate
              ? FORM_FIELD_IDS.BOOKING_CREATE.START_DATE_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.startDate)}
          disabled={isDisabled}
          id={FORM_FIELD_IDS.BOOKING_CREATE.START_DATE}
          max={LIMITS.BOOKING.MAX_DATE}
          min={today}
          onChange={(event) => {
            startDateRegistration.onChange(event);
          }}
          type="date"
        />
      </FormField>

      <FormField
        error={errors.endDate?.message}
        htmlFor={FORM_FIELD_IDS.BOOKING_CREATE.END_DATE}
        label={MESSAGES.BOOKING.END_DATE_LABEL}
      >
        <TextInput
          {...endDateRegistration}
          aria-describedby={
            errors.endDate
              ? FORM_FIELD_IDS.BOOKING_CREATE.END_DATE_ERROR
              : undefined
          }
          aria-invalid={Boolean(errors.endDate)}
          disabled={isDisabled}
          id={FORM_FIELD_IDS.BOOKING_CREATE.END_DATE}
          max={LIMITS.BOOKING.MAX_DATE}
          min={earliestEndDate}
          onChange={(event) => {
            endDateRegistration.onChange(event);
          }}
          type="date"
        />
      </FormField>

      <div className="booking-form__actions">
        <Button type="submit" disabled={isDisabled} isLoading={isLoading}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            disabled={isDisabled}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {MESSAGES.BOOKING.CANCEL_EDIT}
          </Button>
        )}
      </div>
    </form>
  );
}

BookingForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isComplete: PropTypes.bool,
  initialDates: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
  }),
  submitLabel: PropTypes.string,
  onCancel: PropTypes.func,
};

export default BookingForm;
