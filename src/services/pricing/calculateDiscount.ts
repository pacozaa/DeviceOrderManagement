import { config } from '../../config/config';

/**
 * Calculate discount percentage based on quantity
 */
export function calculateDiscount(quantity: number): number {
  const discount = config.discounts.find((d) => quantity >= d.minQuantity);
  return discount ? discount.percentage : 0;
}
