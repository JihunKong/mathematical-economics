#!/bin/bash

echo "📊 CSV Import Commands for EC2"
echo "=============================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Option 1: Copy CSV files to the correct location in container${NC}"
echo ""
echo "# Check if CSV files exist in home directory"
echo "ls -la /home/ubuntu/*.csv"
echo ""
echo "# Rename files if they have .1 extension"
echo "cd /home/ubuntu"
echo "[ -f data_3241_20250615.csv.1 ] && mv data_3241_20250615.csv.1 data_3241_20250615.csv"
echo "[ -f data_3308_20250615.csv.1 ] && mv data_3308_20250615.csv.1 data_3308_20250615.csv"
echo ""
echo "# Copy to container root directory"
echo "sudo docker cp /home/ubuntu/data_3241_20250615.csv mathematical-economics-backend:/"
echo "sudo docker cp /home/ubuntu/data_3308_20250615.csv mathematical-economics-backend:/"
echo ""
echo "# Run import"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "${YELLOW}Option 2: Copy to app directory in container${NC}"
echo ""
echo "# Copy to /app directory (where the script expects them)"
echo "sudo docker cp /home/ubuntu/data_3241_20250615.csv mathematical-economics-backend:/app/"
echo "sudo docker cp /home/ubuntu/data_3308_20250615.csv mathematical-economics-backend:/app/"
echo ""
echo "# Run import"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""

echo -e "${YELLOW}Option 3: Check container and fix paths${NC}"
echo ""
echo "# Enter container"
echo "sudo docker compose -f docker-compose.prod.yml exec backend sh"
echo ""
echo "# Inside container, check file locations"
echo "ls -la /"
echo "ls -la /app/"
echo "pwd"
echo ""
echo "# Run import from inside container"
echo "cd /app"
echo "node scripts/importStocksFromCSV.js"
echo ""

echo -e "${YELLOW}After successful import:${NC}"
echo ""
echo "# Check imported data"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) FROM \\\"Stock\\\";\""
echo ""
echo "# Check stocks with prices"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT symbol, name, \\\"currentPrice\\\", \\\"changePercent\\\" FROM \\\"Stock\\\" WHERE \\\"currentPrice\\\" > 0 LIMIT 10;\""
echo ""

echo -e "${GREEN}✅ Choose the option that works for your setup${NC}"