import prisma from '../../config/database';
import { Warehouse } from '../../types';

export async function getAllWarehouses(): Promise<Warehouse[]> {
  return await prisma.warehouse.findMany();
}
