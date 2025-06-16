#!/bin/bash
set -e

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Mathematical Economics 자동 설치 시작 ===${NC}"

# 비대화형 모드로 설정
export DEBIAN_FRONTEND=noninteractive

# 1. 시스템 업데이트 (커널 업데이트 무시)
echo -e "${YELLOW}시스템 업데이트 중...${NC}"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# 2. Docker 설치
echo -e "${YELLOW}Docker 설치 중...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
fi
sudo apt-get install -y docker-compose-plugin

# 3. Git 설치
echo -e "${YELLOW}Git 설치 중...${NC}"
sudo apt-get install -y git

# 4. 프로젝트 클론 또는 업데이트
echo -e "${YELLOW}프로젝트 설정 중...${NC}"
cd /home/ubuntu
if [ -d "mathematical-economics" ]; then
    cd mathematical-economics
    git pull origin main
else
    git clone https://github.com/JihunKong/mathematical-economics.git
    cd mathematical-economics
fi

# 5. 환경 파일 생성
echo -e "${YELLOW}환경 파일 생성 중...${NC}"
cat > backend/.env.production << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/economic_math_stock_db
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=30d
REDIS_URL=redis://redis:6379
CORS_ORIGIN=*
EOF

cat > frontend/.env.production << 'EOF'
VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_APP_NAME=경제수학 모의주식 투자
EOF

# 6. Docker 재시작
echo -e "${YELLOW}Docker 서비스 재시작 중...${NC}"
sudo systemctl restart docker
sleep 5

# 7. 포트 설정 변경
echo -e "${YELLOW}포트 설정 변경 중...${NC}"
sed -i 's/- "8081:80"/- "80:80"/g' docker-compose.prod.yml

# 8. 기존 컨테이너 정리
echo -e "${YELLOW}기존 컨테이너 정리 중...${NC}"
sudo docker compose -f docker-compose.prod.yml down 2>/dev/null || true
sudo docker system prune -f

# 9. 컨테이너 빌드 및 실행
echo -e "${YELLOW}컨테이너 빌드 중... (5-10분 소요)${NC}"
sudo docker compose -f docker-compose.prod.yml up -d --build

# 10. 컨테이너 시작 대기
echo -e "${YELLOW}컨테이너 시작 대기 중...${NC}"
sleep 30

# 11. CSV 파일 다운로드
echo -e "${YELLOW}CSV 파일 다운로드 중...${NC}"
cd backend
wget -q https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3241_20250615.csv
wget -q https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3308_20250615.csv
cd ..

# 12. CSV 파일 컨테이너로 복사
echo -e "${YELLOW}CSV 파일 복사 중...${NC}"
sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/
sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/

# 13. Import 실행
echo -e "${YELLOW}주식 데이터 Import 중...${NC}"
sudo docker compose -f docker-compose.prod.yml exec -T backend sh -c "cd /app && node scripts/importStocksFromCSV.js"

# 14. 상태 확인
echo -e "${YELLOW}설치 상태 확인 중...${NC}"
sudo docker compose -f docker-compose.prod.yml ps

# 15. 데이터 확인
echo -e "${YELLOW}데이터 확인 중...${NC}"
STOCK_COUNT=$(sudo docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d economic_math_stock_db -t -c "SELECT COUNT(*) FROM \"Stock\";" | tr -d ' ')

echo -e "${GREEN}=== 설치 완료 ===${NC}"
echo -e "총 주식 데이터: ${STOCK_COUNT}개"
echo -e "웹사이트: ${GREEN}http://$(curl -s ifconfig.me)${NC}"
echo -e "포트: 80"
echo ""
echo -e "${YELLOW}나중에 시스템 재부팅을 권장합니다: sudo reboot${NC}"