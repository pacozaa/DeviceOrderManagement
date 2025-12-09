@description('The name of the environment (e.g., dev, staging, prod)')
param environmentName string = 'dev'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The name of the application')
param applicationName string = 'device-order-mgmt'

@description('PostgreSQL database connection string')
@secure()
param databaseUrl string

@description('Device configuration - Device name')
param deviceName string = 'SCOS Station P1 Pro'

@description('Device configuration - Device price in USD')
param devicePrice string = '150'

@description('Device configuration - Device weight in KG')
param deviceWeightKg string = '0.365'

@description('Shipping configuration - Rate per KG per KM')
param shippingRatePerKgPerKm string = '0.01'

@description('Shipping configuration - Max shipping percentage')
param maxShippingPercentage string = '0.15'

@description('Node.js version for the runtime')
param nodeVersion string = '20-lts'

var appServicePlanName = '${applicationName}-plan-${environmentName}'
var appServiceName = '${applicationName}-app-${environmentName}'
var appServiceSku = 'F1'
var appServiceSkuTier = 'Free'

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  sku: {
    name: appServiceSku
    tier: appServiceSkuTier
    capacity: 1
  }
  properties: {
    reserved: true // Required for Linux
  }
  tags: {
    environment: environmentName
    application: applicationName
  }
}

// App Service (Web App)
resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|${nodeVersion}'
      alwaysOn: false
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
      appCommandLine: 'npm run start:azure'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'DATABASE_URL'
          value: databaseUrl
        }
        {
          name: 'DEVICE_NAME'
          value: deviceName
        }
        {
          name: 'DEVICE_PRICE'
          value: devicePrice
        }
        {
          name: 'DEVICE_WEIGHT_KG'
          value: deviceWeightKg
        }
        {
          name: 'SHIPPING_RATE_PER_KG_PER_KM'
          value: shippingRatePerKgPerKm
        }
        {
          name: 'MAX_SHIPPING_PERCENTAGE'
          value: maxShippingPercentage
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
      ]
      healthCheckPath: '/health'
    }
  }
  tags: {
    environment: environmentName
    application: applicationName
  }
}

// Outputs
output appServiceName string = appService.name
output appServiceHostName string = appService.properties.defaultHostName
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServicePlanName string = appServicePlan.name
