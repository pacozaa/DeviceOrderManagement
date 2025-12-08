import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  device: {
    name: process.env.DEVICE_NAME || 'SCOS Station P1 Pro',
    price: parseFloat(process.env.DEVICE_PRICE || '150'),
    weightKg: parseFloat(process.env.DEVICE_WEIGHT_KG || '0.365'),
  },
  shipping: {
    ratePerKgPerKm: parseFloat(process.env.SHIPPING_RATE_PER_KG_PER_KM || '0.01'),
    maxShippingPercentage: parseFloat(process.env.MAX_SHIPPING_PERCENTAGE || '0.15'),
  },
  discounts: [
    { minQuantity: 250, percentage: 0.2 },
    { minQuantity: 100, percentage: 0.15 },
    { minQuantity: 50, percentage: 0.1 },
    { minQuantity: 25, percentage: 0.05 },
  ],
};
