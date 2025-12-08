using './main.bicep'

param environmentName = 'dev'
param location = 'eastus'
param applicationName = 'device-order-mgmt'
// Note: databaseUrl must be provided at deployment time via command line or GitHub secrets
param databaseUrl = '' // Will be overridden during deployment
param deviceName = 'SCOS Station P1 Pro'
param devicePrice = '150'
param deviceWeightKg = '0.365'
param shippingRatePerKgPerKm = '0.01'
param maxShippingPercentage = '0.15'
param nodeVersion = '18-lts'
