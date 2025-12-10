import { Coordinates } from '../../utils/geoUtils';
import { OrderCalculation } from '../../types';
import { getAllWarehouses, hasSufficientStock } from '../warehouse';
import { calculateOptimalAllocation } from '../allocation';
import { calculatePricing, isShippingCostValid } from '../pricing';

/**
 * Verify an order without submitting it
 */
export async function verifyOrder(
  quantity: number,
  shippingAddress: Coordinates
): Promise<OrderCalculation> {
  // Get all warehouses
  const warehouses = await getAllWarehouses();

  // Check sufficient stock
  const hasStock = await hasSufficientStock(quantity, warehouses);
  if (!hasStock) {
    return {
      quantity,
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      shippingCost: 0,
      total: 0,
      allocations: [],
      isValid: false,
      invalidReason: 'Insufficient stock available',
    };
  }

  // Calculate optimal allocation
  let allocations;
  try {
    allocations = calculateOptimalAllocation(warehouses, quantity, shippingAddress);
  } catch (error) {
    return {
      quantity,
      subtotal: 0,
      discount: 0,
      discountAmount: 0,
      shippingCost: 0,
      total: 0,
      allocations: [],
      isValid: false,
      invalidReason: error instanceof Error ? error.message : 'Allocation failed',
    };
  }

  // Calculate pricing
  const { subtotal, discount, discountAmount, shippingCost, total } = calculatePricing(
    quantity,
    allocations
  );
  const orderAmount = subtotal - discountAmount;

  // Validate shipping cost
  const isValid = isShippingCostValid(shippingCost, orderAmount);
  const invalidReason = isValid
    ? undefined
    : `Shipping cost ($${shippingCost.toFixed(2)}) exceeds 15% of order amount ($${(orderAmount * 0.15).toFixed(2)})`;

  return {
    quantity,
    subtotal,
    discount,
    discountAmount,
    shippingCost,
    total,
    allocations,
    isValid,
    invalidReason,
  };
}
