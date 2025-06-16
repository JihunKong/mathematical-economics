#!/bin/bash

echo "📊 Importing CSV Stock Data to EC2..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Upload CSV files to EC2 (run from local machine)${NC}"
echo "scp data_3241_20250615.csv data_3308_20250615.csv ubuntu@43.203.121.32:/home/ubuntu/"
echo ""

echo -e "${YELLOW}Step 2: On EC2 server, copy CSV files to backend container${NC}"
echo "cd /home/ubuntu/mathematical-economics"
echo ""
echo "# Copy CSV files to the backend directory"
echo "sudo cp /home/ubuntu/data_3241_20250615.csv ./backend/"
echo "sudo cp /home/ubuntu/data_3308_20250615.csv ./backend/"
echo ""

echo -e "${YELLOW}Step 3: Copy files into the running container${NC}"
echo "# Get container name"
echo "sudo docker ps | grep backend"
echo ""
echo "# Copy files (replace container_name with actual name)"
echo "sudo docker cp ./backend/data_3241_20250615.csv mathematical-economics-backend:/app/"
echo "sudo docker cp ./backend/data_3308_20250615.csv mathematical-economics-backend:/app/"
echo ""

echo -e "${YELLOW}Step 4: Run the import script${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "${YELLOW}Alternative: Use the built CSV files from the repository${NC}"
echo "# The CSV files are already in the git repository"
echo "cd /home/ubuntu/mathematical-economics"
echo "git pull origin main"
echo ""
echo "# Copy from backend directory to container"
echo "sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/"
echo "sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/"
echo ""
echo "# Run import"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "${GREEN}✅ After import, verify the results:${NC}"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) as total_stocks FROM \\\"Stock\\\";\""
echo ""
echo "# Check some imported stocks with prices"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT symbol, name, \\\"currentPrice\\\", \\\"changePercent\\\" FROM \\\"Stock\\\" WHERE \\\"currentPrice\\\" > 0 ORDER BY volume DESC LIMIT 10;\""