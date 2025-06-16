#!/bin/bash

echo "🐍 Fixing Python crawler dependencies..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📦 Installing Python dependencies in backend container${NC}"
echo ""

echo "1. Install aiohttp in backend container:"
echo "sudo docker compose -f docker-compose.prod.yml exec backend pip3 install aiohttp --break-system-packages"
echo ""

echo "2. Also install other required packages:"
echo "sudo docker compose -f docker-compose.prod.yml exec backend pip3 install requests beautifulsoup4 lxml aiohttp --break-system-packages"
echo ""

echo "3. Test if the crawler works:"
echo "sudo docker compose -f docker-compose.prod.yml exec backend python3 -c \"import aiohttp; print('aiohttp imported successfully')\""
echo ""

echo "4. Restart backend to apply changes:"
echo "sudo docker compose -f docker-compose.prod.yml restart backend"
echo ""

echo -e "${YELLOW}📦 Alternative: Update Dockerfile to include Python dependencies${NC}"
echo ""
echo "Add to backend/Dockerfile in production stage:"
echo "RUN pip3 install aiohttp requests beautifulsoup4 lxml --break-system-packages"
echo ""

echo -e "${GREEN}✅ After fixing, the crawler should work and stock prices will update automatically${NC}"