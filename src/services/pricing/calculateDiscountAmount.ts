/**
 * Calculate discount amount in dollars
 */
export function calculateDiscountAmount(subtotal: number, discountPercentage: number): number {
  return subtotal * discountPercentage;
}
