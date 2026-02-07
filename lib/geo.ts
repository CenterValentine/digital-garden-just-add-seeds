const EARTH_RADIUS_M = 6371000;

export type LatLng = { lat: number; lng: number };

export function haversineDistance(a: LatLng, b: LatLng) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

export function polygonWithinRadius(points: LatLng[], center: LatLng, radiusMeters: number) {
  return points.every((point) => haversineDistance(point, center) <= radiusMeters);
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}
