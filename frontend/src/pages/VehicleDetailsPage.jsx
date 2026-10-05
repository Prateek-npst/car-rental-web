import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import PageHeading from '@/components/ui/PageHeading.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import VehicleImage from '@/features/vehicles/VehicleImage.jsx';
import { getVehicleById } from '@/services/vehicleService.js';
import './VehicleDetailsPage.css';

function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const currentResult = result?.id === id ? result : null;

  useEffect(() => {
    let isCurrent = true;

    getVehicleById(id)
      .then((vehicle) => {
        if (isCurrent) {
          setResult({ id, status: 'success', vehicle });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          const isNotFound = error?.cause?.response?.status === 404;
          setResult({
            id,
            status: isNotFound ? 'not-found' : 'error',
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [id, retryVersion]);

  const vehicle = currentResult?.vehicle;

  return (
    <div className="vehicle-details-page">
      <PageHeading
        breadcrumbs={[
          { label: MESSAGES.NAVIGATION.VEHICLES, to: ROUTES.VEHICLES },
          { label: MESSAGES.VEHICLES.DETAILS_TITLE },
        ]}
        title={MESSAGES.VEHICLES.DETAILS_TITLE}
      />

      {!currentResult ? (
        <p className="vehicle-details-page__state" role="status">
          {MESSAGES.COMMON.LOADING}
        </p>
      ) : currentResult.status === 'not-found' ? (
        <section className="vehicle-details-page__state" role="status">
          <p>{MESSAGES.VEHICLES.DETAILS_NOT_FOUND}</p>
          <Link to={ROUTES.VEHICLES}>{MESSAGES.VEHICLES.BACK_TO_VEHICLES}</Link>
        </section>
      ) : currentResult.status === 'error' ? (
        <section className="vehicle-details-page__state" role="alert">
          <p>{MESSAGES.VEHICLES.DETAILS_FAILED}</p>
          <Button
            onClick={() => {
              setResult({ id, status: 'loading' });
              setRetryVersion((version) => version + 1);
            }}
          >
            {MESSAGES.DASHBOARD.RETRY}
          </Button>
        </section>
      ) : (
        <article className="vehicle-details-page__vehicle">
          <VehicleImage vehicle={vehicle} />
          <div className="vehicle-details-page__content">
            <h2>{vehicle.model}</h2>
            <dl>
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
                <dd>{vehicle.dailyRate} / day</dd>
              </div>
            </dl>
            <div className="vehicle-details-page__actions">
              <Link to={ROUTES.VEHICLES}>
                {MESSAGES.VEHICLES.BACK_TO_VEHICLES}
              </Link>
              <Button
                onClick={() =>
                  navigate(ROUTES.CREATE_BOOKING, { state: { vehicle } })
                }
              >
                {MESSAGES.VEHICLES.CONTINUE_TO_BOOKING}
              </Button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

export default VehicleDetailsPage;