import PropTypes from 'prop-types';
import Button from '@/components/ui/Button.jsx';
import { MESSAGES } from '@/constants/messages.js';
import VehicleImage from '@/features/vehicles/VehicleImage.jsx';
import './VehicleCard.css';

function VehicleCard({
  vehicle,
  onSelect,
  onEdit,
  onDelete,
  deletingVehicleId = null,
}) {
  const isManaging = Boolean(onEdit && onDelete);

  return (
    <li className="vehicle-card">
      <article className="vehicle-card__article">
        <VehicleImage vehicle={vehicle} />
        <div className="vehicle-card__content">
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
              <dd>
                <strong>{vehicle.dailyRate}</strong> <span>/ day</span>
              </dd>
            </div>
          </dl>
          {isManaging ? (
            <div className="vehicle-card__actions">
              <Button
                className="vehicle-card__action"
                onClick={() => onEdit(vehicle)}
                type="button"
                variant="secondary"
              >
                {MESSAGES.VEHICLES.ADMIN_EDIT}
              </Button>
              <Button
                className="vehicle-card__action vehicle-card__delete"
                disabled={deletingVehicleId !== null}
                isLoading={deletingVehicleId === vehicle.id}
                onClick={() => onDelete(vehicle)}
                type="button"
                variant="secondary"
              >
                {MESSAGES.VEHICLES.ADMIN_DELETE}
              </Button>
            </div>
          ) : (
            <Button
              className="vehicle-card__action"
              type="button"
              onClick={() => onSelect(vehicle)}
            >
              {MESSAGES.VEHICLES.SELECT_VEHICLE}
            </Button>
          )}
        </div>
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
  onSelect: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  deletingVehicleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default VehicleCard;
