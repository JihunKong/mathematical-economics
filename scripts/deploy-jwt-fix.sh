#!/bin/bash

# JWT 자동 갱신 설정 배포 스크립트
# Lightsail 서버에 JWT 자동 생성 및 관리 기능 배포

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
PROJECT_DIR="/home/ubuntu/mathematical-economics"

echo -e "${GREEN}JWT 자동 갱신 설정 배포 시작...${NC}"

# 1. 로컬에서 커밋
echo -e "${YELLOW}변경사항 커밋 중...${NC}"
cd /Users/jihunkong/AWS/mathematical-economics
git add backend/src/config/jwt.ts backend/.gitignore
git commit -m "feat: JWT 자동 생성 및 파일 저장 기능 추가" || echo "변경사항 없음"
git push origin main || echo "Push 실패 - 수동으로 진행 필요"

# 2. SSH로 서버 접속하여 배포
echo -e "${YELLOW}서버에 배포 중...${NC}"

ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

echo "프로젝트 디렉토리로 이동..."
cd /home/ubuntu/mathematical-economics

echo "최신 코드 가져오기..."
git pull origin main

echo "백엔드 디렉토리로 이동..."
cd backend

echo "의존성 설치..."
npm install

echo "TypeScript 컴파일..."
npm run build

echo "기존 컨테이너 중지..."
cd ..
docker-compose -f docker-compose.prod.ssl.yml down

echo "새 이미지 빌드..."
docker-compose -f docker-compose.prod.ssl.yml build backend

echo "컨테이너 재시작..."
docker-compose -f docker-compose.prod.ssl.yml up -d

echo "로그 확인 (10초)..."
sleep 5
docker-compose -f docker-compose.prod.ssl.yml logs --tail=50 backend

echo "JWT 시크릿 파일 확인..."
docker exec mathematical-economics-backend-1 ls -la /app/.jwt-secret || echo "JWT 시크릿 파일이 아직 생성되지 않음"

echo "배포 완료!"
EOF

echo -e "${GREEN}배포가 완료되었습니다!${NC}"
echo -e "${YELLOW}로그인 테스트:${NC}"
echo "curl -X POST https://xn--289aykm66cwye.com/api/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"purusil55@gmail.com\",\"password\":\"alsk2004A!@#\"}'"