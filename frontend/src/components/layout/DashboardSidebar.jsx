import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import { getNavigationForRole } from '@/constants/navigation.js';
import { useAuth } from '@/context/AuthContext.jsx';
import './DashboardSidebar.css';

function DashboardSidebar({ isOpen, onNavigate }) {
  const { user } = useAuth();
  const navigationItems = getNavigationForRole(user?.role);

  return (
    <aside
      className={`dashboard-sidebar${isOpen ? ' dashboard-sidebar--open' : ''}`}
      id="dashboard-sidebar"
    >
      <p className="dashboard-sidebar__heading">
        {MESSAGES.NAVIGATION.WORKSPACE}
      </p>
      <nav aria-label={MESSAGES.NAVIGATION.MAIN_NAV_LABEL}>
        <ul className="dashboard-sidebar__list">
          {navigationItems.map((item) => (
            <li key={item.key}>
              <NavLink
                className={({ isActive }) =>
                  `dashboard-sidebar__link${isActive ? ' dashboard-sidebar__link--active' : ''}`
                }
                end={item.end}
                onClick={onNavigate}
                to={item.route}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

DashboardSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onNavigate: PropTypes.func,
};

export default DashboardSidebar;