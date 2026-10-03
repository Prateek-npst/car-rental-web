import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.js';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header__content">
        <Link className="header__brand" to={ROUTES.VEHICLES}>
          Car Rental Booking
        </Link>

        <nav aria-label="Main navigation">
          <Link className="header__link" to={ROUTES.VEHICLES}>
            Vehicles
          </Link>

          <Link className="header__link" to={ROUTES.BOOKINGS}>
            My Bookings
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;