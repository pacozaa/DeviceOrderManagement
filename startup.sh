#!/bin/bash

# Azure App Service Startup Script
# This script runs database migrations before starting the application
# Note: Prisma binary permissions are fixed during deployment in GitHub Actions

set -e  # Exit on error

echo "Starting application startup process..."

# Navigate to application directory
cd /home/site/wwwroot

# Verify critical files exist
echo "Verifying deployment files..."
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found!"
  ls -la
  exit 1
fi

if [ ! -d "dist" ]; then
  echo "ERROR: dist directory not found!"
  ls -la
  exit 1
fi

# Fix Prisma binary permissions
echo "Fixing Prisma binary permissions..."
find node_modules/.prisma -type f -name "query-engine-*" -exec chmod +x {} \; 2>/dev/null || true
find node_modules/@prisma -type f -name "prisma-*" -exec chmod +x {} \; 2>/dev/null || true
chmod +x node_modules/.bin/prisma 2>/dev/null || true

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations completed successfully"

# Seed the database
echo "Seeding database..."
npm run db:seed || {
  echo "Database seeding failed, but continuing with application startup..."
  echo "You may need to run seeding manually"
}

echo "Database operations completed"

# Start the application
echo "Starting application on port ${PORT:-8080}..."
node dist/index.js
