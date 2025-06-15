#!/bin/bash

echo "🔐 Testing login..."
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"admin123"}' | jq -r '.data.accessToken')

echo "Token: $TOKEN"

echo "📈 Testing stocks API..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5002/api/stocks | jq '.data | length'

echo "🏫 Testing teacher classes API..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5002/api/teacher/classes | jq .

echo "👨‍💼 Testing admin API..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5002/api/admin/users | jq .

echo "📊 Testing trading API..."
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5002/api/portfolio | jq .