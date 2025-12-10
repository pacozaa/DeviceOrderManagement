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

@description('Container image tag')
param imageTag string = 'latest'

var acrName = 'deviceordermgmtacrdev'
var containerGroupName = '${applicationName}-aci-${environmentName}'
var containerName = '${applicationName}-container'
var dnsLabel = '${applicationName}-${environmentName}-${uniqueString(resourceGroup().id)}'

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

// Azure Container Instance
resource containerGroup 'Microsoft.ContainerInstance/containerGroups@2023-05-01' = {
  name: containerGroupName
  location: location
  properties: {
    containers: [
      {
        name: containerName
        properties: {
          image: '${containerRegistry.properties.loginServer}/${applicationName}:${imageTag}'
          resources: {
            requests: {
              cpu: 1
              memoryInGB: 2
            }
          }
          ports: [
            {
              port: 8080
              protocol: 'TCP'
            }
          ]
          environmentVariables: [
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
              secureValue: databaseUrl
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
          ]
        }
      }
    ]
    osType: 'Linux'
    restartPolicy: 'Always'
    ipAddress: {
      type: 'Public'
      ports: [
        {
          port: 8080
          protocol: 'TCP'
        }
      ]
      dnsNameLabel: dnsLabel
    }
    imageRegistryCredentials: [
      {
        server: containerRegistry.properties.loginServer
        username: containerRegistry.listCredentials().username
        password: containerRegistry.listCredentials().passwords[0].value
      }
    ]
  }
  tags: {
    environment: environmentName
    application: applicationName
  }
}

// Outputs
output containerGroupName string = containerGroup.name
output containerFqdn string = containerGroup.properties.ipAddress.fqdn
output containerUrl string = 'http://${containerGroup.properties.ipAddress.fqdn}:8080'
output acrName string = containerRegistry.name
output acrLoginServer string = containerRegistry.properties.loginServer
