import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import VehicleCard from '@/features/vehicles/VehicleCard.jsx';
import VehicleSearchForm from '@/features/vehicles/VehicleSearchForm.jsx';
import { searchMockVehicles } from '@/features/vehicles/vehicleMockData.js';
import './VehiclesPage.css';

function VehiclesPage() {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState(null);
  const availableVehicles = searchCriteria
    ? searchMockVehicles(searchCriteria)
    : [];

  function handleSearch(criteria) {
    setSearchCriteria(criteria);
  }

  function handleSelectVehicle(vehicle) {
    navigate(ROUTES.CREATE_BOOKING, { state: { vehicle } });
  }

  return (
    <div className="vehicles-page">
      <h1 className="vehicles-page__title">{MESSAGES.VEHICLES.TITLE}</h1>
      <VehicleSearchForm onSearch={handleSearch} />

      {searchCriteria && (
        <section
          className="vehicles-page__criteria"
          aria-labelledby="vehicles-search-criteria-title"
          aria-live="polite"
        >
          <h2 id="vehicles-search-criteria-title">
            {MESSAGES.VEHICLES.SEARCH_CRITERIA}
          </h2>
          <dl>
            <div>
              <dt>{MESSAGES.VEHICLES.LOCATION_LABEL}</dt>
              <dd>{searchCriteria.location}</dd>
            </div>
            <div>
              <dt>{MESSAGES.VEHICLES.PICKUP_DATE_LABEL}</dt>
              <dd>{searchCriteria.pickupDate}</dd>
            </div>
            <div>
              <dt>{MESSAGES.VEHICLES.DROPOFF_DATE_LABEL}</dt>
              <dd>{searchCriteria.dropoffDate}</dd>
            </div>
          </dl>
        </section>
      )}

      {searchCriteria && (
        <section
          className="vehicles-page__results"
          aria-labelledby="vehicles-results-title"
          aria-live="polite"
        >
          <h2 id="vehicles-results-title">
            {MESSAGES.VEHICLES.AVAILABLE_VEHICLES}
          </h2>
          {availableVehicles.length > 0 ? (
            <ul className="vehicles-page__list">
              {availableVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelect={handleSelectVehicle}
                />
              ))}
            </ul>
          ) : (
            <p role="status">{MESSAGES.VEHICLES.NO_AVAILABLE_VEHICLES}</p>
          )}
        </section>
      )}
    </div>
  );
}

export default VehiclesPage;
