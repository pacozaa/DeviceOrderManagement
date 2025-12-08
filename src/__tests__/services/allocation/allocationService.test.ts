import { calculateOptimalAllocation } from '../../../services/allocation';
import { Warehouse } from '../../../types/order.types';
import { Coordinates } from '../../../utils/geoUtils';

// Mock config and geoUtils
jest.mock('../../../config/config', () => ({
  config: {
    device: {
      weightKg: 0.365,
    },
    shipping: {
      ratePerKgPerKm: 0.01,
    },
  },
}));

jest.mock('../../../utils/geoUtils', () => ({
  calculateDistance: jest.fn((from, _) => {
    // Simple mock: return different distances based on warehouse
    const warehouseDistances: Record<string, number> = {
      'wh-1': 100,
      'wh-2': 200,
      'wh-3': 300,
    };
    return warehouseDistances[from.id] || 1000;
  }),
  calculateShippingCost: jest.fn((distance, weight, rate) => {
    return distance * weight * rate;
  }),
}));

describe('allocationService', () => {
  describe('calculateOptimalAllocation', () => {
    const mockWarehouses: Warehouse[] = [
      { id: 'wh-1', name: 'Warehouse 1', latitude: 0, longitude: 0, stock: 100 },
      { id: 'wh-2', name: 'Warehouse 2', latitude: 0, longitude: 0, stock: 200 },
      { id: 'wh-3', name: 'Warehouse 3', latitude: 0, longitude: 0, stock: 150 },
    ];

    const shippingAddress: Coordinates = { latitude: 10, longitude: 10 };

    it('should allocate from single warehouse when sufficient stock', () => {
      const allocations = calculateOptimalAllocation(mockWarehouses, 50, shippingAddress);

      expect(allocations).toHaveLength(1);
      expect(allocations[0].quantity).toBe(50);
    });

    it('should allocate from multiple warehouses when needed', () => {
      const warehouses: Warehouse[] = [
        { id: 'wh-1', name: 'WH1', latitude: 0, longitude: 0, stock: 50 },
        { id: 'wh-2', name: 'WH2', latitude: 0, longitude: 0, stock: 30 },
      ];

      const allocations = calculateOptimalAllocation(warehouses, 70, shippingAddress);

      expect(allocations).toHaveLength(2);
      expect(allocations[0].quantity + allocations[1].quantity).toBe(70);
    });

    it('should throw error when insufficient total stock', () => {
      const warehouses: Warehouse[] = [
        { id: 'wh-1', name: 'WH1', latitude: 0, longitude: 0, stock: 10 },
      ];

      expect(() => {
        calculateOptimalAllocation(warehouses, 100, shippingAddress);
      }).toThrow('Insufficient stock');
    });

    it('should skip warehouses with zero stock', () => {
      const warehouses: Warehouse[] = [
        { id: 'wh-1', name: 'WH1', latitude: 0, longitude: 0, stock: 0 },
        { id: 'wh-2', name: 'WH2', latitude: 0, longitude: 0, stock: 100 },
      ];

      const allocations = calculateOptimalAllocation(warehouses, 50, shippingAddress);

      expect(allocations).toHaveLength(1);
      expect(allocations[0].warehouseId).toBe('wh-2');
    });
  });
});
