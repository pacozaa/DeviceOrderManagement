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

# Debug: Show directory structure
echo "Current directory: $(pwd)"
echo "Listing current directory:"
ls -la

echo "Checking node_modules locations:"
ls -la /node_modules 2>/dev/null && echo "/node_modules exists" || echo "/node_modules not found"
ls -la node_modules 2>/dev/null && echo "node_modules exists" || echo "node_modules not found"
ls -la /home/site/wwwroot/node_modules 2>/dev/null && echo "/home/site/wwwroot/node_modules exists" || echo "/home/site/wwwroot/node_modules not found"

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

# Find the actual location of Prisma
PRISMA_PATH=""
if [ -f "/node_modules/.bin/prisma" ]; then
  PRISMA_PATH="/node_modules/.bin/prisma"
elif [ -f "node_modules/.bin/prisma" ]; then
  PRISMA_PATH="node_modules/.bin/prisma"
elif [ -f "/home/site/wwwroot/node_modules/.bin/prisma" ]; then
  PRISMA_PATH="/home/site/wwwroot/node_modules/.bin/prisma"
fi

if [ -n "$PRISMA_PATH" ]; then
  echo "Found Prisma at: $PRISMA_PATH"
  chmod +x "$PRISMA_PATH" 2>/dev/null || true
  node "$PRISMA_PATH" generate
else
  echo "Prisma not found, trying npx..."
  npx prisma generate
fi

# Run database migrations
echo "Running database migrations..."

if [ -n "$PRISMA_PATH" ]; then
  echo "Running migrations with: $PRISMA_PATH"
  node "$PRISMA_PATH" migrate deploy
else
  echo "Running migrations with npx..."
  npx prisma migrate deploy
fi

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
