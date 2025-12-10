import { Request, Response, NextFunction } from 'express';
import { verifyOrder } from '../services/order';
import { orderRequestSchema, verifyOrderResponseSchema, VerifyOrderResponse } from '../types';

/**
 * POST /api/orders/verify
 * Verify an order without submitting it
 */
export const verifyOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body with Zod
    const { body } = orderRequestSchema.parse({ body: req.body });
    const { quantity, shippingAddress } = body;

    const result = await verifyOrder(quantity, shippingAddress);

    // Build response with explicit typing
    const response: VerifyOrderResponse = {
      success: true,
      data: result,
    };

    // Validate response with Zod before sending
    const validatedResponse = verifyOrderResponseSchema.parse(response);

    res.json(validatedResponse);
  } catch (error) {
    next(error);
  }
};
