@description('The name of the environment (e.g., dev, staging, prod)')
@minLength(3)
param environmentName string = 'dev'

@description('The location for all resources')
param location string = resourceGroup().location

@description('The name of the application')
param applicationName string = 'device-order-mgmt'

#disable-next-line BCP334
var acrName = '${replace(applicationName, '-', '')}acr${environmentName}'

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
  tags: {
    environment: environmentName
    application: applicationName
  }
}

// Outputs
output acrName string = containerRegistry.name
output acrLoginServer string = containerRegistry.properties.loginServer
