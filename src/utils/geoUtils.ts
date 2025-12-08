import { getDistance } from 'geolib';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const distanceInMeters = getDistance(
    { latitude: from.latitude, longitude: from.longitude },
    { latitude: to.latitude, longitude: to.longitude }
  );
  return distanceInMeters / 1000; // Convert to kilometers
}

/**
 * Calculate shipping cost based on distance and weight
 */
export function calculateShippingCost(
  distanceKm: number,
  weightKg: number,
  ratePerKgPerKm: number
): number {
  return distanceKm * weightKg * ratePerKgPerKm;
}
