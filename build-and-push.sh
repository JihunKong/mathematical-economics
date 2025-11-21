#!/bin/bash

# Build and Push Docker Images to Docker Hub
# This script builds images locally and pushes to Docker Hub
# EC2 will pull these pre-built images instead of building locally

set -e

DOCKER_USERNAME="${DOCKER_USERNAME:-jihunkong}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
FRONTEND_IMAGE="$DOCKER_USERNAME/math-economics-frontend:$IMAGE_TAG"
BACKEND_IMAGE="$DOCKER_USERNAME/math-economics-backend:$IMAGE_TAG"

echo "============================================"
echo "  Building Docker Images for AMD64"
echo "============================================"
echo ""
echo "📦 Docker Username: $DOCKER_USERNAME"
echo "🏷️  Image Tag: $IMAGE_TAG"
echo ""

# Check if logged in to Docker Hub (warning only)
echo "🔐 Checking Docker Hub login..."
if ! docker info 2>/dev/null | grep -q "Username: $DOCKER_USERNAME"; then
  echo "⚠️  Note: May not be logged in to Docker Hub"
  echo "   If push fails, please run: docker login"
  echo "   Continuing with build..."
else
  echo "✅ Logged in to Docker Hub"
fi
echo ""

# Build Frontend
echo "🔨 Building Frontend Image..."
cd frontend
docker buildx build \
  --platform linux/amd64 \
  -t $FRONTEND_IMAGE \
  -f Dockerfile.prod \
  --load \
  .
cd ..
echo "✅ Frontend image built"
echo ""

# Build Backend
echo "🔨 Building Backend Image..."
cd backend
docker buildx build \
  --platform linux/amd64 \
  -t $BACKEND_IMAGE \
  -f Dockerfile.prod.optimized \
  --load \
  .
cd ..
echo "✅ Backend image built"
echo ""

# Push Images
echo "📤 Pushing images to Docker Hub..."
echo "  - $FRONTEND_IMAGE"
docker push $FRONTEND_IMAGE
echo "  - $BACKEND_IMAGE"
docker push $BACKEND_IMAGE
echo ""

echo "============================================"
echo "✅ Images built and pushed successfully!"
echo "============================================"
echo ""
echo "📋 Images:"
echo "  Frontend: $FRONTEND_IMAGE"
echo "  Backend:  $BACKEND_IMAGE"
echo ""
echo "💡 Next steps:"
echo "  1. Update docker-compose.t3small.yml to use these images"
echo "  2. Run ./deploy-to-instance.sh to deploy to EC2"
echo ""
