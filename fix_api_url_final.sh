#!/bin/bash

echo "🚀 Final API URL fix deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}📦 Step 1: Commit and push changes${NC}"
echo "Run locally:"
echo "git add ."
echo "git commit -m 'fix: API URL configuration for production'"
echo "git push origin main"
echo ""

echo -e "${YELLOW}📦 Step 2: On EC2 server${NC}"
echo "cd /home/ubuntu/mathematical-economics"
echo "git pull origin main"
echo ""

echo -e "${YELLOW}📦 Step 3: Update database schema${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss"
echo ""

echo -e "${YELLOW}📦 Step 4: Rebuild frontend with correct API URL${NC}"
echo "sudo docker compose -f docker-compose.prod.yml build frontend"
echo ""

echo -e "${YELLOW}📦 Step 5: Restart services${NC}"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo "sudo docker compose -f docker-compose.prod.yml up -d"
echo ""

echo -e "${YELLOW}📦 Step 6: Import stocks if not already done${NC}"
echo "# Check if stocks exist"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c \"SELECT COUNT(*) FROM \\\"Stock\\\";\""
echo ""
echo "# If count is low, import stocks"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initializeStocks.js"
echo ""

echo -e "${YELLOW}📦 Step 7: Verify API is working${NC}"
echo "# Test health endpoint"
echo "curl http://43.203.121.32/api/health"
echo ""
echo "# Login and get token"
echo "TOKEN=\$(curl -s -X POST http://43.203.121.32/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"purusil55@gmail.com\",\"password\":\"admin123\"}' | grep -o '\"accessToken\":\"[^\"]*' | cut -d'\"' -f4)"
echo ""
echo "# Test stock-management endpoint"
echo "curl -H \"Authorization: Bearer \$TOKEN\" http://43.203.121.32/api/stock-management/tracked"
echo ""

echo -e "${GREEN}✅ Expected results:${NC}"
echo "- Frontend should use /api instead of :5001/api"
echo "- All API calls go through nginx proxy"
echo "- Stock management page loads properly"
echo "- No more 500 errors"