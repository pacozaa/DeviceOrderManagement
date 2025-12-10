# Azure Deployment Guide

This guide covers deploying the Device Order Management System to Azure Container Instances (ACI) using Bicep infrastructure as code and GitHub Actions for CI/CD.

## Architecture Overview

- **Compute**: Azure Container Instances (ACI) with Docker containers
- **Container Registry**: Azure Container Registry (ACR) for Docker images
- **Database**: External PostgreSQL database (managed by you)
- **Infrastructure**: Bicep templates for reproducible deployments
- **CI/CD**: GitHub Actions for automated testing and deployment

## Prerequisites

### Azure Requirements

1. **Azure Subscription**
   - Active Azure subscription with Owner or Contributor role
   - Azure CLI installed locally (for manual deployments)

2. **Resource Group**
   - Will be created automatically: `rg-device-order-mgmt`
   - Default location: `southeastasia`

3. **Azure Service Principal**
   
   Create a service principal for GitHub Actions authentication:
   
   ```bash
   # First, get your subscription ID
   az account show --query id -o tsv
   
   # Create the resource group (if it doesn't exist yet)
   az group create --name rg-device-order-mgmt --location southeastasia
   
   # Create service principal with Contributor role on the resource group
   az ad sp create-for-rbac \
     --name "device-order-mgmt-github" \
     --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/rg-device-order-mgmt \
     --sdk-auth
   ```
   
   **Important**: Replace `{subscription-id}` with your actual Azure subscription ID from the first command.
   
   The command will output JSON in this format:
   ```json
   {
     "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   }
   ```
   
   **Copy the entire JSON output** - you'll use it as the `AZURE_CREDENTIALS` secret in GitHub.

### Database Requirements

1. **PostgreSQL Database**
   - PostgreSQL 12+ (recommended: 15+)
   - Accessible from Azure App Service (configure firewall rules)
   - Connection string format: `postgresql://username:password@host:port/database?schema=public`

2. **Database Setup**
   ```bash
   # Create database
   createdb device_order_management
   
   # Test connection
   psql postgresql://username:password@host:port/device_order_management
   ```

### GitHub Repository Setup

1. **Fork or Clone Repository**
   ```bash
   git clone https://github.com/pacozaa/DeviceOrderManagement.git
   cd DeviceOrderManagement
   ```

