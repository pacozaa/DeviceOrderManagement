export interface Warehouse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stock: number;
}

export interface OrderAllocation {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  distance: number;
  shippingCost: number;
}

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
