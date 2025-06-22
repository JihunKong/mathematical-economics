#!/bin/bash

# 배포 스크립트 - 로깅 개선 및 사용자 정리

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 서버 정보
SERVER_IP="13.125.62.162"
SERVER_USER="ubuntu"
PEM_FILE="/Users/jihunkong/AWS/mathematical-economics/economics.pem"

echo -e "${BLUE}===== 경제수학 앱 업데이트 배포 시작 =====${NC}"

# SSH 연결 테스트
echo -e "${YELLOW}서버 연결 테스트 중...${NC}"
if ssh -i "$PEM_FILE" -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'Connected'" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 서버 연결 성공${NC}"
else
    echo -e "${RED}✗ 서버 연결 실패. 서버 상태를 확인해주세요.${NC}"
    echo -e "${YELLOW}서버 IP: $SERVER_IP${NC}"
    exit 1
fi

# 서버에서 업데이트 실행
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===== 서버에서 업데이트 시작 =====${NC}"

# 프로젝트 디렉토리로 이동
cd /home/ubuntu/mathematical-economics

# Git 최신 코드 가져오기
echo -e "${YELLOW}최신 코드 가져오는 중...${NC}"
git pull origin main

# Backend 빌드
echo -e "${YELLOW}Backend 빌드 중...${NC}"
cd backend
npm install
npm run build

# PM2로 백엔드 재시작
echo -e "${YELLOW}Backend 서버 재시작 중...${NC}"
pm2 restart backend

# Frontend 빌드
echo -e "${YELLOW}Frontend 빌드 중...${NC}"
cd ../frontend
npm install
npm run build

# Nginx 재시작
echo -e "${YELLOW}Nginx 재시작 중...${NC}"
sudo systemctl restart nginx

# 로그 확인
echo -e "${GREEN}✓ 배포 완료!${NC}"
echo -e "${BLUE}로그 확인:${NC}"
pm2 logs backend --lines 10

echo -e "${YELLOW}===== 사용자 정리 스크립트 안내 =====${NC}"
echo -e "사용자 정리를 실행하려면 다음 명령어를 사용하세요:"
echo -e "${BLUE}cd /home/ubuntu/mathematical-economics/backend${NC}"
echo -e "${BLUE}npx ts-node scripts/cleanupUsers.ts${NC}"

EOF

echo -e "${GREEN}✓ 모든 배포 작업이 완료되었습니다!${NC}"