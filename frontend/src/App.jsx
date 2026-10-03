import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout.jsx';
import AdminVehiclesPage from '@/pages/AdminVehiclesPage.jsx';
import CreateBookingPage from '@/pages/CreateBookingPage.jsx';
import MyBookingsPage from '@/pages/MyBookingsPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegistrationPage from '@/pages/RegistrationPage.jsx';
import VehiclesPage from '@/pages/VehiclesPage.jsx';
import { ROUTES } from '@/constants/routes.js';
import { ROLES } from '@/constants/roles.js';
import ProtectedRoute from '@/components/routing/ProtectedRoute.jsx';
import RoleRoute from '@/components/routing/RoleRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute guestOnly />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegistrationPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.VEHICLES} element={<VehiclesPage />} />

            <Route
              path={ROUTES.BOOKINGS}
              element={<MyBookingsPage />}
            />

            <Route
              path={ROUTES.CREATE_BOOKING}
              element={<CreateBookingPage />}
            />

            <Route
              path={ROUTES.ADMIN_VEHICLES}
              element={
                <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminVehiclesPage />
                </RoleRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_VEHICLE_CREATE}
              element={
                <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                  <Navigate to={ROUTES.ADMIN_VEHICLES} replace />
                </RoleRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to={ROUTES.VEHICLES} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
