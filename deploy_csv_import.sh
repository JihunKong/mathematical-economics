#!/bin/bash

echo "🚀 Deploying CSV import and chart improvements..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Step 1: Commit and push changes${NC}"
echo "Run these commands locally:"
echo ""
echo "git add ."
echo "git commit -m 'feat: Import all stocks from CSV and add price history charts'"
echo "git push origin main"
echo ""

echo -e "${YELLOW}📦 Step 2: SSH into EC2 and pull latest code${NC}"
echo "Run these commands on your EC2 server:"
echo ""
echo "cd /home/ubuntu/mathematical-economics"
echo "git pull origin main"
echo ""

echo -e "${YELLOW}📦 Step 3: Copy CSV files to backend directory${NC}"
echo "# If CSV files are not in the repo, upload them first:"
echo "scp data_3241_20250615.csv data_3308_20250615.csv ubuntu@43.203.121.32:/home/ubuntu/mathematical-economics/backend/"
echo ""

echo -e "${YELLOW}📦 Step 4: Install dependencies and rebuild${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec backend npm install"
echo "sudo docker compose -f docker-compose.prod.yml build backend frontend"
echo ""

echo -e "${YELLOW}📦 Step 5: Import stocks from CSV files${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "${YELLOW}📦 Step 6: Restart services${NC}"
echo "sudo docker compose -f docker-compose.prod.yml up -d backend frontend"
echo ""

echo -e "${YELLOW}🔍 Step 7: Verify import${NC}"
echo "# Check total stock count"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c \"SELECT COUNT(*) as total_stocks, COUNT(CASE WHEN \\\"isTracked\\\" = true THEN 1 END) as tracked_stocks FROM \\\"Stock\\\";\""
echo ""
echo "# Check some imported stocks"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c \"SELECT symbol, name, \\\"currentPrice\\\", \\\"changePercent\\\" FROM \\\"Stock\\\" ORDER BY volume DESC LIMIT 10;\""
echo ""

echo -e "${YELLOW}✅ Step 8: Test the features${NC}"
echo "1. Go to http://43.203.121.32"
echo "2. Login as admin"
echo "3. Go to '주식 가격 관리' - you should see all imported stocks"
echo "4. Go to any stock detail page - charts should show price history"
echo "5. Price history will be collected every 5 minutes during market hours"
echo ""

echo -e "${GREEN}📊 Expected results:${NC}"
echo "- All stocks from CSV files imported (3000+ stocks)"
echo "- Current prices and change percentages updated"
echo "- Price history collection started"
echo "- Charts showing real data from imported prices"
echo ""

echo -e "${GREEN}🔧 Troubleshooting:${NC}"
echo "# If import fails due to encoding:"
echo "sudo docker compose -f docker-compose.prod.yml exec backend sh"
echo "npm install iconv-lite csv-parser"
echo "node scripts/importStocksFromCSV.js"
echo ""
echo "# Check backend logs:"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend"