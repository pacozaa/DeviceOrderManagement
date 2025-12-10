import { config } from '../../config/config';

export function isShippingCostValid(shippingCost: number, orderAmount: number): boolean {
  const maxShippingCost = orderAmount * config.shipping.maxShippingPercentage;
  return shippingCost <= maxShippingCost;
}
