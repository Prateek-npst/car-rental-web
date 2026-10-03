import { Link, useLocation } from 'react-router-dom';
import Card from '@/components/ui/Card.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import BookingForm from '@/features/bookings/BookingForm.jsx';
import './CreateBookingPage.css';

function CreateBookingPage() {
  const { state } = useLocation();
  const vehicle = state?.vehicle;

  return (
    <div className="create-booking-page">
      <h1 className="create-booking-page__title">
        {MESSAGES.BOOKING.CREATE_TITLE}
      </h1>

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
            <BookingForm />
          </Card>
        </>
      )}
    </div>
  );
}

export default CreateBookingPage;
