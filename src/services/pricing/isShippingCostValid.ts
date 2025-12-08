import { config } from '../../config/config';

/**
 * Check if shipping cost exceeds maximum allowed percentage
 */
export function isShippingCostValid(shippingCost: number, orderAmount: number): boolean {
  const maxShippingCost = orderAmount * config.shipping.maxShippingPercentage;
  return shippingCost <= maxShippingCost;
}
