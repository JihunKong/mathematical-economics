#!/bin/bash

echo "🔧 Fixing port conflicts for mathematical-economics deployment"

# Stop system nginx if running
if systemctl is-active --quiet nginx; then
    echo "📍 Stopping system nginx..."
    sudo systemctl stop nginx
    sudo systemctl disable nginx
    echo "✅ System nginx stopped and disabled"
fi

# Stop Apache if running
if systemctl is-active --quiet apache2; then
    echo "📍 Stopping Apache..."
    sudo systemctl stop apache2
    sudo systemctl disable apache2
    echo "✅ Apache stopped and disabled"
fi

# Check for other Docker containers using port 80/443
echo -e "\n🐳 Checking for Docker containers using ports 80/443..."
CONTAINERS_80=$(docker ps --format '{{.Names}}' --filter "publish=80")
CONTAINERS_443=$(docker ps --format '{{.Names}}' --filter "publish=443")

if [ ! -z "$CONTAINERS_80" ]; then
    echo "Found containers using port 80: $CONTAINERS_80"
    echo "Stopping these containers..."
    docker stop $CONTAINERS_80
fi

if [ ! -z "$CONTAINERS_443" ]; then
    echo "Found containers using port 443: $CONTAINERS_443"
    echo "Stopping these containers..."
    docker stop $CONTAINERS_443
fi

echo -e "\n✅ Port conflicts resolved!"
echo -e "\n📝 You can now run:"
echo "docker compose -f docker-compose.prod.yml up -d"