import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { MESSAGES } from '@/constants/messages.js';
import { ROUTES } from '@/constants/routes.js';
import { useAuth } from '@/context/AuthContext.jsx';

function ProtectedRoute({ children, guestOnly = false }) {
  const { isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) {
    return <p role="status">{MESSAGES.COMMON.LOADING}</p>;
  }

  if (guestOnly) {
    return isAuthenticated ? (
      <Navigate to={ROUTES.VEHICLES} replace />
    ) : (
      children || <Outlet />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children || <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  guestOnly: PropTypes.bool,
};

export default ProtectedRoute;