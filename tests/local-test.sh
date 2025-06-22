#!/bin/bash

echo "🧪 로컬 테스트 시작..."

# 1. 백엔드 테스트
echo -e "\n1. 백엔드 단위 테스트:"
cd backend && npm test && cd ..

# 2. 보안 테스트 (서버 내부에서 실행)
echo -e "\n2. 서버 내부 보안 테스트:"
ssh -i economics.pem ubuntu@13.125.62.162 << 'EOF'
cd /home/ubuntu/mathematical-economics

echo "보안 헤더 확인:"
curl -s -I http://localhost:5000/api/health | grep -E "(X-Content-Type-Options|X-Frame-Options|X-XSS-Protection)"

echo -e "\nSQL Injection 테스트:"
curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin\" OR \"1\"=\"1","password":"test"}' \
  | jq '.message' || echo "Failed"

echo -e "\nJWT 보안 테스트:"
curl -s "http://localhost:5000/api/portfolio" \
  -H "Authorization: Bearer invalid.jwt.token" \
  | jq '.message' || echo "Failed"

echo -e "\n✅ 서버 내부 테스트 완료"
EOF

echo -e "\n3. JWT 키 상태 확인:"
ssh -i economics.pem ubuntu@13.125.62.162 "ls -la /home/ubuntu/mathematical-economics/backend/.jwt*"

echo -e "\n4. 시스템 메트릭 확인:"
ssh -i economics.pem ubuntu@13.125.62.162 "curl -s http://localhost:5000/api/health | jq '.status'"

echo -e "\n✅ 모든 테스트 완료!"