import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import Card from '@/components/ui/Card.jsx';
import PageHeading from '@/components/ui/PageHeading.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { getBookings } from '@/services/bookingService.js';
import './DashboardPage.css';

function DashboardPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);

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
          setLoadError(error.message || MESSAGES.DASHBOARD.LOAD_FAILED);
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
  }, [reloadVersion]);

  const recentBookings = [...bookings]
    .sort((first, second) => second.startDate.localeCompare(first.startDate))
    .slice(0, 3);

  function retryLoad() {
    setIsLoading(true);
    setLoadError('');
    setReloadVersion((version) => version + 1);
  }

  return (
    <div className="dashboard-page">
      <PageHeading
        breadcrumbs={[{ label: MESSAGES.DASHBOARD.TITLE }]}
        description={MESSAGES.DASHBOARD.DESCRIPTION}
        title={MESSAGES.DASHBOARD.TITLE}
        actions={
          <>
          <Link className="dashboard-page__link" to={ROUTES.VEHICLES}>
            {MESSAGES.DASHBOARD.FIND_VEHICLE}
          </Link>
          <Link className="dashboard-page__link" to={ROUTES.BOOKINGS}>
            {MESSAGES.DASHBOARD.VIEW_BOOKINGS}
          </Link>
          </>
        }
      />

      {isLoading ? (
        <p className="dashboard-page__state" role="status">
          {MESSAGES.COMMON.LOADING}
        </p>
      ) : loadError ? (
        <section
          className="dashboard-page__state"
          aria-labelledby="dashboard-error-title"
          role="alert"
        >
          <h2 id="dashboard-error-title">{loadError}</h2>
          <Button onClick={retryLoad}>
            {MESSAGES.DASHBOARD.RETRY}
          </Button>
        </section>
      ) : (
        <>
          <section className="dashboard-page__summary" aria-label={MESSAGES.DASHBOARD.SUMMARY}>
            <Card title={MESSAGES.DASHBOARD.SUMMARY}>
              <p className="dashboard-page__count">{bookings.length}</p>
              <p>{MESSAGES.DASHBOARD.BOOKING_COUNT}</p>
            </Card>
          </section>

          {bookings.length === 0 ? (
            <section
              className="dashboard-page__empty"
              aria-labelledby="dashboard-empty-title"
              role="status"
            >
              <h2 id="dashboard-empty-title">{MESSAGES.DASHBOARD.EMPTY_TITLE}</h2>
              <p>{MESSAGES.DASHBOARD.EMPTY_DESCRIPTION}</p>
              <Link className="dashboard-page__link" to={ROUTES.VEHICLES}>
                {MESSAGES.DASHBOARD.FIND_VEHICLE}
              </Link>
            </section>
          ) : (
            <section aria-labelledby="dashboard-recent-title">
              <h2 id="dashboard-recent-title" className="dashboard-page__section-title">
                {MESSAGES.DASHBOARD.RECENT_TITLE}
              </h2>
              <ul className="dashboard-page__bookings">
                {recentBookings.map((booking) => (
                  <li key={booking.id}>
                    <Card title={booking.vehicle.model}>
                      <dl className="dashboard-page__details">
                        <div>
                          <dt>{MESSAGES.BOOKING.BOOKING_ID}</dt>
                          <dd>{booking.id}</dd>
                        </div>
                        <div>
                          <dt>{MESSAGES.VEHICLES.LOCATION_LABEL}</dt>
                          <dd>{booking.vehicle.location}</dd>
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
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;