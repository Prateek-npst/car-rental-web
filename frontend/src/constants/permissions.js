import { ROLES } from '@/constants/roles.js';

export function hasRole(user, role) {
  return Boolean(user?.role) && user.role === role;
}

export function hasAnyRole(user, allowedRoles = []) {
  return allowedRoles.some((role) => hasRole(user, role));
}

export function canAccess(user, allowedRoles = []) {
  if (!allowedRoles.length) {
    return Boolean(user);
  }

  return hasAnyRole(user, allowedRoles);
}

export function isAdmin(user) {
  return hasRole(user, ROLES.ADMIN);
}

export function canManageBooking(user, booking) {
  return isAdmin(user) || Boolean(user?.id && booking?.userId === user.id);
}
