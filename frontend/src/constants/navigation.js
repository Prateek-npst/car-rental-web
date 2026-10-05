import { MESSAGES } from '@/constants/messages.js';
import { ROLES } from '@/constants/roles.js';
import { ROUTES } from '@/constants/routes.js';

const AUTHENTICATED_ROLES = Object.freeze([ROLES.USER, ROLES.ADMIN]);

export const NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({
    key: 'dashboard',
    label: MESSAGES.NAVIGATION.DASHBOARD,
    route: ROUTES.DASHBOARD,
    allowedRoles: AUTHENTICATED_ROLES,
  }),
  Object.freeze({
    key: 'vehicles',
    label: MESSAGES.NAVIGATION.VEHICLES,
    route: ROUTES.VEHICLES,
    allowedRoles: AUTHENTICATED_ROLES,
    end: true,
  }),
  Object.freeze({
    key: 'user-bookings',
    label: MESSAGES.NAVIGATION.MY_BOOKINGS,
    route: ROUTES.BOOKINGS,
    allowedRoles: Object.freeze([ROLES.USER]),
  }),
  Object.freeze({
    key: 'admin-bookings',
    label: MESSAGES.NAVIGATION.ALL_BOOKINGS,
    route: ROUTES.BOOKINGS,
    allowedRoles: Object.freeze([ROLES.ADMIN]),
  }),
  Object.freeze({
    key: 'admin-vehicles',
    label: MESSAGES.VEHICLES.ADMIN_NAV,
    route: ROUTES.ADMIN_VEHICLES,
    allowedRoles: Object.freeze([ROLES.ADMIN]),
  }),
  Object.freeze({
    key: 'profile',
    label: MESSAGES.NAVIGATION.PROFILE,
    route: ROUTES.PROFILE,
    allowedRoles: AUTHENTICATED_ROLES,
  }),
]);

export function getNavigationForRole(role) {
  return NAVIGATION_ITEMS.filter((item) => item.allowedRoles.includes(role));
}