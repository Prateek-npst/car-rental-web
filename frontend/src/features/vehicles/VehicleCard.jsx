import PropTypes from 'prop-types';
import Button from '@/components/ui/Button.jsx';
import { MESSAGES } from '@/constants/messages.js';
import './VehicleCard.css';

function VehicleCard({ vehicle, onSelect }) {
  return (
    <li className="vehicle-card">
      <article>
        <h3 className="vehicle-card__title">{vehicle.model}</h3>
        <dl className="vehicle-card__details">
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
        <Button type="button" onClick={() => onSelect(vehicle)}>
          {MESSAGES.VEHICLES.SELECT_VEHICLE}
        </Button>
      </article>
    </li>
  );
}

VehicleCard.propTypes = {
  vehicle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    regNumber: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    dailyRate: PropTypes.number.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default VehicleCard;
