import { Request, Response, NextFunction } from 'express';
import { getOrderByNumber } from '../services/order';

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
    const { orderNumber } = req.params;

    const order = await getOrderByNumber(orderNumber);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
