#!/bin/bash

# Azure App Service Startup Script
# This script runs database migrations before starting the application

set -e  # Exit on error

echo "Starting deployment process..."

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

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --omit=dev
fi

# Fix permissions for Prisma binaries (Azure extracts archives without execute permissions)
echo "Fixing Prisma binary permissions..."
if [ -d "node_modules/.prisma" ]; then
  find node_modules/.prisma -type f -name "*engine*" -o -name "prisma" | xargs chmod +x 2>/dev/null || true
fi
if [ -d "node_modules/prisma" ]; then
  find node_modules/prisma -type f -name "*engine*" -o -name "prisma" | xargs chmod +x 2>/dev/null || true
fi
if [ -d "node_modules/@prisma" ]; then
  find node_modules/@prisma -type f -name "*engine*" -o -name "prisma" | xargs chmod +x 2>/dev/null || true
fi

# Generate Prisma Client if not already generated
echo "Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "Migrations completed successfully"

# Seed the database
echo "Seeding database..."
npm run db:seed

echo "Database seeded successfully"

# Start the application
echo "Starting application on port ${PORT:-8080}..."
node dist/index.js
