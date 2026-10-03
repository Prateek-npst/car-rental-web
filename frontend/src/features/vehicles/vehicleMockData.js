export const MOCK_VEHICLES = [
  {
    id: 'vehicle-1',
    regNumber: 'CC-101',
    model: 'City Compact',
    dailyRate: 65,
    location: 'Central City',
  },
  {
    id: 'vehicle-2',
    regNumber: 'CC-202',
    model: 'City Sedan',
    dailyRate: 85,
    location: 'Central City',
  },
  {
    id: 'vehicle-3',
    regNumber: 'NH-303',
    model: 'Trail SUV',
    dailyRate: 110,
    location: 'North Harbor',
  },
];

export const MOCK_BOOKINGS = [
  {
    vehicleId: 'vehicle-1',
    pickupDate: '2026-10-10',
    dropoffDate: '2026-10-15',
  },
  {
    vehicleId: 'vehicle-2',
    pickupDate: '2026-10-18',
    dropoffDate: '2026-10-20',
  },
];

export function searchMockVehicles({ location, pickupDate, dropoffDate }) {
  const requestedLocation = location.trim().toLowerCase();

  return MOCK_VEHICLES.filter((vehicle) => {
    const isInLocation = vehicle.location.toLowerCase() === requestedLocation;
    const hasOverlappingBooking = MOCK_BOOKINGS.some(
      (booking) =>
        booking.vehicleId === vehicle.id &&
        pickupDate <= booking.dropoffDate &&
        dropoffDate >= booking.pickupDate,
    );

    return isInLocation && !hasOverlappingBooking;
  });
}
