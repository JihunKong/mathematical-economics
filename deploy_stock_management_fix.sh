#!/bin/bash

echo "🚀 Deploying Stock Management improvements to production..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: Commit and push changes${NC}"
echo "Run these commands locally:"
echo ""
echo "git add ."
echo "git commit -m 'feat: Improve stock management with full stock list and tracking controls'"
echo "git push origin main"
echo ""

echo -e "${YELLOW}📦 Step 2: SSH into EC2 and pull latest code${NC}"
echo "Run these commands on your EC2 server:"
echo ""
echo "cd /home/ubuntu/mathematical-economics"
echo "git pull origin main"
echo ""

echo -e "${YELLOW}📦 Step 3: Rebuild both frontend and backend${NC}"
echo "sudo docker compose -f docker-compose.prod.yml build frontend backend"
echo ""

echo -e "${YELLOW}📦 Step 4: Initialize extended stock list${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initializeStocks.js"
echo ""

echo -e "${YELLOW}📦 Step 5: Restart services${NC}"
echo "sudo docker compose -f docker-compose.prod.yml up -d frontend backend"
echo ""

echo -e "${YELLOW}🔍 Step 6: Check logs${NC}"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=50 backend"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=50 frontend"
echo ""

echo -e "${YELLOW}✅ Step 7: Test the updated stock management${NC}"
echo "1. Go to http://43.203.121.32"
echo "2. Login as admin (purusil55@gmail.com / admin123)"
echo "3. Navigate to '주식 가격 관리' (Stock Price Management)"
echo "4. You should now see:"
echo "   - Toggle between '추적 중인 종목' and '전체 종목 보기'"
echo "   - Search functionality for all stocks"
echo "   - Add/Track/Untrack buttons for each stock"
echo "   - Total of 60 stocks available"
echo ""

echo -e "${GREEN}Additional commands if needed:${NC}"
echo ""
echo "# Check stock count in database"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c \"SELECT COUNT(*) as total_stocks, COUNT(CASE WHEN \\\"isTracked\\\" = true THEN 1 END) as tracked_stocks FROM \\\"Stock\\\";\""
echo ""
echo "# Full restart if needed"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo "sudo docker compose -f docker-compose.prod.yml up -d"