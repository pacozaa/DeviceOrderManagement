import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      allocations: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  return order;
}
