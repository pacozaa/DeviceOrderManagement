# Azure Deployment Guide

This guide covers deploying the Device Order Management System to Azure App Service using Bicep infrastructure as code and GitHub Actions for CI/CD.

## Architecture Overview

- **Compute**: Azure App Service (Linux, B1 Basic tier) with Node.js 18 runtime
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
   - Default location: `eastus`

3. **Azure Service Principal**
   
   Create a service principal for GitHub Actions authentication:
   
   ```bash
   # First, get your subscription ID
   az account show --query id -o tsv
   
   # Create the resource group (if it doesn't exist yet)
   az group create --name rg-device-order-mgmt --location eastus
   
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
     --location eastus
   ```

4. **Deploy Infrastructure**
   ```bash
   az deployment group create \
     --resource-group rg-device-order-mgmt \
     --template-file ./infra/main.bicep \
     --parameters \
       environmentName=dev \
       location=eastus \
       applicationName=device-order-mgmt \
       databaseUrl="postgresql://user:pass@host:5432/dbname?schema=public"
   ```

5. **Build and Deploy Application**
   ```bash
   # Install dependencies and build
   npm ci
   npx prisma generate
   npm run build
   
   # Create deployment package
   mkdir -p deploy
   cp -r dist deploy/
   cp -r node_modules deploy/
   cp -r prisma deploy/
   cp package*.json deploy/
   cp startup.sh deploy/
   
   # Create ZIP
   cd deploy && zip -r ../deploy.zip . && cd ..
   
   # Deploy to App Service
   az webapp deployment source config-zip \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-app-dev \
     --src deploy.zip
   ```

6. **Run Database Migrations**
   ```bash
   # SSH into App Service (optional - migrations run automatically via startup.sh)
   az webapp ssh --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev
   
   # Manually run migrations if needed
   cd /home/site/wwwroot
   npx prisma migrate deploy
   ```

## Infrastructure Details

### Resource Naming Convention

- **Resource Group**: `rg-device-order-mgmt`
- **App Service Plan**: `device-order-mgmt-plan-{env}`
- **App Service**: `device-order-mgmt-app-{env}`

### Bicep Parameters

Located in `infra/main.bicep` and `infra/main.bicepparam`:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `environmentName` | string | `dev` | Environment name (dev/staging/prod) |
| `location` | string | `eastus` | Azure region |
| `applicationName` | string | `device-order-mgmt` | Application name prefix |
| `databaseUrl` | secure string | Required | PostgreSQL connection string |
| `deviceName` | string | `SCOS Station P1 Pro` | Product name |
| `devicePrice` | string | `150` | Device price |
| `deviceWeightKg` | string | `0.365` | Device weight |
| `shippingRatePerKgPerKm` | string | `0.01` | Shipping rate |
| `maxShippingPercentage` | string | `0.15` | Max shipping % |
| `nodeVersion` | string | `18-lts` | Node.js version |

### App Service Configuration

- **SKU**: B1 (Basic) - ~$13/month
- **Operating System**: Linux
- **Runtime**: Node.js 18 LTS
- **Always On**: Enabled
- **HTTPS Only**: Enabled
- **TLS Version**: 1.2
- **Health Check**: `/health` endpoint

## Post-Deployment

### Verify Deployment

1. **Check Application URL**
   ```bash
   # Get URL from deployment output
   az webapp show \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-app-dev \
     --query defaultHostName -o tsv
   ```

2. **Test Health Endpoint**
   ```bash
   curl https://device-order-mgmt-app-dev.azurewebsites.net/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-12-08T10:30:00.000Z"
   }
   ```

3. **Access API Documentation**
   
   Open in browser: `https://device-order-mgmt-app-dev.azurewebsites.net/api-docs`

### Database Migration Management

Migrations run automatically on deployment via `startup.sh`. To manage manually:

1. **View Migration Status**
   ```bash
   az webapp ssh --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev
   cd /home/site/wwwroot
   npx prisma migrate status
   ```

2. **Apply Pending Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Rollback** (if needed)
   ```bash
   # Connect to database and restore from backup
   # Prisma doesn't support automatic rollbacks
   ```

### Seed Initial Data

To populate warehouses and test data:

```bash
# SSH into App Service
az webapp ssh --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev

# Run seed script
cd /home/site/wwwroot
npm run db:seed
```

## Monitoring and Logging

### Application Logs

1. **Stream Logs** (real-time)
   ```bash
   az webapp log tail \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-app-dev
   ```

2. **Download Logs**
   ```bash
   az webapp log download \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-app-dev \
     --log-file logs.zip
   ```

3. **Enable Application Logging**
   ```bash
   az webapp log config \
     --resource-group rg-device-order-mgmt \
     --name device-order-mgmt-app-dev \
     --application-logging filesystem \
     --level information
   ```

### Azure Portal Monitoring

1. Navigate to: Azure Portal → App Services → device-order-mgmt-app-dev
2. **Monitoring Options**:
   - **Metrics**: CPU, Memory, HTTP requests, Response time
   - **Log stream**: Live application logs
   - **Diagnose and solve problems**: Troubleshooting wizard
   - **Application Insights**: Advanced monitoring (optional, requires setup)

