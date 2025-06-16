#!/bin/bash

echo "🔍 Checking API errors on EC2..."

echo -e "\n1️⃣ Check backend logs for stock-management errors:"
echo "sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend | grep -A 5 -B 5 'stock-management'"

echo -e "\n2️⃣ Check if database has been updated with new fields:"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c \"\\d \\\"Stock\\\"\""

echo -e "\n3️⃣ Apply schema changes if needed:"
echo "sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss"

echo -e "\n4️⃣ Check frontend API URL configuration:"
echo "sudo docker compose -f docker-compose.prod.yml exec frontend cat /usr/share/nginx/html/assets/index-*.js | grep -o 'http://[^\"]*:5001' | head -5"

echo -e "\n5️⃣ Fix frontend API URL (rebuild with correct env):"
echo "sudo docker compose -f docker-compose.prod.yml build --build-arg VITE_API_URL=/api frontend"
echo "sudo docker compose -f docker-compose.prod.yml up -d frontend"

echo -e "\n6️⃣ Test stock-management API directly:"
echo "# First get auth token"
echo "TOKEN=\$(curl -s -X POST http://43.203.121.32/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"purusil55@gmail.com\",\"password\":\"admin123\"}' | grep -o '\"accessToken\":\"[^\"]*' | cut -d'\"' -f4)"
echo ""
echo "# Test tracked stocks endpoint"
echo "curl -H \"Authorization: Bearer \$TOKEN\" http://43.203.121.32/api/stock-management/tracked"