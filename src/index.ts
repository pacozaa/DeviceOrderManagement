import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import orderRoutes from './routes/orderRoutes';
import { swaggerSpec } from './config/swagger.config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ScreenCloud Order Management API',
  })
);

// Swagger JSON endpoint
app.get('/api-docs.json', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Only start the server if this file is run directly (not imported for tests)
if (require.main === module) {
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  });
}

export default app;
