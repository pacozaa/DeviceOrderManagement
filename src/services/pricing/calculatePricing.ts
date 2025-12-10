import { OrderAllocation } from '../../types';
import { calculateDiscount } from './calculateDiscount';
import { calculateSubtotal } from './calculateSubtotal';
import { calculateDiscountAmount } from './calculateDiscountAmount';
import { calculateTotal } from './calculateTotal';
import { calculateTotalShippingCost } from '../allocation';

export interface PricingResult {
  subtotal: number;
  discount: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
}

export function calculatePricing(quantity: number, allocations: OrderAllocation[]): PricingResult {
  const subtotal = calculateSubtotal(quantity);
  const discount = calculateDiscount(quantity);
  const discountAmount = calculateDiscountAmount(subtotal, discount);
  const shippingCost = calculateTotalShippingCost(allocations);
  const total = calculateTotal(subtotal, discountAmount, shippingCost);

  return {
    subtotal,
    discount,
    discountAmount,
    shippingCost,
    total,
  };
}
