#!/bin/bash

echo "🚀 Mathematical Economics 완전 자동 설치 스크립트"
echo "=============================================="
echo "2GB RAM 이상 인스턴스에서 실행하세요"
echo ""

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 비대화형 모드 설정
export DEBIAN_FRONTEND=noninteractive

echo -e "${YELLOW}1/15. 스왑 메모리 추가 (안정성 향상)${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "스왑 메모리 2GB 추가 완료"
else
    echo "스왑 메모리 이미 존재"
fi

echo -e "\n${YELLOW}2/15. 시스템 패키지 업데이트${NC}"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

echo -e "\n${YELLOW}3/15. 필수 도구 설치${NC}"
sudo apt-get install -y curl git wget net-tools

echo -e "\n${YELLOW}4/15. Docker 설치${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "Docker 설치 완료"
else
    echo "Docker 이미 설치됨"
fi

echo -e "\n${YELLOW}5/15. Docker Compose 플러그인 설치${NC}"
sudo apt-get install -y docker-compose-plugin

echo -e "\n${YELLOW}6/15. 프로젝트 클론${NC}"
cd /home/ubuntu
if [ -d "mathematical-economics" ]; then
    echo "기존 프로젝트 삭제"
    rm -rf mathematical-economics
fi
git clone https://github.com/JihunKong/mathematical-economics.git
cd mathematical-economics

echo -e "\n${YELLOW}7/15. 환경 파일 생성${NC}"
# Backend .env.production
cat > backend/.env.production << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/economic_math_stock_db
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=30d
REDIS_URL=redis://redis:6379
CORS_ORIGIN=*
ADMIN_EMAIL=purusil55@gmail.com
ADMIN_PASSWORD=alsk2004A!@#
EOF

# Frontend .env.production
cat > frontend/.env.production << 'EOF'
VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_APP_NAME=경제수학 모의주식 투자
EOF

echo -e "\n${YELLOW}8/15. Docker 서비스 재시작${NC}"
sudo systemctl restart docker
sleep 5

echo -e "\n${YELLOW}9/15. 포트 80 설정${NC}"
sed -i 's/- "8081:80"/- "80:80"/g' docker-compose.prod.yml

echo -e "\n${YELLOW}10/15. Docker 정리${NC}"
sudo docker system prune -a -f --volumes

echo -e "\n${YELLOW}11/15. 컨테이너 빌드 및 실행 (10-15분 소요)${NC}"
# 메모리 최적화 빌드
export NODE_OPTIONS="--max-old-space-size=1536"
sudo -E docker compose -f docker-compose.prod.yml up -d --build

echo -e "\n${YELLOW}12/15. 서비스 시작 대기 (40초)${NC}"
for i in {1..40}; do
    echo -n "."
    sleep 1
done
echo ""

echo -e "\n${YELLOW}13/15. 데이터베이스 마이그레이션${NC}"
sudo docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push

echo -e "\n${YELLOW}14/15. CSV 데이터 Import${NC}"
# CSV 파일 다운로드
cd backend
if [ ! -f "data_3241_20250615.csv" ]; then
    wget -q https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3241_20250615.csv
fi
if [ ! -f "data_3308_20250615.csv" ]; then
    wget -q https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3308_20250615.csv
fi
cd ..

# 파일 복사
sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/
sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/

# Import 실행
echo "주식 데이터 Import 중..."
sudo docker compose -f docker-compose.prod.yml exec -T backend sh -c "cd /app && node scripts/importStocksFromCSV.js"

echo -e "\n${YELLOW}15/15. 초기화 및 상태 확인${NC}"
# 관리자 계정 생성
sudo docker compose -f docker-compose.prod.yml exec -T backend node scripts/initialize.js

# 상태 확인
echo -e "\n${GREEN}=== 설치 상태 확인 ===${NC}"
sudo docker compose -f docker-compose.prod.yml ps

# 데이터 확인
echo -e "\n${GREEN}=== 데이터 확인 ===${NC}"
STOCK_COUNT=$(sudo docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d economic_math_stock_db -t -c "SELECT COUNT(*) FROM \"Stock\";" | tr -d ' ')
echo "총 주식 데이터: ${STOCK_COUNT}개"

# Health check
echo -e "\n${GREEN}=== API 상태 ===${NC}"
curl -s http://localhost/api/health | jq '.'

# IP 주소 확인
PUBLIC_IP=$(curl -4 -s ifconfig.me)

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}✅ 설치 완료!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "웹사이트: http://${PUBLIC_IP}"
echo "관리자 계정: purusil55@gmail.com"
echo "관리자 비밀번호: alsk2004A!@#"
echo ""
echo -e "${YELLOW}주의사항:${NC}"
echo "1. AWS Lightsail 방화벽에서 포트 80을 열어주세요"
echo "2. 첫 접속 시 로딩이 있을 수 있습니다"
echo ""
echo -e "${YELLOW}유용한 명령어:${NC}"
echo "- 로그 보기: sudo docker compose -f docker-compose.prod.yml logs -f"
echo "- 재시작: sudo docker compose -f docker-compose.prod.yml restart"
echo "- 상태 확인: sudo docker compose -f docker-compose.prod.yml ps"