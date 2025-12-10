import { z } from 'zod';

// ============================================================================
// Request Schemas
// ============================================================================

/**
 * Schema for order creation/verification request body
 */
export const orderRequestSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().min(1, 'Quantity must be at least 1'),
    shippingAddress: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>['body'];

/**
 * Schema for order number parameter
 */
export const orderNumberParamSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(1, 'Order number is required'),
  }),
});

export type OrderNumberParam = z.infer<typeof orderNumberParamSchema>['params'];

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Schema for warehouse allocation in responses
 */
export const orderAllocationSchema = z.object({
  warehouseId: z.string(),
  warehouseName: z.string(),
  quantity: z.number().int().positive(),
  distance: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
});

export type OrderAllocationResponse = z.infer<typeof orderAllocationSchema>;

/**
 * Schema for order calculation (used in verify and create responses)
 */
export const orderCalculationSchema = z.object({
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
  discount: z.number().min(0).max(100),
  discountAmount: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  total: z.number().nonnegative(),
  allocations: z.array(orderAllocationSchema),
  isValid: z.boolean(),
  invalidReason: z.string().optional(),
});

export type OrderCalculationResponse = z.infer<typeof orderCalculationSchema>;

/**
 * Schema for create order response data
 */
export const createOrderDataSchema = z.object({
  orderId: z.string(),
  orderNumber: z.string(),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
  discount: z.number().min(0).max(100),
  discountAmount: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  total: z.number().nonnegative(),
  allocations: z.array(orderAllocationSchema),
});

export type CreateOrderDataResponse = z.infer<typeof createOrderDataSchema>;

/**
 * Schema for create order response
 */
export const createOrderResponseSchema = z.object({
  success: z.literal(true),
  data: createOrderDataSchema,
});

export type CreateOrderResponse = z.infer<typeof createOrderResponseSchema>;

/**
 * Schema for verify order response
 */
export const verifyOrderResponseSchema = z.object({
  success: z.literal(true),
  data: orderCalculationSchema,
});

export type VerifyOrderResponse = z.infer<typeof verifyOrderResponseSchema>;

/**
 * Schema for warehouse in responses
 */
export const warehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  stock: z.number().int().nonnegative(),
});

export type WarehouseResponse = z.infer<typeof warehouseSchema>;

/**
 * Schema for get warehouses response
 */
export const getWarehousesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(warehouseSchema),
});

export type GetWarehousesResponse = z.infer<typeof getWarehousesResponseSchema>;

/**
 * Schema for order allocation in get order response
 */
export const orderAllocationDetailSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().int().positive(),
  shippingCost: z.number().nonnegative(),
  warehouse: z.object({
    id: z.string(),
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export type OrderAllocationDetailResponse = z.infer<typeof orderAllocationDetailSchema>;

/**
 * Schema for order details in get order response
 */
export const orderDetailSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  quantity: z.number().int().positive(),
  shippingLatitude: z.number(),
  shippingLongitude: z.number(),
  subtotal: z.number().nonnegative(),
  discount: z.number().min(0).max(100),
  discountAmount: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  allocations: z.array(orderAllocationDetailSchema),
});

export type OrderDetailResponse = z.infer<typeof orderDetailSchema>;

/**
 * Schema for get order response
 */
export const getOrderResponseSchema = z.object({
  success: z.literal(true),
  data: orderDetailSchema,
});

export type GetOrderResponse = z.infer<typeof getOrderResponseSchema>;
