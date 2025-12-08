import prisma from '../config/database';
import { Warehouse } from '../types/order.types';

/**
 * Get all warehouses
 */
export async function getAllWarehouses(): Promise<Warehouse[]> {
  return await prisma.warehouse.findMany();
}

/**
 * Get warehouse by ID
 */
export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  return await prisma.warehouse.findUnique({
    where: { id },
  });
}

/**
 * Update warehouse stock (within a transaction)
 */
export async function updateWarehouseStock(
  warehouseId: string,
  quantity: number,
  tx?: any
): Promise<void> {
  const client = tx || prisma;
  await client.warehouse.update({
    where: { id: warehouseId },
    data: {
      stock: {
        decrement: quantity,
      },
    },
  });
}

/**
 * Check if warehouses have sufficient total stock
 */
export async function hasSufficientStock(quantity: number): Promise<boolean> {
  const warehouses = await getAllWarehouses();
  const totalStock = warehouses.reduce((sum, w) => sum + w.stock, 0);
  return totalStock >= quantity;
}
