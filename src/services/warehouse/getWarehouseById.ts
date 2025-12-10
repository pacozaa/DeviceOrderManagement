import prisma from '../../config/database';
import { Warehouse } from '../../types';

export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  return await prisma.warehouse.findUnique({
    where: { id },
  });
}
