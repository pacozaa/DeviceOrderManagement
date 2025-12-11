# Order Management System

## Description
A production-ready backend system for managing SCOS device orders with intelligent warehouse allocation and shipping cost optimization. The implementation is rather simple and straightforward to meet the core requirements without over-engineering. Monolithic architecture is used for simplicity and ease of understanding. The codebase split into modules (controllers, services, routes, utils) to maintain separation of concerns. And inside each module, the code is organized by feature (orders, warehouses, pricing, allocation) to keep related logic together.
- The order is using transaction to ensure inventory updates are atomic. Specifically also use row locking to prevent race conditions during warehouse allocation.
- Input validation is implemented using Zod to ensure data integrity.

## Improvement
- Improve [api](src/__tests__/api) testing to use less mocking and more real database interactions.
- Improve test coverage especially order services and allocation logic.
- Improve load testing to simulate high concurrency order submissions to verify locking and transaction safety using K6.
- Improve logging to include more context information (e.g., request IDs, user IDs) for better traceability.
- Refactor the functions to consistently use try catch for error handling. Also improve test to cover error scenarios.
- Target improvement architecture diagram is show [here](Order.png) 
   - The architecture diagram shows that if warehouses and products are scaling up(e.g., hundreds of warehouses, thousands of products), we can introduce caching layer (e.g., Redis). 
   - To speed things up further if numbers of warehouses are scaling up significantly, we can introduce calculation table to precompute distances between warehouses and popular shipping zones. Because distances between two coordinates are static, we can precompute and store them in a fast lookup table(e.g., Redis) to avoid recalculating them on every order request. This will significantly reduce computation time during warehouse allocation.
   - We can also introduce message queue (e.g., Azure Service Bus) to handle high volume order processing asynchronously(not include in the diagram). and Read replica database to offload read traffic from primary database especially for verifying service.
- The current deployment uses Azure Container Instances for simplicity. For more robust production deployment, we can consider using Azure Container Apps for better scalability, load balancing, and management features.

## Features

- **Order Verification**: Validate orders without submission to check pricing, discounts, and shipping costs
- **Order Processing**: Submit orders with automatic warehouse allocation and inventory management
- **Smart Allocation**: Optimizes warehouse selection to minimize shipping costs
- **Volume Discounts**: Automatic discount application based on order quantity
- **Transaction Safety**: ACID-compliant database operations with Prisma
- **Comprehensive Testing**: Unit tests, integration tests, and API tests
- **Docker Support**: Easy local development and deployment with Docker Compose
- **CI/CD Ready**: GitHub Actions workflow included

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Containerization**: Docker

## Prerequisites

- Node.js 20+ or Docker
- PostgreSQL 15+ (if running without Docker)
- npm or yarn

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screncloud
   ```

2. **Start the application**
   ```bash
   docker compose up --build -d
   ```

3. **Seed the database**
   ```bash
   docker compose exec app npm run db:seed
   ```

4. **Access the API**
   - API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start PostgreSQL using Docker Compose**
   ```bash
   docker compose up -d postgres
   ```

4. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Seed the database**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## API Documentation

### Interactive Documentation (Swagger UI)

The API comes with interactive OpenAPI (Swagger) documentation where you can explore all endpoints, view request/response schemas, and even test API calls directly from your browser.

**Access the documentation:**
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI JSON spec: http://localhost:3000/api-docs.json

The interactive documentation provides:
- Complete endpoint descriptions with examples
- Request/response schema definitions
- Ability to try out endpoints directly
- Authentication flows (when applicable)
- Error response examples

### Quick Start with API Documentation

1. Start the server (see [Quick Start](#quick-start))
2. Open http://localhost:3000/api-docs in your browser
3. Browse available endpoints organized by tags (Orders, Warehouses)
4. Click "Try it out" on any endpoint to test it
5. View response schemas and examples

## API Endpoints

### Health Check
```
GET /health
```

### Verify Order (without submission)
```
POST /api/orders/verify
Content-Type: application/json

{
  "quantity": 50,
  "shippingAddress": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quantity": 50,
    "subtotal": 7500,
    "discount": 0.1,
    "discountAmount": 750,
    "shippingCost": 234.56,
    "total": 6984.56,
    "allocations": [
      {
        "warehouseId": "...",
        "warehouseName": "New York",
        "quantity": 50,
        "distance": 643.2,
        "shippingCost": 234.56
      }
    ],
    "isValid": true
  }
}
```

### Submit Order
```
POST /api/orders
Content-Type: application/json

