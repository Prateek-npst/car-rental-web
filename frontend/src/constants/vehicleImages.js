const VEHICLE_IMAGE_URLS = Object.freeze({
  compact:
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  sedan:
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
});

export function getVehicleImageUrl(vehicle) {
  const description = `${vehicle.model} ${vehicle.regNumber}`.toLowerCase();

  if (/suv|trail|nh-/.test(description)) {
    return VEHICLE_IMAGE_URLS.suv;
  }

  if (/compact|cc-101/.test(description)) {
    return VEHICLE_IMAGE_URLS.compact;
  }

  return VEHICLE_IMAGE_URLS.sedan;
}
