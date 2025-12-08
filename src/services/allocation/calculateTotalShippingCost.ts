import { OrderAllocation } from '../../types/allocation';

/**
 * Calculate total shipping cost from allocations
 */
export function calculateTotalShippingCost(allocations: OrderAllocation[]): number {
  return allocations.reduce((sum, allocation) => sum + allocation.shippingCost, 0);
}
