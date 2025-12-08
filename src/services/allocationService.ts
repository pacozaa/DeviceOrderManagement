import { Warehouse, OrderAllocation } from '../types/order.types';
import { Coordinates, calculateDistance, calculateShippingCost } from '../utils/geoUtils';
import { config } from '../config/config';

interface WarehouseWithDistance extends Warehouse {
  distance: number;
  shippingCostPerUnit: number;
}

/**
 * Calculate optimal warehouse allocation for an order
 * Uses a greedy algorithm to minimize shipping costs
 */
export function calculateOptimalAllocation(
  warehouses: Warehouse[],
  quantity: number,
  shippingAddress: Coordinates
): OrderAllocation[] {
  // Calculate distance and shipping cost for each warehouse
  const warehousesWithDistance: WarehouseWithDistance[] = warehouses
    .map((warehouse) => {
      const distance = calculateDistance(
        { latitude: warehouse.latitude, longitude: warehouse.longitude },
        shippingAddress
      );
      const shippingCostPerUnit = calculateShippingCost(
        distance,
        config.device.weightKg,
        config.shipping.ratePerKgPerKm
      );
      return {
        ...warehouse,
        distance,
        shippingCostPerUnit,
      };
    })
    .filter((w) => w.stock > 0) // Only consider warehouses with stock
    .sort((a, b) => a.shippingCostPerUnit - b.shippingCostPerUnit); // Sort by cheapest shipping

  const allocations: OrderAllocation[] = [];
  let remainingQuantity = quantity;

  // Allocate from cheapest warehouses first
  for (const warehouse of warehousesWithDistance) {
    if (remainingQuantity === 0) break;

    const allocatedQuantity = Math.min(warehouse.stock, remainingQuantity);
    const totalWeight = allocatedQuantity * config.device.weightKg;
    const shippingCost = calculateShippingCost(
      warehouse.distance,
      totalWeight,
      config.shipping.ratePerKgPerKm
    );

    allocations.push({
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      quantity: allocatedQuantity,
      distance: warehouse.distance,
      shippingCost,
    });

    remainingQuantity -= allocatedQuantity;
  }

  if (remainingQuantity > 0) {
    throw new Error(`Insufficient stock. Need ${remainingQuantity} more units.`);
  }

  return allocations;
}

/**
 * Calculate total shipping cost from allocations
 */
export function calculateTotalShippingCost(allocations: OrderAllocation[]): number {
  return allocations.reduce((sum, allocation) => sum + allocation.shippingCost, 0);
}
