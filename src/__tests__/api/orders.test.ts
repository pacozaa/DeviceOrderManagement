import request from 'supertest';
import app from '../../index';

// Mock the services
jest.mock('../../services/orderService');
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    warehouse: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    orderAllocation: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { verifyOrder, createOrder } from '../../services/orderService';

const mockVerifyOrder = verifyOrder as jest.MockedFunction<typeof verifyOrder>;
const mockCreateOrder = createOrder as jest.MockedFunction<typeof createOrder>;

describe('Order API Integration Tests', () => {
  describe('POST /api/orders/verify', () => {
    it('should verify a valid order', async () => {
      const mockResult = {
        quantity: 10,
        subtotal: 1500,
        discount: 0,
        discountAmount: 0,
        shippingCost: 50,
        total: 1550,
        allocations: [],
        isValid: true,
      };

      mockVerifyOrder.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/orders/verify')
        .send({
          quantity: 10,
          shippingAddress: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(mockResult);
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/orders/verify')
        .send({
          quantity: -5, // Invalid
          shippingAddress: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        })
        .expect(400);

      expect(response.body.error).toContain('Validation error');
    });

    it('should return 400 for invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/orders/verify')
        .send({
          quantity: 10,
          shippingAddress: {
            latitude: 200, // Invalid
            longitude: -74.006,
          },
        })
        .expect(400);

      expect(response.body.error).toContain('Validation error');
    });
  });

  describe('POST /api/orders', () => {
    it('should create a valid order', async () => {
      const mockResult = {
        orderId: 'order-123',
        orderNumber: 'ORD-123456',
        calculation: {
          quantity: 50,
          subtotal: 7500,
          discount: 0.1,
          discountAmount: 750,
          shippingCost: 200,
          total: 6950,
          allocations: [],
          isValid: true,
        },
      };

      mockCreateOrder.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/orders')
        .send({
          quantity: 50,
          shippingAddress: {
            latitude: 40.7128,
            longitude: -74.006,
          },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe('ORD-123456');
    });
  });
});
