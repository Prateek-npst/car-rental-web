export const ROUTES = Object.freeze({
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  VEHICLE_DETAILS: '/vehicles/:id',
  PROFILE: '/profile',
  BOOKINGS: '/bookings',
  CREATE_BOOKING: '/bookings/new',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_VEHICLE_CREATE: '/admin/vehicles/new',
});

export function getVehicleDetailsRoute(vehicleId) {
  return ROUTES.VEHICLE_DETAILS.replace(':id', encodeURIComponent(vehicleId));
}
