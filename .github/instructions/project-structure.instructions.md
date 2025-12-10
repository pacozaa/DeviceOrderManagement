---
applyTo: '**'
---

# Project Structure

This is an Order Management System built with Node.js, TypeScript, Express.js, and PostgreSQL with Prisma ORM.

## Directory Structure

```
ordermanagement/
├── .github/
│   └── instructions/          # AI coding guidelines
├── docs/                      # Documentation
│   ├── API.md
│   ├── staff-engineer-interview-challenge.md
│   ├── tech-stack.md
│   └── postman/              # Postman collections
├── infra/                    # Infrastructure as Code (Bicep)
├── logs/                     # Application logs
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/                      # Source code
│   ├── index.ts             # Application entry point
│   ├── __tests__/           # Test files
│   │   ├── api/
│   │   ├── services/
│   │   └── utils/
│   ├── config/              # Configuration files
│   │   ├── config.ts
│   │   ├── database.ts
│   │   └── swagger.config.ts
│   ├── controllers/         # Request handlers
│   │   ├── createOrderHandler.ts
│   │   ├── getOrderHandler.ts
│   │   ├── getWarehousesHandler.ts
│   │   ├── verifyOrderHandler.ts
│   │   └── index.ts
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/              # API routes
│   │   └── orderRoutes.ts
│   ├── services/            # Business logic layer
│   │   ├── allocation/      # Warehouse allocation logic
│   │   ├── order/           # Order management
│   │   ├── pricing/         # Pricing calculations
│   │   └── warehouse/       # Warehouse operations
│   ├── types/               # TypeScript types and schemas
│   │   ├── schemas.ts
│   │   ├── allocation/
│   │   ├── order/
│   │   └── warehouse/
│   └── utils/               # Utility functions
│       ├── geoUtils.ts
│       └── logger.ts
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Principles

### Modular Organization
- **One function per file**: Each file should export a single, focused function
- **Index files**: Use `index.ts` files to aggregate exports from a directory
- **Separation of concerns**: Clear separation between controllers, services, and data access

### Layer Responsibilities

1. **Controllers** (`src/controllers/`)
   - Handle HTTP requests and responses
   - Validate input using middleware
   - Delegate business logic to services
   - Return appropriate HTTP status codes

2. **Services** (`src/services/`)
   - Contain business logic
   - Are reusable and testable
   - Should not directly handle HTTP concerns
   - Organized by domain (order, warehouse, pricing, allocation)

3. **Types** (`src/types/`)
   - TypeScript interfaces and types
   - Zod schemas for validation
   - Grouped by domain

4. **Middleware** (`src/middleware/`)
   - Request validation
   - Error handling
   - Authentication/authorization (if applicable)

5. **Utils** (`src/utils/`)
   - Pure functions
   - Reusable utilities
   - No business logic

## Coding Guidelines

- Follow the modular structure: one function per file
- Use index.ts files to export related functions
- Place tests in `__tests__/` mirroring the source structure
- Use Zod schemas for input validation
- Use Prisma for database operations
- Log using Winston logger
- Write unit tests for services
- Write integration tests for API endpoints

## FAQ

### 1. Where should I add a new API endpoint?

1. Define the route in `src/routes/orderRoutes.ts`
2. Create a handler in `src/controllers/` (e.g., `newFeatureHandler.ts`)
3. Implement business logic in `src/services/` organized by domain
4. Add Zod validation schemas in `src/types/schemas.ts`
5. Write tests in `src/__tests__/api/`

### 2. How do I add a new service function?

1. Create a new file in the appropriate service directory (e.g., `src/services/order/myNewFunction.ts`)
2. Export the function as the default or named export
3. Add the export to the domain's `index.ts` file
4. Define types in the corresponding `src/types/` directory
5. Write unit tests in `src/__tests__/services/`

### 3. Where do database operations go?

- Use Prisma client for all database operations
- Database operations should be in service layer files
- Import the Prisma client from `src/config/database.ts`
- Never put Prisma queries directly in controllers

### 4. How should I structure types for a new feature?

1. Create a directory in `src/types/` for the domain (if it doesn't exist)
2. Create a `.types.ts` file for TypeScript interfaces
3. Add Zod schemas to `src/types/schemas.ts` or create domain-specific schema files
4. Export types through the domain's `index.ts`
5. Keep types close to where they're used

### 5. What's the testing strategy?

- **Unit tests**: Test individual service functions in isolation
- **Integration tests**: Test API endpoints end-to-end
- **Test location**: Mirror source structure in `__tests__/` directory
- **Test files**: Use `.test.ts` suffix
- **Run tests**: `npm test` or `npm run test:watch`
- **Coverage**: Aim for high coverage on business logic (services)