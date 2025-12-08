import { Router } from 'express';
import {
  verifyOrderHandler,
  createOrderHandler,
  getOrderHandler,
  getWarehousesHandler,
} from '../controllers';
import { validate } from '../middleware/validation';
import { orderRequestSchema } from '../types/schemas';

const router = Router();

/**
 * @swagger
 * /api/orders/verify:
 *   post:
 *     summary: Verify an order without submitting
 *     description: Calculate pricing, allocations, and shipping costs for an order without creating it in the system. Useful for providing quotes to customers.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *           examples:
 *             smallOrder:
 *               summary: Small order example
 *               value:
 *                 quantity: 50
 *                 shippingAddress:
 *                   latitude: 51.5074
 *                   longitude: -0.1278
 *             largeOrder:
 *               summary: Large order example (with discount)
 *               value:
 *                 quantity: 250
 *                 shippingAddress:
 *                   latitude: 40.7128
 *                   longitude: -74.0060
 *     responses:
 *       200:
 *         description: Order verification successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderVerifyResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/verify', validate(orderRequestSchema), verifyOrderHandler);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create and submit an order
 *     description: Create a new order with automatic warehouse allocation based on proximity and stock availability. The order will be persisted in the database.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderRequest'
 *           examples:
 *             standardOrder:
 *               summary: Standard order
 *               value:
 *                 quantity: 100
 *                 shippingAddress:
 *                   latitude: 34.0522
 *                   longitude: -118.2437
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderCreateResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', validate(orderRequestSchema), createOrderHandler);

/**
 * @swagger
 * /api/orders/{orderNumber}:
 *   get:
 *     summary: Get order details by order number
 *     description: Retrieve complete details of an existing order using its order number
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The order number (e.g., ORD-20231208-001)
 *         example: ORD-20231208-001
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetailsResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:orderNumber', getOrderHandler);

/**
 * @swagger
 * /api/orders/warehouses/list:
 *   get:
 *     summary: Get all warehouses
 *     description: Retrieve a list of all warehouses with their current stock levels and locations
 *     tags: [Warehouses]
 *     responses:
 *       200:
 *         description: List of warehouses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarehousesResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/warehouses/list', getWarehousesHandler);

export default router;
