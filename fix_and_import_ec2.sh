#!/bin/bash

echo "🔧 Fixing EC2 Deployment and Importing CSV Data"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "\n${YELLOW}Step 1: Connect to EC2 and fix YAML${NC}"
echo "ssh ubuntu@43.203.121.32"
echo ""

echo -e "${YELLOW}Step 2: Navigate to project directory${NC}"
echo "cd /home/ubuntu/mathematical-economics"
echo ""

echo -e "${YELLOW}Step 3: Pull latest changes with fixed YAML${NC}"
echo "git pull origin main"
echo ""

echo -e "${YELLOW}Step 4: Stop current containers${NC}"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo ""

echo -e "${YELLOW}Step 5: Rebuild and start containers${NC}"
echo "sudo docker compose -f docker-compose.prod.yml up -d --build"
echo ""

echo -e "${YELLOW}Step 6: Wait for containers to be healthy${NC}"
echo "sleep 30"
echo ""

echo -e "${YELLOW}Step 7: Check container health${NC}"
echo "sudo docker compose -f docker-compose.prod.yml ps"
echo ""

echo -e "${YELLOW}Step 8: Fix database username in import script${NC}"
echo "# Update the import script to use 'postgres' user instead of 'matheconomy'"
echo ""

echo -e "${YELLOW}Step 9: Rename CSV files if needed${NC}"
echo "# If files have .1 extension, rename them"
echo "[ -f data_3241_20250615.csv.1 ] && mv data_3241_20250615.csv.1 data_3241_20250615.csv"
echo "[ -f data_3308_20250615.csv.1 ] && mv data_3308_20250615.csv.1 data_3308_20250615.csv"
echo ""

echo -e "${YELLOW}Step 10: Copy CSV files to backend directory${NC}"
echo "sudo cp data_3241_20250615.csv backend/"
echo "sudo cp data_3308_20250615.csv backend/"
echo ""

echo -e "${YELLOW}Step 11: Copy CSV files to container${NC}"
echo "# Get container name"
echo "CONTAINER_NAME=\$(sudo docker ps --format '{{.Names}}' | grep backend)"
echo "echo \"Using container: \$CONTAINER_NAME\""
echo ""
echo "# Copy files"
echo "sudo docker cp backend/data_3241_20250615.csv \$CONTAINER_NAME:/app/"
echo "sudo docker cp backend/data_3308_20250615.csv \$CONTAINER_NAME:/app/"
echo ""

echo -e "${YELLOW}Step 12: Run import script${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "${YELLOW}Step 13: Verify import results${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) as total_stocks FROM \\\"Stock\\\";\""
echo ""
echo "# Check stocks with prices"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT symbol, name, \\\"currentPrice\\\", \\\"changePercent\\\" FROM \\\"Stock\\\" WHERE \\\"currentPrice\\\" > 0 ORDER BY volume DESC LIMIT 10;\""
echo ""

echo -e "${YELLOW}Step 14: Test stock management API${NC}"
echo "./test_stock_management.sh"
echo ""

echo -e "${GREEN}✅ Run these commands on your EC2 server${NC}"