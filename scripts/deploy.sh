#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment...${NC}"

# Build frontend
echo -e "${GREEN}Building frontend...${NC}"
cd frontend
npm run build
cd ..

# Build backend
echo -e "${GREEN}Building backend...${NC}"
cd backend
npm run build
cd ..

# Create deployment directory
echo -e "${GREEN}Creating deployment package...${NC}"
mkdir -p dist

# Copy backend files
cp -r backend/dist dist/backend
cp backend/package*.json dist/backend/
cp -r backend/prisma dist/backend/

# Copy frontend build
cp -r frontend/dist dist/frontend

# Copy deployment files
cp docker-compose.yml dist/
cp -r scripts dist/

# Create deployment archive
tar -czf deployment.tar.gz dist/

echo -e "${GREEN}Deployment package created: deployment.tar.gz${NC}"
echo -e "${YELLOW}Upload this file to your EC2 instance and extract it${NC}"

# Cleanup
rm -rf dist/