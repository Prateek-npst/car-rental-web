import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';
import { canAccess } from '@/constants/permissions.js';
import { ROUTES } from '@/constants/routes.js';
import { useAuth } from '@/context/AuthContext.jsx';
import ForbiddenPage from '@/pages/ForbiddenPage.jsx';

function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, isRestoring, user } = useAuth();
  const location = useLocation();

  if (isRestoring) {
    return <p role="status">{MESSAGES.COMMON.LOADING}</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!canAccess(user, allowedRoles)) {
    return <ForbiddenPage />;
  }

  return children || <Outlet />;
}

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.oneOf(Object.values(ROLES)))
    .isRequired,
  children: PropTypes.node,
};

export default RoleRoute;