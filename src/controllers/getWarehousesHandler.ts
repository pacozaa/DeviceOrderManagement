import { Request, Response, NextFunction } from 'express';
import { getAllWarehouses } from '../services/warehouse';

/**
 * GET /api/orders/warehouses
 * Get all warehouses with current stock
 */
export const getWarehousesHandler = async (
  _: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouses = await getAllWarehouses();

    res.json({
      success: true,
      data: warehouses,
    });
  } catch (error) {
    next(error);
  }
};
