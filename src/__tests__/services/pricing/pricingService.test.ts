import {
  calculateDiscount,
  calculateSubtotal,
  calculateDiscountAmount,
  calculateTotal,
  isShippingCostValid,
} from '../../../services/pricing';

// Mock config
jest.mock('../../../config/config', () => ({
  config: {
    device: {
      price: 150,
    },
    shipping: {
      maxShippingPercentage: 0.15,
    },
    discounts: [
      { minQuantity: 250, percentage: 0.2 },
      { minQuantity: 100, percentage: 0.15 },
      { minQuantity: 50, percentage: 0.1 },
      { minQuantity: 25, percentage: 0.05 },
    ],
  },
}));

describe('pricingService', () => {
  describe('calculateDiscount', () => {
    it('should return correct discount for 250+ units', () => {
      expect(calculateDiscount(250)).toBe(0.2);
      expect(calculateDiscount(300)).toBe(0.2);
    });

    it('should return correct discount for 100-249 units', () => {
      expect(calculateDiscount(100)).toBe(0.15);
      expect(calculateDiscount(150)).toBe(0.15);
    });

    it('should return correct discount for 50-99 units', () => {
      expect(calculateDiscount(50)).toBe(0.1);
      expect(calculateDiscount(75)).toBe(0.1);
    });

    it('should return correct discount for 25-49 units', () => {
      expect(calculateDiscount(25)).toBe(0.05);
      expect(calculateDiscount(40)).toBe(0.05);
    });

    it('should return 0 discount for less than 25 units', () => {
      expect(calculateDiscount(1)).toBe(0);
      expect(calculateDiscount(24)).toBe(0);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly', () => {
      expect(calculateSubtotal(1)).toBe(150);
      expect(calculateSubtotal(10)).toBe(1500);
      expect(calculateSubtotal(100)).toBe(15000);
    });
  });

  describe('calculateDiscountAmount', () => {
    it('should calculate discount amount correctly', () => {
      expect(calculateDiscountAmount(1000, 0.1)).toBe(100);
      expect(calculateDiscountAmount(15000, 0.15)).toBe(2250);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      const subtotal = 15000;
      const discountAmount = 2250;
      const shippingCost = 500;

      const total = calculateTotal(subtotal, discountAmount, shippingCost);

      expect(total).toBe(13250); // 15000 - 2250 + 500
    });
  });

  describe('isShippingCostValid', () => {
    it('should return true when shipping is within 15%', () => {
      const orderAmount = 10000;
      const shippingCost = 1000; // 10%

      expect(isShippingCostValid(shippingCost, orderAmount)).toBe(true);
    });

    it('should return true when shipping is exactly 15%', () => {
      const orderAmount = 10000;
      const shippingCost = 1500; // 15%

      expect(isShippingCostValid(shippingCost, orderAmount)).toBe(true);
    });

    it('should return false when shipping exceeds 15%', () => {
      const orderAmount = 10000;
      const shippingCost = 1600; // 16%

      expect(isShippingCostValid(shippingCost, orderAmount)).toBe(false);
    });
  });
});
