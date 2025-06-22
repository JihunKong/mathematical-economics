#!/bin/bash

# 간단한 보안 테스트 스크립트

API_URL="http://13.125.62.162:5000"

echo "🔒 간단한 보안 테스트 시작..."

# 1. SQL Injection 테스트
echo -e "\n1. SQL Injection 테스트:"
curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com\" OR \"1\"=\"1","password":"test"}' \
  | jq '.message' || echo "Failed"

# 2. XSS 테스트
echo -e "\n2. XSS 테스트:"
curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","name":"<script>alert(\"XSS\")</script>"}' \
  | jq '.message' || echo "Failed"

# 3. 보안 헤더 확인
echo -e "\n3. 보안 헤더 확인:"
curl -s -I "$API_URL/api/health" | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)"

# 4. Rate Limiting 테스트
echo -e "\n4. Rate Limiting 테스트 (5회 로그인 시도):"
for i in {1..6}; do
  echo -n "시도 $i: "
  STATUS=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}')
  echo "HTTP $STATUS"
  sleep 0.5
done

# 5. JWT 테스트
echo -e "\n5. JWT 보안 테스트 (잘못된 토큰):"
curl -s "$API_URL/api/portfolio" \
  -H "Authorization: Bearer invalid.jwt.token" \
  | jq '.message' || echo "Failed"

echo -e "\n✅ 테스트 완료!"