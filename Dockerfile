FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy all files first
COPY . .

# Install production dependencies and generate Prisma Client
RUN npm ci --only=production && \
    npm install prisma tsx && \
    npx prisma generate

# Build from source if dist doesn't exist
RUN if [ ! -d "dist" ]; then \
      echo "Building from source..." && \
      npm ci && \
      npm run build && \
      rm -rf node_modules && \
      npm ci --only=production && \
      npm install prisma tsx; \
      npx prisma generate; \
    else \
      echo "Using pre-built dist directory..."; \
    fi

# Copy startup script
COPY startup.sh ./
RUN chmod +x startup.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run startup script
CMD ["sh", "startup.sh"]
