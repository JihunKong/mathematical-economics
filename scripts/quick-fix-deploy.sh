#!/bin/bash

# 빠른 수정 배포 스크립트
# bcrypt 빌드 문제 해결 및 JWT 자동 생성 포함

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 서버 정보
SERVER_IP="13.125.188.202"
SERVER_USER="ubuntu"
PEM_FILE="/Users/jihunkong/AWS/mathematical-economics/economics.pem"

echo -e "${GREEN}빠른 수정 배포 시작...${NC}"

# 1. Dockerfile 업데이트
echo -e "${YELLOW}1. Dockerfile 업데이트 중...${NC}"
git add backend/Dockerfile
git commit -m "fix: Add build tools for bcrypt compilation in Alpine" || echo "No changes to commit"
git push origin main

# 2. 서버에서 변경사항 가져오기 및 재빌드
echo -e "${YELLOW}2. 서버에서 배포 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /home/ubuntu/mathematical-economics

# 최신 코드 가져오기
git pull origin main

# 기존 컨테이너 정리
docker compose -f docker-compose.simple.yml down || true
docker compose -f docker-compose.prod.ssl.yml down || true

# 간단한 버전으로 빌드 및 실행
docker compose -f docker-compose.simple.yml build --no-cache backend
docker compose -f docker-compose.simple.yml up -d

# 로그 확인
sleep 20
docker logs math-backend --tail=50
EOF

# 3. API 테스트
echo -e "${YELLOW}3. API 테스트 중...${NC}"
sleep 10

# 로컬에서 직접 테스트
echo "Health check..."
curl -s http://13.125.188.202:5001/health || echo "Health check failed"

echo -e "\nLogin test..."
curl -X POST http://13.125.188.202:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"alsk2004A!@#"}' || echo "Login test failed"

echo -e "\n${GREEN}배포 완료!${NC}"