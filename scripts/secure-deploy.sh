#!/bin/bash

# 보안 강화 배포 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 서버 정보
SERVER_IP="13.125.62.162"
SERVER_USER="ubuntu"
PEM_FILE="/Users/jihunkong/AWS/mathematical-economics/economics.pem"

echo -e "${BLUE}===== 보안 강화 배포 시작 =====${NC}"

# 1. 로컬 테스트 실행
echo -e "${YELLOW}1. 로컬 테스트 실행 중...${NC}"
cd backend && npm test
cd ..

# 2. 보안 테스트 실행
echo -e "${YELLOW}2. 보안 테스트 실행 중...${NC}"
cd tests/security && npx ts-node security-test.ts || true
cd ../..

# 3. 빌드
echo -e "${YELLOW}3. 프로젝트 빌드 중...${NC}"
cd backend && npm run build
cd ../frontend && npm run build
cd ..

# 4. Git 커밋
echo -e "${YELLOW}4. 변경사항 커밋 중...${NC}"
git add -A
git commit -m "Security and performance improvements" || true
git push origin main

# 5. 서버 배포
echo -e "${YELLOW}5. 서버에 배포 중...${NC}"

ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'ENDSSH'
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===== 서버 업데이트 시작 =====${NC}"

cd /home/ubuntu/mathematical-economics

# 백업 생성
echo -e "${YELLOW}기존 설정 백업 중...${NC}"
sudo cp /home/ubuntu/mathematical-economics/backend/.jwt-keys.json /home/ubuntu/mathematical-economics/backend/.jwt-keys.backup.json 2>/dev/null || true
sudo cp /home/ubuntu/mathematical-economics/backend/.env /home/ubuntu/mathematical-economics/backend/.env.backup 2>/dev/null || true

# 코드 업데이트
echo -e "${YELLOW}최신 코드 가져오는 중...${NC}"
git pull origin main

# 의존성 설치
echo -e "${YELLOW}의존성 설치 중...${NC}"
cd backend && npm install --production
cd ../frontend && npm install --production

# 빌드
echo -e "${YELLOW}프로젝트 빌드 중...${NC}"
cd ../backend && npm run build
cd ../frontend && npm run build

# PM2 재시작
echo -e "${YELLOW}서비스 재시작 중...${NC}"
cd ../backend
pm2 stop backend || true
pm2 start ecosystem.config.js

# Nginx 재시작
echo -e "${YELLOW}Nginx 재시작 중...${NC}"
sudo systemctl restart nginx

# 상태 확인
echo -e "${YELLOW}서비스 상태 확인 중...${NC}"
sleep 5
pm2 status

# 로그 확인
echo -e "${BLUE}최근 로그:${NC}"
pm2 logs backend --lines 20 --nostream

echo -e "${GREEN}✓ 서버 업데이트 완료!${NC}"

ENDSSH

# 6. 배포 후 상태 확인
echo -e "${YELLOW}6. 배포 상태 확인 중...${NC}"
sleep 10

# API 상태 확인
if curl -s "http://$SERVER_IP:5000/api/health" > /dev/null; then
    echo -e "${GREEN}✓ API 서버가 정상적으로 실행 중입니다.${NC}"
else
    echo -e "${RED}✗ API 서버 확인 실패${NC}"
fi

# 보안 헤더 확인
echo -e "${YELLOW}보안 헤더 확인 중...${NC}"
HEADERS=$(curl -s -I "http://$SERVER_IP:5000/api/health")
if echo "$HEADERS" | grep -q "X-Content-Type-Options: nosniff"; then
    echo -e "${GREEN}✓ 보안 헤더가 올바르게 설정되었습니다.${NC}"
else
    echo -e "${YELLOW}⚠ 보안 헤더 확인 필요${NC}"
fi

echo -e "${GREEN}===== 배포 완료 =====${NC}"
echo -e "${BLUE}다음 단계:${NC}"
echo "1. 웹 브라우저에서 애플리케이션 테스트"
echo "2. 모니터링 대시보드 확인: http://$SERVER_IP:5000/api/metrics"
echo "3. 로그 모니터링: ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP 'pm2 logs backend'"