#!/bin/bash

echo "🚀 Deploying API URL fix to production..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: SSH into EC2 and pull latest code${NC}"
echo "Run these commands on your EC2 server:"
echo ""
echo "cd /home/ubuntu/mathematical-economics"
echo "git pull origin main"
echo ""
echo -e "${YELLOW}📦 Step 2: Rebuild frontend with new API configuration${NC}"
echo "sudo docker compose -f docker-compose.prod.yml build frontend"
echo ""
echo -e "${YELLOW}📦 Step 3: Restart frontend container${NC}"
echo "sudo docker compose -f docker-compose.prod.yml up -d frontend"
echo ""
echo -e "${YELLOW}🔍 Step 4: Check frontend logs${NC}"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=50 frontend"
echo ""
echo -e "${YELLOW}✅ Step 5: Test the stock price management page${NC}"
echo "Open browser to: http://43.203.121.32"
echo "1. Login as admin (purusil55@gmail.com / admin123)"
echo "2. Navigate to '주식 가격 관리' (Stock Price Management)"
echo "3. Check if the page loads correctly without blank screen"
echo ""
echo -e "${GREEN}If the page still shows blank, check:${NC}"
echo "1. Browser console (F12) for any remaining errors"
echo "2. Network tab to see if API calls are working"
echo "3. Backend logs: sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend"
echo ""
echo -e "${GREEN}Optional: Full restart if needed${NC}"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo "sudo docker compose -f docker-compose.prod.yml up -d"