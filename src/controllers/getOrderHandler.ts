import { Request, Response, NextFunction } from 'express';
import { getOrderByNumber } from '../services/order';
import { orderNumberParamSchema, getOrderResponseSchema, GetOrderResponse } from '../types';

/**
 * GET /api/orders/:orderNumber
 * Get order details by order number
 */
export const getOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request params with Zod
    const { params } = orderNumberParamSchema.parse({ params: req.params });
    const { orderNumber } = params;

    const order = await getOrderByNumber(orderNumber);

    // Build response with explicit typing
    const response: GetOrderResponse = {
      success: true,
      data: order,
    };

    // Validate response with Zod before sending
    const validatedResponse = getOrderResponseSchema.parse(response);

    res.json(validatedResponse);
  } catch (error) {
    next(error);
  }
};
