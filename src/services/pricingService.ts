import { config } from '../config/config';

/**
 * Calculate discount percentage based on quantity
 */
export function calculateDiscount(quantity: number): number {
  const discount = config.discounts.find((d) => quantity >= d.minQuantity);
  return discount ? discount.percentage : 0;
}

/**
 * Calculate subtotal before discount
 */
export function calculateSubtotal(quantity: number): number {
  return quantity * config.device.price;
}

/**
 * Calculate discount amount in dollars
 */
export function calculateDiscountAmount(subtotal: number, discountPercentage: number): number {
  return subtotal * discountPercentage;
}

/**
 * Calculate total after discount
 */
export function calculateTotal(
  subtotal: number,
  discountAmount: number,
  shippingCost: number
): number {
  return subtotal - discountAmount + shippingCost;
}

/**
 * Check if shipping cost exceeds maximum allowed percentage
 */
export function isShippingCostValid(shippingCost: number, orderAmount: number): boolean {
  const maxShippingCost = orderAmount * config.shipping.maxShippingPercentage;
  return shippingCost <= maxShippingCost;
}
