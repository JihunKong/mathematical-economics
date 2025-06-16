#!/bin/bash

echo "🧪 Testing API Endpoints on Production..."

BASE_URL="http://43.203.121.32"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. Testing main page load...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ $HTTP_STATUS -eq 200 ]; then
    echo -e "${GREEN}✓ Main page: OK ($HTTP_STATUS)${NC}"
else
    echo -e "${RED}✗ Main page: FAILED ($HTTP_STATUS)${NC}"
fi

echo -e "\n${YELLOW}2. Testing API health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s $BASE_URL/api/health)
echo -e "${GREEN}Health Response: $HEALTH_RESPONSE${NC}"

echo -e "\n${YELLOW}3. Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"purusil55@gmail.com","password":"admin123"}' \
    -w "\nHTTP Status: %{http_code}")
echo "$LOGIN_RESPONSE"

# Extract token if login successful
if [[ $LOGIN_RESPONSE == *"accessToken"* ]]; then
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "\n${GREEN}✓ Login successful, token obtained${NC}"
    
    echo -e "\n${YELLOW}4. Testing protected endpoints with token...${NC}"
    
    # Test portfolio endpoint
    echo -e "\n${YELLOW}Testing /api/portfolio:${NC}"
    PORTFOLIO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        $BASE_URL/api/portfolio)
    if [ $PORTFOLIO_STATUS -eq 200 ]; then
        echo -e "${GREEN}✓ Portfolio endpoint: OK ($PORTFOLIO_STATUS)${NC}"
    else
        echo -e "${RED}✗ Portfolio endpoint: FAILED ($PORTFOLIO_STATUS)${NC}"
    fi
    
    # Test stocks endpoint
    echo -e "\n${YELLOW}Testing /api/stocks:${NC}"
    STOCKS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        $BASE_URL/api/stocks)
    if [ $STOCKS_STATUS -eq 200 ]; then
        echo -e "${GREEN}✓ Stocks endpoint: OK ($STOCKS_STATUS)${NC}"
    else
        echo -e "${RED}✗ Stocks endpoint: FAILED ($STOCKS_STATUS)${NC}"
    fi
    
    # Test teacher classes endpoint
    echo -e "\n${YELLOW}Testing /api/teacher/classes:${NC}"
    CLASSES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        $BASE_URL/api/teacher/classes)
    if [ $CLASSES_STATUS -eq 200 ]; then
        echo -e "${GREEN}✓ Teacher classes endpoint: OK ($CLASSES_STATUS)${NC}"
    else
        echo -e "${RED}✗ Teacher classes endpoint: FAILED ($CLASSES_STATUS)${NC}"
    fi
else
    echo -e "${RED}✗ Login failed, cannot test protected endpoints${NC}"
fi

echo -e "\n${YELLOW}Summary:${NC}"
echo "If all endpoints return OK (200), the API fix is working correctly."
echo "If you see connection refused errors, the frontend might still be using old code."