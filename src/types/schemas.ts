import { z } from 'zod';

export const orderRequestSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().min(1, 'Quantity must be at least 1'),
    shippingAddress: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>['body'];
