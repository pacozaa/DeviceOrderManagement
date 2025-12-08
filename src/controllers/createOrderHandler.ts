import { Request, Response, NextFunction } from 'express';
import { createOrder } from '../services/order';
import { OrderRequest } from '../types/schemas';

/**
 * POST /api/orders
 * Create and submit an order
 */
export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quantity, shippingAddress } = req.body as OrderRequest;

    const result = await createOrder(quantity, shippingAddress);

    res.status(201).json({
      success: true,
      data: {
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        quantity: result.calculation.quantity,
        subtotal: result.calculation.subtotal,
        discount: result.calculation.discount,
        discountAmount: result.calculation.discountAmount,
        shippingCost: result.calculation.shippingCost,
        total: result.calculation.total,
        allocations: result.calculation.allocations,
      },
    });
  } catch (error) {
    next(error);
  }
};
