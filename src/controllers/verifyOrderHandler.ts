import { Request, Response, NextFunction } from 'express';
import { verifyOrder } from '../services/order';
import { OrderRequest } from '../types/schemas';

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
    const { quantity, shippingAddress } = req.body as OrderRequest;

    const result = await verifyOrder(quantity, shippingAddress);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
