import { getAllWarehouses } from './getAllWarehouses';
import { Warehouse } from '../../types';

export async function hasSufficientStock(
  quantity: number,
  warehouses?: Warehouse[]
): Promise<boolean> {
  const warehouseList = warehouses || (await getAllWarehouses());
  const totalStock = warehouseList.reduce((sum, w) => sum + w.stock, 0);
  return totalStock >= quantity;
}
