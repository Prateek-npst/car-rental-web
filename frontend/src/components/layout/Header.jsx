import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { ROLES } from '@/constants/roles.js';
import { useAuth } from '@/context/AuthContext.jsx';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <header className="header">
      <div className="header__content">
        <Link className="header__brand" to={ROUTES.VEHICLES}>
          Car Rental Booking
        </Link>

        <nav aria-label="Main navigation">
          {isAuthenticated && (
            <>
              <Link className="header__link" to={ROUTES.VEHICLES}>
                Vehicles
              </Link>

              <Link className="header__link" to={ROUTES.BOOKINGS}>
                My Bookings
              </Link>

              {user?.role === ROLES.ADMIN && (
                <Link className="header__link" to={ROUTES.ADMIN_VEHICLES}>
                  {MESSAGES.VEHICLES.ADMIN_NAV}
                </Link>
              )}

              <Button
                className="header__logout"
                onClick={handleLogout}
                type="button"
              >
                {MESSAGES.AUTH.LOGOUT}
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;