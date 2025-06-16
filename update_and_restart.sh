#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 경제수학 모의주식 투자 앱 업데이트 및 재시작 스크립트 ===${NC}"
echo ""

# 1. Git 변경사항 가져오기
echo -e "${YELLOW}1. Git 변경사항을 가져오는 중...${NC}"
cd /home/ubuntu/mathematical-economics

# 로컬 변경사항이 있을 경우 stash
git stash

# 최신 변경사항 가져오기
git pull origin main

# stash한 변경사항이 있다면 다시 적용 (충돌 시 수동 해결 필요)
git stash pop || true

echo -e "${GREEN}✓ Git 업데이트 완료${NC}"
echo ""

# 2. Docker 컨테이너 중지
echo -e "${YELLOW}2. 기존 Docker 컨테이너를 중지하는 중...${NC}"
cd /home/ubuntu/mathematical-economics
docker compose -f docker compose.prod.yml down

echo -e "${GREEN}✓ 컨테이너 중지 완료${NC}"
echo ""

# 3. Docker 이미지 재빌드
echo -e "${YELLOW}3. Docker 이미지를 재빌드하는 중... (약 5-10분 소요)${NC}"
docker compose -f docker compose.prod.yml build --no-cache

echo -e "${GREEN}✓ 이미지 빌드 완료${NC}"
echo ""

# 4. 데이터베이스 마이그레이션 (필요한 경우)
echo -e "${YELLOW}4. 데이터베이스 마이그레이션 확인 중...${NC}"
docker compose -f docker compose.prod.yml run --rm backend npx prisma db push

echo -e "${GREEN}✓ 데이터베이스 업데이트 완료${NC}"
echo ""

# 5. Docker 컨테이너 재시작
echo -e "${YELLOW}5. Docker 컨테이너를 시작하는 중...${NC}"
docker compose -f docker compose.prod.yml up -d

echo -e "${GREEN}✓ 컨테이너 시작 완료${NC}"
echo ""

# 6. 헬스체크
echo -e "${YELLOW}6. 서비스 상태를 확인하는 중...${NC}"
sleep 10

# 컨테이너 상태 확인
docker compose -f docker compose.prod.yml ps

# API 헬스체크
echo ""
echo "API 응답 확인:"
curl -s http://localhost/api/health || echo -e "${RED}API 응답 실패${NC}"

echo ""
echo -e "${GREEN}=== 업데이트 및 재시작 완료! ===${NC}"
echo ""
echo "다음 명령어로 로그를 확인할 수 있습니다:"
echo "  docker compose -f docker compose.prod.yml logs -f"
echo ""
echo "문제가 발생한 경우:"
echo "  docker compose -f docker compose.prod.yml logs backend"
echo "  docker compose -f docker compose.prod.yml logs frontend"