import { Request, Response, NextFunction } from 'express';
import { createOrder } from '../services/order';
import { orderRequestSchema, createOrderResponseSchema, CreateOrderResponse } from '../types';

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
    // Validate request body with Zod
    const { body } = orderRequestSchema.parse({ body: req.body });
    const { quantity, shippingAddress } = body;

    const result = await createOrder(quantity, shippingAddress);

    // Build response with explicit typing
    const response: CreateOrderResponse = {
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
    };

    // Validate response with Zod before sending
    const validatedResponse = createOrderResponseSchema.parse(response);

    res.status(201).json(validatedResponse);
  } catch (error) {
    next(error);
  }
};
