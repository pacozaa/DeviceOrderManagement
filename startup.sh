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

# Fix permissions for Prisma binaries (Azure extracts archives without execute permissions)
# Azure Oryx extracts node_modules to /node_modules and symlinks to node_modules
echo "Fixing Prisma binary permissions..."

# Fix permissions in both possible locations
for BASE_DIR in "/node_modules" "node_modules" "/home/site/wwwroot/node_modules"; do
  if [ -d "$BASE_DIR" ]; then
    echo "Checking $BASE_DIR..."
    
    # Fix Prisma client engines
    if [ -d "$BASE_DIR/.prisma" ]; then
      echo "Fixing permissions in $BASE_DIR/.prisma..."
      find "$BASE_DIR/.prisma" -type f \( -name "*engine*" -o -name "prisma" \) -exec chmod +x {} \; 2>/dev/null || true
    fi
    
    # Fix Prisma CLI
    if [ -d "$BASE_DIR/prisma" ]; then
      echo "Fixing permissions in $BASE_DIR/prisma..."
      find "$BASE_DIR/prisma" -type f \( -name "*engine*" -o -name "prisma" \) -exec chmod +x {} \; 2>/dev/null || true
    fi
    
    # Fix @prisma packages
    if [ -d "$BASE_DIR/@prisma" ]; then
      echo "Fixing permissions in $BASE_DIR/@prisma..."
      find "$BASE_DIR/@prisma" -type f \( -name "*engine*" -o -name "prisma" \) -exec chmod +x {} \; 2>/dev/null || true
    fi
    
    # Fix .bin directory
    if [ -d "$BASE_DIR/.bin" ]; then
      echo "Fixing permissions in $BASE_DIR/.bin..."
      chmod +x "$BASE_DIR/.bin/"* 2>/dev/null || true
    fi
  fi
done

# Generate Prisma Client if not already generated
echo "Generating Prisma Client..."
npx prisma generate || {
  echo "Prisma generate failed, attempting with node directly..."
  node node_modules/.bin/prisma generate
}

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "Prisma migrate deploy failed with npx, attempting with node directly..."
  node node_modules/.bin/prisma migrate deploy
}

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
