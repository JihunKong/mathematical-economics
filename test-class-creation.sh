#!/bin/bash

echo "🔐 Getting fresh token..."
TOKEN=$(curl -s -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"admin123"}' | jq -r '.data.accessToken')

echo "Token obtained: ${TOKEN:0:20}..."

echo "🏫 Testing class creation..."
RESULT=$(curl -s -X POST http://localhost:5002/api/teacher/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트 클래스","startDate":"2025-06-15T00:00:00.000Z"}')

echo "Class creation result:"
echo $RESULT | jq .

if echo $RESULT | jq -e '.success == true' > /dev/null; then
  echo "✅ Class creation successful!"
  
  CLASS_ID=$(echo $RESULT | jq -r '.data.id')
  echo "📋 Class ID: $CLASS_ID"
  
  echo "📚 Testing class list..."
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5002/api/teacher/classes | jq .
  
else
  echo "❌ Class creation failed"
fi