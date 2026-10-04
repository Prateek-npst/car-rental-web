import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { ROLES } from '@/constants/roles.js';
import { useAuth } from '@/context/AuthContext.jsx';
import './Header.css';

function getInitials(name) {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return initials || 'U';
}

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const profileToggleRef = useRef(null);
  const isAdmin = user?.role === ROLES.ADMIN;
  const profileName = user?.name || MESSAGES.NAVIGATION.PROFILE;

  function closeProfile() {
    setIsProfileOpen(false);
  }

  useEffect(() => {
    if (!isProfileOpen) {
      return undefined;
    }

    function closeOnOutsideClick(event) {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        profileToggleRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isProfileOpen]);

  function handleLogout() {
    setIsProfileOpen(false);
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  function navLinkClass({ isActive }) {
    return `header__link${isActive ? ' header__link--active' : ''}`;
  }

  return (
    <header className="header">
      <div className="header__content">
        <Link className="header__brand" onClick={closeProfile} to={ROUTES.VEHICLES}>
          <span aria-hidden="true" className="header__brand-mark">
            CR
          </span>
          <span>{MESSAGES.APP.NAME}</span>
        </Link>

        <div className="header__tools">
          {isAuthenticated && (
            <nav aria-label="Main navigation" className="header__nav">
              <NavLink className={navLinkClass} end onClick={closeProfile} to={ROUTES.VEHICLES}>
                {MESSAGES.NAVIGATION.VEHICLES}
              </NavLink>
              <NavLink className={navLinkClass} onClick={closeProfile} to={ROUTES.BOOKINGS}>
                {isAdmin
                  ? MESSAGES.NAVIGATION.ALL_BOOKINGS
                  : MESSAGES.NAVIGATION.MY_BOOKINGS}
              </NavLink>
              {isAdmin && (
                <NavLink className={navLinkClass} onClick={closeProfile} to={ROUTES.ADMIN_VEHICLES}>
                  {MESSAGES.VEHICLES.ADMIN_NAV}
                </NavLink>
              )}
            </nav>
          )}

          {isAuthenticated && (
            <div className="header__profile" ref={profileRef}>
              <Button
                aria-controls="header-profile-panel"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                aria-label={`${profileName}, ${MESSAGES.NAVIGATION.PROFILE}`}
                className="header__profile-toggle"
                onClick={() => setIsProfileOpen((open) => !open)}
                ref={profileToggleRef}
                type="button"
                variant="secondary"
              >
                <span aria-hidden="true" className="header__avatar">
                  {getInitials(user?.name)}
                </span>
                <span className="header__profile-name">{profileName}</span>
                <span aria-hidden="true" className="header__profile-caret">
                  {isProfileOpen ? '^' : 'v'}
                </span>
              </Button>

              {isProfileOpen && (
                <section
                  aria-label={MESSAGES.NAVIGATION.PROFILE}
                  className="header__profile-panel"
                  id="header-profile-panel"
                >
                  <p className="header__account-name">
                    {user?.name ||
                      MESSAGES.NAVIGATION.ACCOUNT_DETAILS_UNAVAILABLE}
                  </p>
                  <p className="header__account-email">
                    {user?.email ||
                      MESSAGES.NAVIGATION.ACCOUNT_DETAILS_UNAVAILABLE}
                  </p>
                  <p className="header__account-role">
                    {user?.role || ROLES.USER}
                  </p>
                  <Button
                    className="header__profile-logout"
                    onClick={handleLogout}
                    type="button"
                    variant="secondary"
                  >
                    {MESSAGES.AUTH.LOGOUT}
                  </Button>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
