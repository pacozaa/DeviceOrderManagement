#!/bin/bash

# Azure App Service Startup Script
# This script runs database migrations before starting the application

echo "Starting deployment process..."

# Navigate to application directory
cd /home/site/wwwroot

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --production
fi

# Generate Prisma Client if not already generated
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "Migrations completed successfully"
else
  echo "Migration failed"
  exit 1
fi

# Start the application
echo "Starting application..."
node dist/index.js
