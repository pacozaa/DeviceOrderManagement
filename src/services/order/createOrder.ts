import { Coordinates } from '../../utils/geoUtils';
import { CreateOrderResult } from '../../types';
import { updateWarehouseStock, getWarehousesForAllocation } from '../warehouse';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';
import { calculateOptimalAllocation } from '../allocation';
import { calculatePricing, isShippingCostValid } from '../pricing';

function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}

export async function createOrder(
  quantity: number,
  shippingAddress: Coordinates
): Promise<CreateOrderResult> {
  // Create order in a transaction with row-level locking
  const result = await prisma.$transaction(async (tx) => {
    // Lock warehouses and read current stock (prevents race conditions)
    const warehouses = await getWarehousesForAllocation(tx);

    // Check sufficient stock
    const totalStock = warehouses.reduce((sum, w) => sum + w.stock, 0);
    if (totalStock < quantity) {
      throw new AppError(
        400,
        `Insufficient stock. Available: ${totalStock}, Requested: ${quantity}`
      );
    }

    // Calculate optimal allocation
    let allocations;
    try {
      allocations = calculateOptimalAllocation(warehouses, quantity, shippingAddress);
    } catch (error) {
      throw new AppError(400, error instanceof Error ? error.message : 'Allocation failed');
    }

    // Calculate pricing
    const { subtotal, discount, discountAmount, shippingCost, total } = calculatePricing(
      quantity,
      allocations
    );
    const orderAmount = subtotal - discountAmount;

    // Validate shipping cost
    if (!isShippingCostValid(shippingCost, orderAmount)) {
      throw new AppError(
        400,
        `Shipping cost ($${shippingCost.toFixed(2)}) exceeds 15% of order amount ($${(orderAmount * 0.15).toFixed(2)})`
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = await tx.order.create({
      data: {
        orderNumber,
        quantity,
        shippingLatitude: shippingAddress.latitude,
        shippingLongitude: shippingAddress.longitude,
        subtotal,
        discount,
        discountAmount,
        shippingCost,
        total,
        status: 'completed',
      },
    });

    // Create allocations and update warehouse stock
    for (const allocation of allocations) {
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
      total,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      calculation: {
        quantity,
        subtotal,
        discount,
        discountAmount,
        shippingCost,
        total,
        allocations,
        isValid: true,
      },
    };
  });

  return result;
}
