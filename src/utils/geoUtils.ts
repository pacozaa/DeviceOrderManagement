import { getDistance } from 'geolib';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const distanceInMeters = getDistance(
    { latitude: from.latitude, longitude: from.longitude },
    { latitude: to.latitude, longitude: to.longitude }
  );
  return distanceInMeters / 1000; // Convert to kilometers
}

export function calculateShippingCost(
  distanceKm: number,
  weightKg: number,
  ratePerKgPerKm: number
): number {
  return distanceKm * weightKg * ratePerKgPerKm;
}
