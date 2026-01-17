FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other dependencies needed for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy backend package files (from project root context)
COPY backend/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install --legacy-peer-deps

# Copy backend source code
COPY backend/ .

# Debug: verify files
RUN ls -la && ls -la prisma/ || echo "prisma folder not found"

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build application
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

# Regenerate Prisma client for production
RUN npx prisma generate

# Create logs directory and non-root user
RUN mkdir -p /app/logs && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Sync database schema and start server
# Using db push instead of migrate deploy to handle schema drift
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && node dist/server.js"]