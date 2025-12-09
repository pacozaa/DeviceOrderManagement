import prisma from '../../config/database';
import { Warehouse } from '../../types/warehouse';

/**
 * Get all warehouses
 */
export async function getAllWarehouses(): Promise<Warehouse[]> {
  return await prisma.warehouse.findMany();
}
