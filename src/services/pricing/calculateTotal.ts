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
