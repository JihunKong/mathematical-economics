#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Economic Mathematics Stock Trading App Setup...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is not installed. Database will need to be set up manually.${NC}"
else
    echo -e "${GREEN}Starting Docker containers...${NC}"
    docker-compose up -d
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm run install:all

# Copy environment files
echo -e "${GREEN}Setting up environment files...${NC}"
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please update backend/.env with your configuration${NC}"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${YELLOW}Please update frontend/.env with your configuration${NC}"
fi

# Generate Prisma client
echo -e "${GREEN}Generating Prisma client...${NC}"
cd backend && npm run prisma:generate

# Run database migrations
echo -e "${GREEN}Running database migrations...${NC}"
npm run prisma:migrate

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}To start the application, run: npm run dev${NC}"