### Health Checks

App Service automatically monitors `/health` endpoint:

- **Check Interval**: 60 seconds
- **Failure Threshold**: 10 attempts
- **Action on Failure**: Instance restart

## Scaling and Performance

### Vertical Scaling (Scale Up)

Change App Service Plan tier:

```bash
# Upgrade to P1V2 (Production tier)
az appservice plan update \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-plan-dev \
  --sku P1V2
```

### Horizontal Scaling (Scale Out)

Increase number of instances:

```bash
# Scale to 2 instances
az appservice plan update \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-plan-dev \
  --number-of-workers 2
```

**Note**: B1 Basic tier supports up to 3 instances. For auto-scaling, upgrade to Standard (S1) or Premium (P1V2) tiers.

## Security Best Practices

### 1. Database Security

- ✅ Use SSL/TLS for database connections (add `?sslmode=require` to connection string)
- ✅ Configure database firewall to allow only Azure App Service IPs
- ✅ Use strong passwords and rotate regularly
- ✅ Enable database backups

### 2. App Service Security

- ✅ HTTPS only (already configured in Bicep)
- ✅ Minimum TLS 1.2 (already configured)
- ✅ Disable FTP (already configured)
- ✅ Enable Managed Identity for Azure resources (if needed)

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
# Add App Service outbound IPs to database whitelist

# Get App Service outbound IPs
az webapp show \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-app-dev \
  --query outboundIpAddresses -o tsv
```

#### 2. Migrations Fail on Startup

**Error**: `Migration failed` in logs

**Solution**:
```bash
# SSH into App Service
az webapp ssh --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev

# Check migration status
cd /home/site/wwwroot
npx prisma migrate status

# Reset migrations (caution: data loss)
npx prisma migrate reset --force
npx prisma migrate deploy
```

#### 3. Application Not Starting

**Error**: Container didn't respond to HTTP pings

**Solution**:
```bash
# Check application logs
az webapp log tail \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-app-dev

# Verify startup command
az webapp config show \
  --resource-group rg-device-order-mgmt \
  --name device-order-mgmt-app-dev \
  --query "appCommandLine"

# Should be: npm run start:azure
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

### Monthly Costs (B1 Basic Tier)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| App Service Plan B1 | 1 instance, 1.75GB RAM, 10GB storage | ~$13/month |
| **Total Azure** | | **~$13/month** |
| Database | External (your responsibility) | Variable |

### Cost Optimization Tips

1. **Development Environment**
   - Use Free tier (F1) for non-production: `az appservice plan update --sku F1`
   - Stop App Service during non-business hours
   - Share App Service Plan across multiple apps

2. **Production Environment**
   - Use Reserved Instances for 30-70% savings
   - Enable auto-scaling to optimize resource usage
   - Monitor and right-size based on actual usage

## Updating and Maintenance

### Deploying Application Updates

Changes pushed to `main` branch automatically deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Updating Infrastructure

Modify `infra/main.bicep` and push:

```bash
# Edit Bicep file
vim infra/main.bicep

# Test locally
az deployment group validate \
  --resource-group rg-device-order-mgmt \
  --template-file ./infra/main.bicep \
  --parameters @infra/main.bicepparam

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
   
   # Redeploy infrastructure
   az deployment group create --template-file ./infra/main.bicep ...
   
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
     --template-file ./infra/main.bicep \
     --parameters environmentName=staging ...
   ```

## Support and Resources

### Azure Documentation

- [App Service Documentation](https://learn.microsoft.com/en-us/azure/app-service/)
- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)

### Project Resources

- **API Documentation**: `https://{your-app}.azurewebsites.net/api-docs`
- **GitHub Repository**: https://github.com/pacozaa/DeviceOrderManagement
- **Tech Stack**: See `docs/tech-stack.md`
- **API Reference**: See `docs/API.md`

### Getting Help

1. Check application logs: `az webapp log tail`
2. Review GitHub Actions workflow logs
3. Check Azure Portal diagnostics
4. Review this deployment guide

---

## Quick Reference

### Essential Commands

```bash
# Deploy to Azure (manual)
az deployment group create --resource-group rg-device-order-mgmt --template-file ./infra/main.bicep --parameters @infra/main.bicepparam databaseUrl="..."

# View application URL
az webapp show --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev --query defaultHostName -o tsv

# Stream logs
az webapp log tail --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev

# SSH into App Service
az webapp ssh --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev

# Restart App Service
az webapp restart --resource-group rg-device-order-mgmt --name device-order-mgmt-app-dev

# Delete all resources
az group delete --name rg-device-order-mgmt --yes --no-wait
```

### Application URLs

After deployment, access your application at:

- **Application**: `https://device-order-mgmt-app-{env}.azurewebsites.net`
- **Health Check**: `https://device-order-mgmt-app-{env}.azurewebsites.net/health`
- **API Docs**: `https://device-order-mgmt-app-{env}.azurewebsites.net/api-docs`

Replace `{env}` with your environment name (dev/staging/prod).
