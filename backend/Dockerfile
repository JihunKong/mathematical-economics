# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

# Install dependencies for Python, Puppeteer, OpenSSL and build tools
RUN apk add --no-cache \
    openssl \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    py3-pip \
    make \
    g++ \
    gcc \
    libc-dev

# Install Python packages for crawler scripts
RUN pip3 install requests beautifulsoup4 lxml aiohttp --break-system-packages

# Tell Puppeteer to use installed chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy scripts directory
COPY scripts ./scripts

# Install TypeScript for compiling initialization script
RUN npm install --save-dev typescript @types/node

# Make Python scripts executable
RUN chmod +x scripts/*.py

# Compile TypeScript initialization script
RUN npx tsc scripts/initialize.ts --outDir scripts --esModuleInterop --skipLibCheck --resolveJsonModule

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Generate Prisma Client and fix permissions
RUN npx prisma generate

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 5001

# Start the application with migrations and initialization
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node scripts/initialize.js && node dist/server.js"]