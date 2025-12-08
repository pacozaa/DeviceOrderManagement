import { Coordinates } from '../utils/geoUtils';
import { OrderCalculation, CreateOrderResult } from '../types/order.types';
import { getAllWarehouses, updateWarehouseStock, hasSufficientStock } from './warehouseService';
import { calculateOptimalAllocation, calculateTotalShippingCost } from './allocationService';
import {
  calculateDiscount,
  calculateSubtotal,
  calculateDiscountAmount,
  calculateTotal,
  isShippingCostValid,
} from './pricingService';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Verify an order without submitting it
 */
export async function verifyOrder(
  quantity: number,
  shippingAddress: Coordinates
): Promise<OrderCalculation> {
  // Check sufficient stock
  const hasStock = await hasSufficientStock(quantity);
  if (!hasStock) {
    return {
      quantity,
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      shippingCost: 0,
      total: 0,
      allocations: [],
      isValid: false,
      invalidReason: 'Insufficient stock available',
    };
  }

  // Get all warehouses
  const warehouses = await getAllWarehouses();

  // Calculate optimal allocation
  let allocations;
  try {
    allocations = calculateOptimalAllocation(warehouses, quantity, shippingAddress);
  } catch (error) {
    return {
      quantity,
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      shippingCost: 0,
      total: 0,
      allocations: [],
      isValid: false,
      invalidReason: error instanceof Error ? error.message : 'Allocation failed',
    };
  }

  // Calculate pricing
  const subtotal = calculateSubtotal(quantity);
  const discount = calculateDiscount(quantity);
  const discountAmount = calculateDiscountAmount(subtotal, discount);
  const orderAmount = subtotal - discountAmount;
  const shippingCost = calculateTotalShippingCost(allocations);
  const total = calculateTotal(subtotal, discountAmount, shippingCost);

  // Validate shipping cost
  const isValid = isShippingCostValid(shippingCost, orderAmount);
  const invalidReason = isValid
    ? undefined
    : `Shipping cost ($${shippingCost.toFixed(2)}) exceeds 15% of order amount ($${(orderAmount * 0.15).toFixed(2)})`;

  return {
    quantity,
    subtotal,
    discount,
    discountAmount,
    shippingCost,
    total,
    allocations,
    isValid,
    invalidReason,
  };
}

/**
 * Generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create and submit an order
 */
export async function createOrder(
  quantity: number,
  shippingAddress: Coordinates
): Promise<CreateOrderResult> {
  // First verify the order
  const calculation = await verifyOrder(quantity, shippingAddress);

  if (!calculation.isValid) {
    throw new AppError(400, calculation.invalidReason || 'Order validation failed');
  }

  // Create order in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await tx.order.create({
      data: {
        orderNumber,
        quantity: calculation.quantity,
        shippingLatitude: shippingAddress.latitude,
        shippingLongitude: shippingAddress.longitude,
        subtotal: calculation.subtotal,
        discount: calculation.discount,
        discountAmount: calculation.discountAmount,
        shippingCost: calculation.shippingCost,
        total: calculation.total,
        status: 'completed',
      },
    });

    // Create allocations and update warehouse stock
    for (const allocation of calculation.allocations) {
      await tx.orderAllocation.create({
        data: {
          orderId: order.id,
          warehouseId: allocation.warehouseId,
          quantity: allocation.quantity,
          shippingCost: allocation.shippingCost,
        },
      });

      // Update warehouse stock
      await updateWarehouseStock(allocation.warehouseId, allocation.quantity, tx);
    }

    logger.info(`Order created: ${orderNumber}`, {
      orderId: order.id,
      quantity,
      total: calculation.total,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      calculation,
    };
  });

  return result;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      allocations: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  return order;
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      allocations: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  return order;
}
