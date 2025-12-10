import { OrderAllocation } from '../../types';

export function calculateTotalShippingCost(allocations: OrderAllocation[]): number {
  return allocations.reduce((sum, allocation) => sum + allocation.shippingCost, 0);
}
