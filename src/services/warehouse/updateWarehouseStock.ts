import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

/**
 * Update warehouse stock (within a transaction)
 */
export async function updateWarehouseStock(
  warehouseId: string,
  quantity: number,
  tx?: Omit<
    Prisma.TransactionClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >
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