2. **Configure GitHub Secrets**
   
   Navigate to: Settings → Secrets and variables → Actions → New repository secret

   **Required Secrets:**
   
   | Secret Name | Description | Example |
   |------------|-------------|---------|
   | `AZURE_CREDENTIALS` | Service principal JSON from prerequisite step | `{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}` |
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname?schema=public` |

   **Optional Secrets** (uses defaults if not set):
   
   | Secret Name | Default Value | Description |
   |------------|---------------|-------------|
   | `DEVICE_NAME` | `SCOS Station P1 Pro` | Product name |
   | `DEVICE_PRICE` | `150` | Device price in USD |
   | `DEVICE_WEIGHT_KG` | `0.365` | Device weight in kg |
   | `SHIPPING_RATE_PER_KG_PER_KM` | `0.01` | Shipping rate per kg per km |
   | `MAX_SHIPPING_PERCENTAGE` | `0.15` | Max shipping cost as percentage |

## Deployment Methods

### Method 1: Automated Deployment (GitHub Actions)

The easiest deployment method - push to main branch triggers automatic deployment.

1. **Push to Main Branch**
   ```bash
   git push origin main
   ```

2. **Monitor Deployment**
   - Go to: Actions tab in GitHub repository
   - Watch the "Deploy to Azure App Service" workflow
   - Deployment includes: Tests → Build → Infrastructure → Deploy

3. **Manual Trigger**
   - Go to: Actions → Deploy to Azure App Service → Run workflow
   - Select environment: dev/staging/prod
   - Click "Run workflow"

### Method 2: Manual Deployment (Azure CLI)

For local testing or one-off deployments.

1. **Install Azure CLI**
   ```bash
   # macOS
   brew update && brew install azure-cli
   
   # Verify installation
   az --version
   ```

2. **Login to Azure**
   ```bash
   az login
   az account set --subscription {subscription-id}
   ```

3. **Create Resource Group**
   ```bash
   az group create \
     --name rg-device-order-mgmt \
     --location southeastasia
   ```

4. **Deploy Azure Container Registry**
   ```bash
   az deployment group create \
     --resource-group rg-device-order-mgmt \
     --template-file ./infra/acr.bicep \
     --parameters \
       environmentName=dev \
       location=southeastasia \
       applicationName=device-order-mgmt
   ```

5. **Build and Push Docker Image**
   ```bash
   # Get ACR name from deployment output
   ACR_NAME=$(az acr list --resource-group rg-device-order-mgmt --query "[0].name" -o tsv)
   ACR_LOGIN_SERVER=$(az acr list --resource-group rg-device-order-mgmt --query "[0].loginServer" -o tsv)
   
   # Login to ACR
   az acr login --name $ACR_NAME
   
   # Build and push Docker image
   docker build -t $ACR_LOGIN_SERVER/device-order-mgmt:latest .
   docker push $ACR_LOGIN_SERVER/device-order-mgmt:latest
   ```

6. **Deploy Container Instance**
   ```bash
   az deployment group create \
     --resource-group rg-device-order-mgmt \
     --template-file ./infra/aci.bicep \
     --parameters \
       environmentName=dev \
       location=southeastasia \
       applicationName=device-order-mgmt \
       databaseUrl="postgresql://user:pass@host:5432/dbname?schema=public" \
       acrLoginServer=$ACR_LOGIN_SERVER \
       imageTag=latest
   ```

## Infrastructure Details

### Resource Naming Convention

- **Resource Group**: `rg-device-order-mgmt`
- **Container Registry**: `deviceordermgmtacr{env}`
- **Container Group**: `device-order-mgmt-aci-{env}`

### Bicep Templates

The infrastructure is split into two templates:

#### `infra/acr.bicep` - Azure Container Registry

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `environmentName` | string | `dev` | Environment name (dev/staging/prod) |
| `location` | string | `southeastasia` | Azure region |
| `applicationName` | string | `device-order-mgmt` | Application name prefix |

#### `infra/aci.bicep` - Azure Container Instance

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `environmentName` | string | `dev` | Environment name (dev/staging/prod) |
| `location` | string | `southeastasia` | Azure region |
| `applicationName` | string | `device-order-mgmt` | Application name prefix |
| `databaseUrl` | secure string | Required | PostgreSQL connection string |
| `deviceName` | string | `SCOS Station P1 Pro` | Product name |
| `devicePrice` | string | `150` | Device price |
| `deviceWeightKg` | string | `0.365` | Device weight |
| `shippingRatePerKgPerKm` | string | `0.01` | Shipping rate |
| `maxShippingPercentage` | string | `0.15` | Max shipping % |
| `imageTag` | string | `latest` | Docker image tag |
| `acrLoginServer` | string | Required | ACR login server URL |

### Container Configuration

- **CPU**: 1 core
- **Memory**: 2 GB
- **Operating System**: Linux
- **Runtime**: Node.js 20 (via Docker)
- **Port**: 8080
- **Health Check**: `/health` endpoint

## Post-Deployment

### Verify Deployment

1. **Check Application URL**
   ```bash
   # Get URL from container instance
   az container show \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-aci-dev \
     --query defaultHostName -o tsv
   ```

2. **Test Health Endpoint**
   ```bash
   FQDN=$(az container show --resource-group rg-device-order-mgmt --name device-order-mgmt-aci-dev --query ipAddress.fqdn -o tsv)
   curl http://${FQDN}:8080/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-12-08T10:30:00.000Z"
   }
   ```

3. **Access API Documentation**
   
   Get container URL and open in browser:
   ```bash
   echo "http://${FQDN}:8080/api-docs"
   ```

### Database Migration Management

Migrations run automatically on container startup via `startup.sh`. To manage manually:

1. **View Migration Status**
   ```bash
   az container exec \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-aci-dev \
     --exec-command "npx prisma migrate status"
   ```

2. **Apply Pending Migrations**
   ```bash
   az container exec \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-aci-dev \
     --exec-command "npx prisma migrate deploy"
   ```

3. **Rollback** (if needed)
   ```bash
   # Connect to database and restore from backup
   # Prisma doesn't support automatic rollbacks
   ```

### Seed Initial Data

To populate warehouses and test data:

```bash
# Execute seed command in container
az container exec \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev \
  --exec-command "npm run db:seed"
