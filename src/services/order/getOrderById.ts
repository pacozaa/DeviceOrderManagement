import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
