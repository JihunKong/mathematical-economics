#!/bin/bash

echo "🧪 Testing Stock Management System..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://43.203.121.32"

echo -e "${YELLOW}1. Get auth token${NC}"
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"admin123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get auth token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got token: ${TOKEN:0:20}...${NC}"

echo -e "\n${YELLOW}2. Test stock-management/tracked endpoint${NC}"
TRACKED_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/api/stock-management/tracked)
TRACKED_COUNT=$(echo $TRACKED_RESPONSE | grep -o '"symbol"' | wc -l)
echo -e "${GREEN}✓ Tracked stocks: $TRACKED_COUNT${NC}"

echo -e "\n${YELLOW}3. Test stock-management/search endpoint${NC}"
SEARCH_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/stock-management/search?query=삼성")
SEARCH_COUNT=$(echo $SEARCH_RESPONSE | grep -o '"symbol"' | wc -l)
echo -e "${GREEN}✓ Search results for '삼성': $SEARCH_COUNT stocks${NC}"

echo -e "\n${YELLOW}4. Test adding a stock (if not exists)${NC}"
ADD_RESPONSE=$(curl -s -X POST $BASE_URL/api/stock-management/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"373220"}')
echo "Add stock response: $ADD_RESPONSE"

echo -e "\n${YELLOW}5. Test stock tracking toggle${NC}"
TOGGLE_RESPONSE=$(curl -s -X PATCH $BASE_URL/api/stock-management/373220/tracking \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isTracked":true}')
echo "Toggle tracking response: $TOGGLE_RESPONSE"

echo -e "\n${YELLOW}6. Check database stock count${NC}"
echo "Run on EC2:"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) as total, COUNT(CASE WHEN \\\"isTracked\\\" = true THEN 1 END) as tracked FROM \\\"Stock\\\";\""

echo -e "\n${GREEN}✅ Stock management API is working if all tests passed${NC}"