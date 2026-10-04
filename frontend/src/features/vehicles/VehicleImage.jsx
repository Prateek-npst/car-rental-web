import PropTypes from 'prop-types';
import { getVehicleImageUrl } from '@/constants/vehicleImages.js';
import './VehicleImage.css';

function VehicleImage({ vehicle }) {
  return (
    <img
      alt={`${vehicle.model} vehicle`}
      className="vehicle-image"
      loading="lazy"
      src={getVehicleImageUrl(vehicle)}
    />
  );
}

VehicleImage.propTypes = {
  vehicle: PropTypes.shape({
    model: PropTypes.string.isRequired,
    regNumber: PropTypes.string.isRequired,
  }).isRequired,
};

export default VehicleImage;
