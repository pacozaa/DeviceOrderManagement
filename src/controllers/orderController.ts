import { Request, Response, NextFunction } from 'express';
import { verifyOrder, createOrder, getOrderByNumber } from '../services/orderService';
import { getAllWarehouses } from '../services/warehouseService';
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

/**
 * GET /api/orders/warehouses
 * Get all warehouses with current stock
 */
export const getWarehousesHandler = async (
  req: Request,
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