```

## Monitoring and Logging

### Container Logs

1. **View Logs** (follow/stream)
   ```bash
   az container logs \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-aci-dev \
     --follow
   ```

2. **View Logs** (one-time)
   ```bash
   az container logs \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-aci-dev
   ```

### Azure Portal Monitoring

1. Navigate to: Azure Portal → Container Instances → device-order-mgmt-aci-dev
2. **Monitoring Options**:
   - **Metrics**: CPU usage, Memory usage, Network bytes
   - **Logs**: Container logs
   - **Events**: Container lifecycle events
   - **Application Insights**: Advanced monitoring (optional, requires setup)

### Health Checks

The container includes a Docker health check for `/health` endpoint:

- **Check Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Start Period**: 60 seconds
- **Retries**: 3 attempts

## Scaling and Performance

### Vertical Scaling (Resource Adjustment)

Modify CPU and memory in `infra/aci.bicep`:

```bicep
resources: {
  requests: {
    cpu: 2        // Increase from 1 to 2 cores
    memoryInGB: 4 // Increase from 2 to 4 GB
  }
}
```

Then redeploy:
```bash
az deployment group create \
  --resource-group rg-device-order-mgmt \
  --template-file ./infra/aci.bicep \
  --parameters ...
```

### Horizontal Scaling

**Note**: Azure Container Instances don't support built-in horizontal scaling. For production workloads requiring horizontal scaling, consider:
- Azure Kubernetes Service (AKS)
- Azure Container Apps (supports auto-scaling)
- Azure App Service (with App Service Plan scaling)

## Security Best Practices

### 1. Database Security

- ✅ Use SSL/TLS for database connections (add `?sslmode=require` to connection string)
- ✅ Configure database firewall to allow only Azure App Service IPs
- ✅ Use strong passwords and rotate regularly
- ✅ Enable database backups

### 2. Container Security

- ✅ Use minimal base images (Node.js Alpine)
- ✅ ACR with admin credentials (consider managed identity for production)
- ✅ Environment variables for secrets (stored in ACI)
- ✅ Network security groups for container group (if needed)

### 3. GitHub Secrets Security

- ✅ Never commit secrets to git
- ✅ Rotate `AZURE_CREDENTIALS` regularly
- ✅ Use environment-specific secrets for staging/prod
- ✅ Limit service principal permissions to specific resource groups

### 4. Application Security

- ✅ Helmet.js enabled (security headers)
- ✅ CORS configured appropriately
- ✅ Input validation with Zod
- ✅ SQL injection protection via Prisma ORM

## Troubleshooting

### Common Issues

#### 1. Deployment Fails - Database Connection

**Error**: `Can't reach database server`

**Solution**:
```bash
# Check database firewall allows Azure services
# Add container instance outbound IP to database whitelist

# Get container instance IP
az container show \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev \
  --query ipAddress.ip -o tsv
```

#### 2. Migrations Fail on Startup

**Error**: `Migration failed` in logs

**Solution**:
```bash
# Check container logs
az container logs \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev

# Execute migration manually
az container exec \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev \
  --exec-command "npx prisma migrate deploy"
```

#### 3. Container Not Starting

**Error**: Container in waiting/failed state

**Solution**:
```bash
# Check container state and logs
az container show \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev \
  --query instanceView.state -o tsv

az container logs \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev

# Check events
az container show \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-aci-dev \
  --query instanceView.events
```

#### 4. GitHub Actions Deployment Fails

**Error**: Authentication failed

**Solution**:
```bash
# Regenerate service principal
az ad sp create-for-rbac \
  --name "device-order-mgmt-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-device-order-mgmt \
  --sdk-auth

# Update AZURE_CREDENTIALS secret in GitHub
```

## Cost Estimation

### Monthly Costs (ACI)

**Note**: ACI pricing is pay-per-use based on vCPU-seconds and GB-seconds.

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| Azure Container Registry (Basic) | Basic tier | ~$5/month |
| Azure Container Instance | 1 vCPU, 2GB RAM, 24/7 uptime | ~$35/month |
| **Total Azure** | | **~$40/month** |
| Database | External (your responsibility) | Variable |

**Calculation**: ACI pricing for 1 vCPU @ $0.0000012/sec + 2GB @ $0.0000001/sec = ~$0.048/hour = ~$35/month

### Cost Optimization Tips

1. **Development Environment**
   - Delete container instances when not in use (`restartPolicy: Never` already configured)
   - Use smaller resource allocations (0.5 vCPU, 1GB RAM)
   - Share ACR across environments

