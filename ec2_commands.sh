#!/bin/bash

echo "📋 EC2 Commands Reference"
echo "========================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${YELLOW}🔍 Database Commands:${NC}"
echo "# Check stock count"
echo 'sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c "SELECT COUNT(*) as total, COUNT(CASE WHEN \"isTracked\" = true THEN 1 END) as tracked FROM \"Stock\";"'
echo ""

echo "# View tracked stocks"
echo 'sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c "SELECT symbol, name, \"currentPrice\", \"changePercent\" FROM \"Stock\" WHERE \"isTracked\" = true ORDER BY symbol;"'
echo ""

echo "# View top stocks by volume"
echo 'sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c "SELECT symbol, name, \"currentPrice\", volume FROM \"Stock\" WHERE volume > 0 ORDER BY volume DESC LIMIT 20;"'
echo ""

echo -e "\n${YELLOW}📦 Import CSV Data:${NC}"
echo "# Step 1: Copy CSV files from git repo to container"
echo "sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend-1:/app/"
echo "sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend-1:/app/"
echo ""

echo "# Step 2: Run import script"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "\n${YELLOW}🐍 Fix Python Dependencies:${NC}"
echo "# Install aiohttp for crawler"
echo "sudo docker compose -f docker-compose.prod.yml exec backend pip3 install aiohttp --break-system-packages"
echo ""

echo -e "\n${YELLOW}🚀 Service Management:${NC}"
echo "# Restart backend"
echo "sudo docker compose -f docker-compose.prod.yml restart backend"
echo ""

echo "# View logs"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend"
echo ""

echo "# Full restart"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo "sudo docker compose -f docker-compose.prod.yml up -d"
echo ""

echo -e "\n${YELLOW}🧪 Test APIs:${NC}"
echo "# Test health"
echo "curl http://43.203.121.32/api/health"
echo ""

echo "# Test stock management (requires login first)"
echo './test_stock_management.sh'
echo ""

echo -e "\n${GREEN}✅ Run these commands on your EC2 server${NC}"