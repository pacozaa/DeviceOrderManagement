# Tech Stack

## Core Requirements
- **Language**: TypeScript
- **Database**: PostgreSQL
- **API**: REST

## Recommended Stack

### Runtime & Framework
- **Node.js** (v18+) with Express
- Avoid opinionated frameworks like NestJS per requirements

### Database & ORM
- **PostgreSQL** - ACID compliance for inventory management
- **Prisma** or **TypeORM** - Type-safe database access
- **Redis** (optional) - Caching for warehouse/stock lookups

### Testing
- **Jest** or **Vitest** - Unit and integration testing
- **Supertest** - API endpoint testing
- **ts-jest** - TypeScript support

### Development Tools
- **tsx** or **ts-node** - TypeScript execution
- **ESLint** + **Prettier** - Code quality
- **Nodemon** - Development auto-reload

### Utilities
- **Haversine formula library** (e.g., `geolib`) - Distance calculation
- **Zod** or **Joi** - Request validation
- **Winston** or **Pino** - Logging

### Infrastructure (Optional/Plus)
- **Docker** + **Docker Compose** - Local environment setup
- **GitHub Actions** - CI/CD pipeline
- **AWS/GCP/Azure** - Cloud deployment
  - Container service (ECS, Cloud Run, App Service)
  - Managed database (RDS, Cloud SQL, Azure Database)

### API Documentation
- **Swagger/OpenAPI** - API documentation
- **Postman collection** - Example requests

## Architecture Considerations
- **Transaction support** for inventory updates
- **Optimistic locking** to prevent race conditions
- **Input validation** for coordinates and quantities
- **Error handling** for invalid orders (>15% shipping cost)
- **Database migrations** for schema management
