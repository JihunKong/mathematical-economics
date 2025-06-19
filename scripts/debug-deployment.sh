#!/bin/bash

echo "🔍 Debugging mathematical-economics deployment"

echo -e "\n📦 Container status:"
docker compose -f docker-compose.prod.yml ps

echo -e "\n📋 Nginx container logs:"
docker compose -f docker-compose.prod.yml logs nginx --tail=50

echo -e "\n📋 Backend container logs:"
docker compose -f docker-compose.prod.yml logs backend --tail=20

echo -e "\n🔧 Checking frontend build:"
if [ -d "frontend/dist" ]; then
    echo "✅ Frontend dist folder exists"
    ls -la frontend/dist/ | head -10
else
    echo "❌ Frontend dist folder missing!"
    echo "Run: ./scripts/build-frontend.sh"
fi

echo -e "\n🔧 Checking nginx config:"
if [ -f "nginx/nginx.prod.conf" ]; then
    echo "✅ Nginx config exists"
else
    echo "❌ Nginx config missing!"
fi

echo -e "\n💡 Quick fix commands:"
echo "1. Rebuild everything: docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d --build"
echo "2. Build frontend: ./scripts/build-frontend.sh"
echo "3. Check nginx config: docker compose -f docker-compose.prod.yml exec nginx nginx -t"