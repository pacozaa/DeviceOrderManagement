import { Coordinates } from '../../utils/geoUtils';
import { CreateOrderResult } from '../../types';
import { updateWarehouseStock } from '../warehouse';
import { verifyOrder } from './verifyOrder';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

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
