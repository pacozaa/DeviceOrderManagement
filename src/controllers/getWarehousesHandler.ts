import { Request, Response, NextFunction } from 'express';
import { getAllWarehouses } from '../services/warehouse';
import { getWarehousesResponseSchema, GetWarehousesResponse } from '../types';

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

    // Build response with explicit typing
    const response: GetWarehousesResponse = {
      success: true,
      data: warehouses,
    };

    // Validate response with Zod before sending
    const validatedResponse = getWarehousesResponseSchema.parse(response);

    res.json(validatedResponse);
  } catch (error) {
    next(error);
  }
};
