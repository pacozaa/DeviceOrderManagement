import { calculateDistance, calculateShippingCost, Coordinates } from '../../utils/geoUtils';

describe('geoUtils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const from: Coordinates = { latitude: 33.9425, longitude: -118.408056 }; // Los Angeles
      const to: Coordinates = { latitude: 40.639722, longitude: -73.778889 }; // New York

      const distance = calculateDistance(from, to);

      // Distance between LA and NY is approximately 3936 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same coordinates', () => {
      const coords: Coordinates = { latitude: 33.9425, longitude: -118.408056 };

      const distance = calculateDistance(coords, coords);

      expect(distance).toBe(0);
    });
  });

  describe('calculateShippingCost', () => {
    it('should calculate shipping cost correctly', () => {
      const distanceKm = 1000;
      const weightKg = 0.365;
      const ratePerKgPerKm = 0.01;

      const cost = calculateShippingCost(distanceKm, weightKg, ratePerKgPerKm);

      expect(cost).toBe(3.65); // 1000 * 0.365 * 0.01
    });

    it('should return 0 for zero distance', () => {
      const cost = calculateShippingCost(0, 0.365, 0.01);
      expect(cost).toBe(0);
    });

    it('should return 0 for zero weight', () => {
      const cost = calculateShippingCost(1000, 0, 0.01);
      expect(cost).toBe(0);
    });
  });
});
