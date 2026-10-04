import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card from '@/components/ui/Card.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import BookingForm from '@/features/bookings/BookingForm.jsx';
import { createBooking } from '@/services/bookingService.js';
import './CreateBookingPage.css';

function CreateBookingPage() {
  const { state } = useLocation();
  const vehicle = state?.vehicle;
  const [isLoading, setIsLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const requestInProgress = useRef(false);

  async function handleCreateBooking(dates) {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setIsLoading(true);
    setBookingError('');

    try {
      const booking = await createBooking({
        vehicleId: vehicle.id,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
      setCreatedBooking(booking);
    } catch (error) {
      setBookingError(error.message || MESSAGES.BOOKING.CREATE_FAILED);
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  }

  return (
    <div className="create-booking-page">
      <h1 className="create-booking-page__title">
        {MESSAGES.BOOKING.CREATE_TITLE}
      </h1>
      <p className="create-booking-page__subtitle">
        {MESSAGES.BOOKING.CREATE_DESCRIPTION}
      </p>

      {!vehicle ? (
        <Card>
          <p role="status">{MESSAGES.BOOKING.NO_VEHICLE_SELECTED}</p>
          <Link to={ROUTES.VEHICLES}>{MESSAGES.BOOKING.BACK_TO_VEHICLES}</Link>
        </Card>
      ) : (
        <>
          <Card title={MESSAGES.BOOKING.VEHICLE_DETAILS}>
            <dl className="create-booking-page__vehicle-details">
              <div>
                <dt>{MESSAGES.VEHICLES.MODEL_LABEL}</dt>
                <dd>{vehicle.model}</dd>
              </div>
              <div>
                <dt>{MESSAGES.VEHICLES.REG_NUMBER_LABEL}</dt>
                <dd>{vehicle.regNumber}</dd>
              </div>
              <div>
                <dt>{MESSAGES.VEHICLES.LOCATION_LABEL}</dt>
                <dd>{vehicle.location}</dd>
              </div>
              <div>
                <dt>{MESSAGES.VEHICLES.DAILY_RATE_LABEL}</dt>
                <dd>{vehicle.dailyRate}</dd>
              </div>
            </dl>
          </Card>

          <Card title={MESSAGES.BOOKING.DATES_TITLE}>
            <BookingForm
              isComplete={Boolean(createdBooking)}
              isLoading={isLoading}
              onSubmit={handleCreateBooking}
            />
          </Card>
          {bookingError && <p role="alert">{bookingError}</p>}
          {createdBooking && (
            <section role="status">
              <p>{MESSAGES.BOOKING.CREATED}</p>
              <Link to={ROUTES.BOOKINGS}>
                {MESSAGES.BOOKING.VIEW_MY_BOOKINGS}
              </Link>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default CreateBookingPage;
