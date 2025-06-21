#!/bin/bash

# 직접 배포 스크립트 - Docker 없이 직접 실행

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 서버 정보
SERVER_IP="13.125.188.202"
SERVER_USER="ubuntu"
PEM_FILE="/Users/jihunkong/AWS/mathematical-economics/economics.pem"

echo -e "${BLUE}===== 직접 배포 시작 =====${NC}"

# 서버에서 직접 실행
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

cd /home/ubuntu/mathematical-economics

# 모든 Docker 컨테이너 중지
echo "Docker 컨테이너 정리..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Node.js 버전 확인
echo "Node.js 버전 확인..."
node --version || (echo "Node.js 설치 필요" && exit 1)

# PostgreSQL과 Redis는 Docker로 실행
echo "PostgreSQL과 Redis 시작..."
docker run -d --name postgres \
  -e POSTGRES_USER=mathuser \
  -e POSTGRES_PASSWORD=mathpass123 \
  -e POSTGRES_DB=mathematical_economics \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine

# 데이터베이스 준비 대기
echo "데이터베이스 준비 대기..."
sleep 10

# Backend 직접 실행
cd backend

# 환경 변수 설정
export NODE_ENV=production
export DATABASE_URL=postgresql://mathuser:mathpass123@localhost:5432/mathematical_economics
export REDIS_URL=redis://localhost:6379
export JWT_SECRET=ciQVI2bSK04ecciOY50057W2Y8d6y3St/qSxRlD3Bao=
export JWT_EXPIRES_IN=7d
export REFRESH_TOKEN_EXPIRES_IN=30d
export PORT=5001
export CORS_ORIGIN="https://xn--289aykm66cwye.com,http://localhost:3000"

# 의존성 설치
echo "의존성 설치..."
npm install

# Prisma 설정
echo "Prisma 설정..."
npx prisma generate
npx prisma db push

# TypeScript 컴파일
echo "TypeScript 컴파일..."
npm run build || npx tsc

# PM2로 실행 (백그라운드)
echo "PM2로 서버 시작..."
npm install -g pm2 || true
pm2 stop all || true
pm2 start dist/server.js --name math-backend || pm2 start src/server.js --name math-backend

# 로그 확인
pm2 logs math-backend --lines 50

# 관리자 계정 생성
echo "관리자 계정 생성..."
node scripts/createProductionAdmin.js || npx ts-node scripts/createProductionAdmin.ts || true

echo "배포 완료!"
EOF

# API 테스트
echo -e "${YELLOW}API 테스트 중...${NC}"
sleep 5

echo "Health check..."
curl -s http://13.125.188.202:5001/health || echo "Health check failed"

echo -e "\nLogin test..."
curl -X POST http://13.125.188.202:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"alsk2004A!@#"}' || echo "Login test failed"

# HTTPS 테스트
echo -e "\nHTTPS Login test..."
curl -X POST https://xn--289aykm66cwye.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"alsk2004A!@#"}' || echo "HTTPS test failed"

echo -e "\n${GREEN}===== 배포 완료 =====${NC}"