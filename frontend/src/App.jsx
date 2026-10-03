import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout.jsx';
import CreateBookingPage from '@/pages/CreateBookingPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegistrationPage from '@/pages/RegistrationPage.jsx';
import VehiclesPage from '@/pages/VehiclesPage.jsx';
import { ROUTES } from '@/constants/routes.js';

function PlaceholderPage({ title }) {
  return <h1>{title}</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegistrationPage />} />

          <Route path={ROUTES.VEHICLES} element={<VehiclesPage />} />

          <Route
            path={ROUTES.BOOKINGS}
            element={<PlaceholderPage title="My Bookings" />}
          />

          <Route path={ROUTES.CREATE_BOOKING} element={<CreateBookingPage />} />

          <Route
            path={ROUTES.ADMIN_VEHICLE_CREATE}
            element={<PlaceholderPage title="Create Vehicle" />}
          />

          <Route path="*" element={<Navigate to={ROUTES.VEHICLES} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