{
  "quantity": 50,
  "shippingAddress": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "...",
    "orderNumber": "ORD-1234567890-123",
    "quantity": 50,
    "subtotal": 7500,
    "discount": 0.1,
    "discountAmount": 750,
    "shippingCost": 234.56,
    "total": 6984.56,
    "allocations": [...]
  }
}
```

### Get Order Details
```
GET /api/orders/:orderNumber
```

### Get All Warehouses
```
GET /api/orders/warehouses/list
```

## Business Rules

### SCOS Device
- **Name**: SCOS Station P1 Pro
- **Price**: $150
- **Weight**: 365g (0.365 kg)

### Volume Discounts
- 25+ units: 5% discount
- 50+ units: 10% discount
- 100+ units: 15% discount
- 250+ units: 20% discount

### Shipping Calculation
- Rate: $0.01 per kilogram per kilometer
- Multi-warehouse allocation for optimal cost
- Maximum shipping cost: 15% of order amount (after discount)
- Orders exceeding this threshold are considered invalid

### Warehouses
| Name | Location | Initial Stock |
|------|----------|---------------|
| Los Angeles | 33.9425, -118.408056 | 355 |
| New York | 40.639722, -73.778889 | 578 |
| São Paulo | -23.435556, -46.473056 | 265 |
| Paris | 49.009722, 2.547778 | 694 |
| Warsaw | 52.165833, 20.967222 | 245 |
| Hong Kong | 22.308889, 113.914444 | 419 |

## Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Testing Strategy

The project demonstrates a comprehensive testing approach:

1. **Unit Tests**: Test individual functions and services
   - `geoUtils.test.ts`: Distance and shipping cost calculations
   - `pricingService.test.ts`: Discount and pricing logic
   - `allocationService.test.ts`: Warehouse allocation algorithm

2. **Integration Tests**: Test API endpoints
   - `orders.test.ts`: Full request/response cycle

3. **Database Tests**: Tests use transaction rollbacks to maintain isolation

## Database Management

### Run migrations
```bash
npm run prisma:migrate
```

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Seed database with initial data
```bash
npm run db:seed
```

## Development

### Run development server with hot reload
```bash
npm run dev
```

### Lint code
```bash
npm run lint
```

### Format code
```bash
npm run format
```

### Build for production
```bash
npm run build
```

### Run production build
```bash
npm start
```

## Architecture

### Project Structure
```
screncloud/
├── src/
│   ├── config/           # Configuration and database setup
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types and schemas
│   ├── utils/            # Utility functions
│   └── index.ts          # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── docs/                 # Documentation
├── __tests__/            # Test files
└── docker compose.yml    # Docker orchestration
```

### Key Design Decisions

1. **Warehouse Allocation Algorithm**: Greedy algorithm that prioritizes warehouses with lowest shipping cost
2. **Transaction Management**: Uses Prisma transactions to ensure inventory updates are atomic
3. **Validation**: Zod schemas for type-safe request validation
4. **Error Handling**: Centralized error handler with custom AppError class
5. **Logging**: Structured logging with Winston
6. **Database**: PostgreSQL for ACID compliance and data integrity

## Production Considerations

### Implemented
- ✅ Input validation
- ✅ Error handling
- ✅ Transaction safety
- ✅ Structured logging
- ✅ Docker containerization
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Environment configuration
- ✅ Health check endpoint
- ✅ Deployed to Azure Container Instances
- ✅ Infrastructure as Code (Azure Bicep)
- ✅ Container Registry for image management
- ✅ Automated database migrations
- ✅ Managed PostgreSQL database

## CI/CD

The project includes GitHub Actions workflows:

### CI Pipeline (`ci.yml`)
- Runs tests on every push and pull request to main/develop
- Performs linting and type checking
- Builds the Docker image
- Runs database migrations for testing

### Deployment Pipeline (`deploy.yml`)
- Builds the application and creates deployment package
- Deploys infrastructure using Azure Bicep (IaC)
- Pushes Docker image to Azure Container Registry (ACR)
- Deploys to Azure Container Instances (ACI)
- Runs database migrations automatically on container start
- Performs health checks to verify deployment

### Azure Infrastructure
- **Resource Group**: `rg-device-order-mgmt`
- **Container Registry**: Stores Docker images
- **Container Instances**: Runs the application container
- **External PostgreSQL**: Managed database (configured via secrets)
- **Region**: Southeast Asia

### Deployment
The application is deployed to Azure Container Instances with:
- Automatic container restarts on failure
- Public IP with DNS name
- Environment variables for configuration
- Database migrations run on container startup via `startup.sh`

To deploy:
1. Configure GitHub secrets (AZURE_CREDENTIALS, DATABASE_URL, etc.)
2. Push to main branch or trigger manual deployment
3. Choose environment (dev/staging/prod)