# Zod Validation Best Practices

This document outlines the best practices implemented for Zod validation in the Order Management System controllers.

## Overview

All controllers have been updated to use Zod for both **request validation** and **response typing**, ensuring type safety throughout the request-response cycle.

## Key Best Practices

### 1. **Request Validation**
- Use Zod schemas to validate incoming request data (body, params, query)
- Parse requests at the controller level before passing to services
- Handle validation errors automatically through the error middleware

```typescript
// Validate request body
const { body } = orderRequestSchema.parse({ body: req.body });

// Validate request params
const { params } = orderNumberParamSchema.parse({ params: req.params });
```

### 2. **Response Typing**
- Define explicit Zod schemas for all response structures
- Build responses with TypeScript types inferred from Zod schemas
- Validate responses before sending to ensure consistency

```typescript
// Build response with explicit typing
const response: CreateOrderResponse = {
  success: true,
  data: { /* ... */ },
};

// Validate response before sending
const validatedResponse = createOrderResponseSchema.parse(response);
res.status(201).json(validatedResponse);
```

### 3. **Schema Organization**
Schemas are organized in `/src/types/schemas.ts` with clear sections:

- **Request Schemas**: For validating incoming data
- **Response Schemas**: For typing and validating outgoing data

### 4. **Type Safety**
- Import both the schema and its inferred type
- Use TypeScript types for variable declarations
- Use Zod schemas for runtime validation

```typescript
import { 
  orderRequestSchema,           // Schema for validation
  createOrderResponseSchema,    // Schema for validation
  CreateOrderResponse          // Type for TypeScript
} from '../types';
```

### 5. **Error Handling**
- Zod validation errors are automatically caught by the error middleware
- Errors include detailed information about validation failures
- No need for manual try-catch around schema parsing (outer try-catch handles it)

## Schema Patterns

### Request Schemas
```typescript
export const orderRequestSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive().min(1),
    shippingAddress: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
  }),
});
```

### Response Schemas
```typescript
export const createOrderResponseSchema = z.object({
  success: z.literal(true),
  data: createOrderDataSchema,
});
```

## Benefits

1. **Runtime Type Safety**: Catch type mismatches at runtime
2. **Auto-documentation**: Schemas serve as documentation
3. **Validation Messages**: Clear error messages for invalid data
4. **Type Inference**: TypeScript types derived from schemas
5. **Consistency**: Same validation logic across all endpoints
6. **Testability**: Easy to test with known schemas

## Controller Examples

### POST Endpoint (with body validation)
```typescript
export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const { body } = orderRequestSchema.parse({ body: req.body });
    
    // Business logic
    const result = await createOrder(body.quantity, body.shippingAddress);
    
    // Build and validate response
    const response: CreateOrderResponse = {
      success: true,
      data: result,
    };
    const validatedResponse = createOrderResponseSchema.parse(response);
    
    res.status(201).json(validatedResponse);
  } catch (error) {
    next(error);
  }
};
```

### GET Endpoint (with params validation)
```typescript
export const getOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate params
    const { params } = orderNumberParamSchema.parse({ params: req.params });
    
    // Business logic
    const order = await getOrderByNumber(params.orderNumber);
    
    // Build and validate response
    const response: GetOrderResponse = {
      success: true,
      data: order,
    };
    const validatedResponse = getOrderResponseSchema.parse(response);
    
    res.json(validatedResponse);
  } catch (error) {
    next(error);
  }
};
```

## Migration Checklist

When adding new endpoints or updating existing ones:

- [ ] Define request schema in `schemas.ts`
- [ ] Define response schema in `schemas.ts`
- [ ] Import both schema and inferred type in controller
- [ ] Parse request with Zod at start of handler
- [ ] Build response with explicit TypeScript type
- [ ] Validate response before sending
- [ ] Export types from `src/types/index.ts`
- [ ] Update API documentation
- [ ] Add tests for validation edge cases

## Common Patterns

### Optional Fields
```typescript
z.object({
  field: z.string().optional(),
  nullableField: z.string().nullable(),
})
```

### Arrays
```typescript
z.array(itemSchema)
```

### Unions
```typescript
z.union([schemaA, schemaB])
// or
z.enum(['value1', 'value2'])
```

### Nested Objects
```typescript
z.object({
  nested: z.object({
    field: z.string(),
  }),
})
```

### Custom Validation
```typescript
z.string().refine((val) => val.length > 5, {
  message: "String must be longer than 5 characters",
})
```

## Related Files

- `/src/types/schemas.ts` - All Zod schemas
- `/src/controllers/*.ts` - Controller implementations
- `/src/middleware/errorHandler.ts` - Error handling middleware
- `/src/middleware/validation.ts` - Validation middleware (if applicable)
