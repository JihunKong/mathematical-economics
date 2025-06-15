#!/bin/bash

# Quick fix script for database schema issues

echo "🔧 Fixing database schema..."

# Apply Prisma schema to database (this will add missing columns)
echo "1. Applying Prisma schema changes..."
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# Run initialization to ensure admin and initial data exists
echo "2. Running initialization script..."
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js

# Restart backend to ensure clean state
echo "3. Restarting backend service..."
sudo docker compose -f docker-compose.prod.yml restart backend

# Check service status
echo "4. Checking service status..."
sudo docker compose -f docker-compose.prod.yml ps

echo "✅ Database fix completed!"
echo "Try creating a class again now."