2. **Production Environment**
   - Consider Azure Container Apps for better pricing with auto-scaling
   - Use spot containers if workload allows interruptions
   - Monitor resource usage and right-size CPU/memory

## Updating and Maintenance

### Deploying Application Updates

Changes pushed to `main` branch automatically deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Updating Infrastructure

Modify Bicep templates and push:

```bash
# Edit Bicep files
vim infra/acr.bicep  # or infra/aci.bicep

# Test locally
az deployment group validate \
  --resource-group rg-device-order-mgmt \
  --template-file ./infra/aci.bicep \
  --parameters environmentName=dev location=southeastasia applicationName=device-order-mgmt databaseUrl="..."

# Deploy via GitHub Actions or manually
git add infra/
git commit -m "Update infrastructure"
git push origin main
```

### Backup and Recovery

1. **Database Backups**
   ```bash
   # Your responsibility - use your PostgreSQL backup solution
   pg_dump -h host -U user -d database > backup.sql
   ```

2. **Configuration Backup**
   ```bash
   # Export App Service configuration
   az webapp config appsettings list \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-app-dev \
     > app-settings-backup.json
   ```

3. **Disaster Recovery**
   ```bash
   # Restore from Git (infrastructure and code)
   git clone https://github.com/pacozaa/DeviceOrderManagement.git
   
   # Redeploy infrastructure (ACR then ACI)
   az deployment group create --template-file ./infra/acr.bicep ...
   az deployment group create --template-file ./infra/aci.bicep ...
   
   # Restore database
   psql -h host -U user -d database < backup.sql
   ```

## Multiple Environments

To deploy multiple environments (dev, staging, prod):

1. **Create Environment-Specific Secrets**
   - `DATABASE_URL_DEV`
   - `DATABASE_URL_STAGING`
   - `DATABASE_URL_PROD`

2. **Configure GitHub Environments**
   - Settings → Environments → New environment
   - Add environment-specific secrets
   - Configure protection rules (e.g., require approval for prod)

3. **Deploy to Specific Environment**
   ```bash
   # Via GitHub Actions: Use workflow_dispatch and select environment
   # Via CLI: Change environmentName parameter
   az deployment group create \
     --template-file ./infra/acr.bicep \
     --parameters environmentName=staging ...
   az deployment group create \
     --template-file ./infra/aci.bicep \
     --parameters environmentName=staging ...
   ```

## Support and Resources

### Azure Documentation

- [Azure Container Instances Documentation](https://learn.microsoft.com/en-us/azure/container-instances/)
- [Azure Container Registry Documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)

### Project Resources

- **API Documentation**: `http://{container-fqdn}:8080/api-docs`
- **GitHub Repository**: https://github.com/pacozaa/DeviceOrderManagement
- **Tech Stack**: See `docs/tech-stack.md`
- **API Reference**: See `docs/API.md`

### Getting Help

1. Check container logs: `az container logs --resource-group rg-device-order-mgmt --name device-order-mgmt-aci-dev`
2. Review GitHub Actions workflow logs
3. Check Azure Portal diagnostics
4. Review this deployment guide

---

## Quick Reference

### Essential Commands

```bash
# Deploy ACR (manual)
az deployment group create --resource-group rg-device-order-mgmt --template-file ./infra/acr.bicep --parameters environmentName=dev

# Deploy ACI (manual)
az deployment group create --resource-group rg-device-order-mgmt --template-file ./infra/aci.bicep --parameters environmentName=dev databaseUrl="..."

# View container URL
az container show --resource-group rg-device-order-mgmt --name device-order-mgmt-aci-dev --query ipAddress.fqdn -o tsv

# View logs
az container logs --resource-group rg-device-order-mgmt --name device-order-mgmt-aci-dev --follow

# Restart container
az container restart --resource-group rg-device-order-mgmt --name device-order-mgmt-aci-dev

# Delete all resources
az group delete --name rg-device-order-mgmt --yes --no-wait
```

### Application URLs

After deployment, get your container FQDN:

```bash
FQDN=$(az container show --resource-group rg-device-order-mgmt --name device-order-mgmt-aci-dev --query ipAddress.fqdn -o tsv)
```

Then access your application at:

- **Application**: `http://${FQDN}:8080`
- **Health Check**: `http://${FQDN}:8080/health`
- **API Docs**: `http://${FQDN}:8080/api-docs`
