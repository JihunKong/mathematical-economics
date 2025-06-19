#!/bin/bash

# Build frontend for production
echo "Building frontend for production..."

cd frontend

# Install dependencies
npm ci

# Build production bundle
NODE_ENV=production npm run build

echo "Frontend build complete! Files are in frontend/dist/"