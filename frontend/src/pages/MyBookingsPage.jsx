import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';
import { useAuth } from '@/context/AuthContext.jsx';
import BookingForm from '@/features/bookings/BookingForm.jsx';
import {
  deleteBooking,
  getBookings,
  updateBooking,
} from '@/services/bookingService.js';
import './MyBookingsPage.css';

function MyBookingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [savingBookingId, setSavingBookingId] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    getBookings()
      .then((result) => {
        if (isCurrent) {
          setBookings(result);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(error.message || MESSAGES.BOOKING.LOAD_FAILED);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [refreshVersion]);

  async function handleUpdate(booking, dates) {
    if (savingBookingId !== null || deletingBookingId !== null) {
      return;
    }

    setSavingBookingId(booking.id);
    setActionError('');
    setActionMessage('');

    try {
      await updateBooking(booking.id, {
        vehicleId: booking.vehicleId,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
      setEditingBookingId(null);
      setActionMessage(MESSAGES.BOOKING.UPDATED);
      setLoadError('');
      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setActionError(error.message || MESSAGES.BOOKING.UPDATE_FAILED);
    } finally {
      setSavingBookingId(null);
    }
  }

  async function handleDelete(booking) {
    if (savingBookingId !== null || deletingBookingId !== null) {
      return;
    }

    if (!window.confirm(MESSAGES.BOOKING.CONFIRM_CANCEL)) {
      return;
    }

    setDeletingBookingId(booking.id);
    setActionError('');
    setActionMessage('');

    try {
      await deleteBooking(booking.id);
      setEditingBookingId(null);
      setActionMessage(MESSAGES.BOOKING.DELETED);
      setLoadError('');
      setIsLoading(true);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      setActionError(error.message || MESSAGES.BOOKING.DELETE_FAILED);
    } finally {
      setDeletingBookingId(null);
    }
  }

  const isMutating = savingBookingId !== null || deletingBookingId !== null;

  return (
    <div className="my-bookings-page">
      <header className="my-bookings-page__heading">
        <h1 className="my-bookings-page__title">
          {isAdmin
            ? MESSAGES.BOOKING.ALL_BOOKINGS_TITLE
            : MESSAGES.BOOKING.MY_BOOKINGS_TITLE}
        </h1>
        <p>
          {isAdmin
            ? MESSAGES.BOOKING.ALL_BOOKINGS_DESCRIPTION
            : MESSAGES.BOOKING.MY_BOOKINGS_DESCRIPTION}
        </p>
      </header>

      {actionError && <p role="alert">{actionError}</p>}
      {actionMessage && <p role="status">{actionMessage}</p>}

      {isLoading ? (
        <p role="status">{MESSAGES.COMMON.LOADING}</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : bookings.length === 0 ? (
        <p role="status">{MESSAGES.BOOKING.EMPTY_LIST}</p>
      ) : (
        <ul className="my-bookings-page__list">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <Card title={booking.vehicle.model}>
                <dl className="my-bookings-page__details">
                  <div>
                    <dt>{MESSAGES.BOOKING.BOOKING_ID}</dt>
                    <dd>{booking.id}</dd>
                  </div>
                  <div>
                    <dt>{MESSAGES.VEHICLES.REG_NUMBER_LABEL}</dt>
                    <dd>{booking.vehicle.regNumber}</dd>
                  </div>
                  <div>
                    <dt>{MESSAGES.VEHICLES.LOCATION_LABEL}</dt>
                    <dd>{booking.vehicle.location}</dd>
                  </div>
                  <div>
                    <dt>{MESSAGES.VEHICLES.DAILY_RATE_LABEL}</dt>
                    <dd>{booking.vehicle.dailyRate}</dd>
                  </div>
                  <div>
                    <dt>{MESSAGES.BOOKING.START_DATE_LABEL}</dt>
                    <dd>{booking.startDate}</dd>
                  </div>
                  <div>
                    <dt>{MESSAGES.BOOKING.END_DATE_LABEL}</dt>
                    <dd>{booking.endDate}</dd>
                  </div>
                </dl>

                {editingBookingId === booking.id ? (
                  <BookingForm
                    key={booking.id}
                    initialDates={{
                      startDate: booking.startDate,
                      endDate: booking.endDate,
                    }}
                    isLoading={savingBookingId === booking.id}
                    onCancel={() => setEditingBookingId(null)}
                    onSubmit={(dates) => handleUpdate(booking, dates)}
                    submitLabel={MESSAGES.BOOKING.UPDATE}
                  />
                ) : (
                  <div className="my-bookings-page__actions">
                    <Button
                      disabled={isMutating}
                      onClick={() => setEditingBookingId(booking.id)}
                      type="button"
                      variant="secondary"
                    >
                      {MESSAGES.BOOKING.EDIT}
                    </Button>
                    <Button
                      disabled={isMutating}
                      isLoading={deletingBookingId === booking.id}
                      onClick={() => handleDelete(booking)}
                      type="button"
                    >
                      {MESSAGES.BOOKING.CANCEL_BOOKING}
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyBookingsPage;
