import { OrderAllocation } from '../allocation';

export interface OrderCalculation {
  quantity: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  allocations: OrderAllocation[];
  isValid: boolean;
  invalidReason?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  calculation: OrderCalculation;
}
