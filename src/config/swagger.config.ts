import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ScreenCloud Order Management API',
      version: '1.0.0',
      description:
        'API for managing SCOS device orders with intelligent warehouse allocation and pricing',
      contact: {
        name: 'API Support',
        email: 'support@screencloud.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.screencloud.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        ShippingAddress: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: {
              type: 'number',
              format: 'double',
              minimum: -90,
              maximum: 90,
              description: 'Latitude coordinate of the shipping address',
              example: 51.5074,
            },
            longitude: {
              type: 'number',
              format: 'double',
              minimum: -180,
              maximum: 180,
              description: 'Longitude coordinate of the shipping address',
              example: -0.1278,
            },
          },
        },
        OrderRequest: {
          type: 'object',
          required: ['quantity', 'shippingAddress'],
          properties: {
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Number of SCOS devices to order',
              example: 100,
            },
            shippingAddress: {
              $ref: '#/components/schemas/ShippingAddress',
            },
          },
        },
        Allocation: {
          type: 'object',
          properties: {
            warehouseId: {
              type: 'string',
              description: 'Unique identifier for the warehouse',
              example: 'wh-us-east-001',
            },
            warehouseName: {
              type: 'string',
              description: 'Name of the warehouse',
              example: 'US East Coast',
            },
            quantity: {
              type: 'integer',
              description: 'Number of devices allocated from this warehouse',
              example: 60,
            },
            distance: {
              type: 'number',
              format: 'double',
              description: 'Distance from warehouse to shipping address in kilometers',
              example: 250.5,
            },
            shippingCost: {
              type: 'number',
              format: 'double',
              description: 'Shipping cost for this allocation in USD',
              example: 125.25,
            },
          },
        },
        OrderCalculation: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              description: 'Total quantity ordered',
              example: 100,
            },
            subtotal: {
              type: 'number',
              format: 'double',
              description: 'Subtotal before discount in USD',
              example: 30000.0,
            },
            discount: {
              type: 'number',
              format: 'double',
              description: 'Discount percentage applied',
              example: 0.15,
            },
            discountAmount: {
              type: 'number',
              format: 'double',
              description: 'Total discount amount in USD',
              example: 4500.0,
            },
            shippingCost: {
              type: 'number',
              format: 'double',
              description: 'Total shipping cost in USD',
              example: 350.75,
            },
            total: {
              type: 'number',
              format: 'double',
              description: 'Final total amount in USD',
              example: 25850.75,
            },
            allocations: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Allocation',
              },
              description: 'List of warehouse allocations',
            },
          },
        },
        OrderVerifyResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/OrderCalculation',
            },
          },
        },
        OrderCreateResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                orderId: {
                  type: 'string',
                  description: 'Unique order identifier',
                  example: 'ord_abc123xyz',
                },
                orderNumber: {
                  type: 'string',
                  description: 'Human-readable order number',
                  example: 'ORD-20231208-001',
                },
                quantity: {
                  type: 'integer',
                  example: 100,
                },
                subtotal: {
                  type: 'number',
                  format: 'double',
                  example: 30000.0,
                },
                discount: {
                  type: 'number',
                  format: 'double',
                  example: 0.15,
                },
                discountAmount: {
                  type: 'number',
                  format: 'double',
                  example: 4500.0,
                },
                shippingCost: {
                  type: 'number',
                  format: 'double',
                  example: 350.75,
                },
                total: {
                  type: 'number',
                  format: 'double',
                  example: 25850.75,
                },
                allocations: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Allocation',
                  },
                },
              },
            },
          },
        },
        OrderDetails: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Order ID',
            },
            orderNumber: {
              type: 'string',
              description: 'Order number',
            },
            quantity: {
              type: 'integer',
              description: 'Total quantity',
            },
            subtotal: {
              type: 'number',
              format: 'double',
            },
            discount: {
              type: 'number',
              format: 'double',
            },
            discountAmount: {
              type: 'number',
              format: 'double',
            },
            shippingCost: {
              type: 'number',
              format: 'double',
            },
            total: {
              type: 'number',
              format: 'double',
            },
            shippingLatitude: {
              type: 'number',
              format: 'double',
            },
            shippingLongitude: {
              type: 'number',
              format: 'double',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        OrderDetailsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/OrderDetails',
            },
          },
        },
        Warehouse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Warehouse ID',
            },
            name: {
              type: 'string',
              description: 'Warehouse name',
            },
            latitude: {
              type: 'number',
              format: 'double',
            },
            longitude: {
              type: 'number',
              format: 'double',
            },
            currentStock: {
              type: 'integer',
              description: 'Current stock level',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        WarehousesResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Warehouse',
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid request parameters',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid input parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        NotFound: {
          description: 'Not Found - Resource does not exist',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
      {
        name: 'Warehouses',
        description: 'Warehouse information endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
