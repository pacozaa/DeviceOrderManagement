import { getAllWarehouses } from './getAllWarehouses';

/**
 * Check if warehouses have sufficient total stock
 */
export async function hasSufficientStock(quantity: number): Promise<boolean> {
  const warehouses = await getAllWarehouses();
  const totalStock = warehouses.reduce((sum, w) => sum + w.stock, 0);
  return totalStock >= quantity;
}
