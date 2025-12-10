import { Prisma } from '@prisma/client';
import { Warehouse } from '../../types';

/**
 * Get all warehouses with row-level locking (FOR UPDATE)
 * This ensures stock consistency during concurrent order processing
 * Must be called within a transaction
 */
export async function getWarehousesForAllocation(
  tx: Omit<
    Prisma.TransactionClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >
): Promise<Warehouse[]> {
  // Use FOR UPDATE to lock rows until transaction commits
  return await tx.$queryRaw<Warehouse[]>`
    SELECT * FROM warehouses
    ORDER BY name
    FOR UPDATE
  `;
}
