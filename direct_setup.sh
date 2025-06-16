#!/bin/bash

echo "=== Mathematical Economics 서버 설정 ==="
echo "이 스크립트를 서버에서 직접 실행하세요"
echo ""

# 색상 설정
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}1. 시스템 업데이트${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}2. Docker 설치${NC}"
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
sudo apt install -y docker-compose-plugin

echo -e "${YELLOW}3. Git 설치 및 프로젝트 클론${NC}"
sudo apt install -y git
cd /home/ubuntu
git clone https://github.com/JihunKong/mathematical-economics.git
cd mathematical-economics

echo -e "${YELLOW}4. 환경 파일 생성${NC}"
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

echo -e "${YELLOW}5. Docker 재시작${NC}"
sudo systemctl restart docker

echo -e "${YELLOW}6. 포트 설정 변경 (80 사용)${NC}"
sed -i 's/- "8081:80"/- "80:80"/g' docker-compose.prod.yml

echo -e "${YELLOW}7. 컨테이너 빌드 및 실행${NC}"
sudo docker compose -f docker-compose.prod.yml up -d --build

echo -e "${YELLOW}8. 30초 대기${NC}"
sleep 30

echo -e "${YELLOW}9. CSV 파일 다운로드${NC}"
cd backend
wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3241_20250615.csv
wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3308_20250615.csv
cd ..

echo -e "${YELLOW}10. CSV 파일 컨테이너로 복사${NC}"
sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/
sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/

echo -e "${YELLOW}11. Import 실행${NC}"
sudo docker compose -f docker-compose.prod.yml exec backend sh -c "cd /app && node scripts/importStocksFromCSV.js"

echo -e "${YELLOW}12. 상태 확인${NC}"
sudo docker compose -f docker-compose.prod.yml ps

echo -e "${YELLOW}13. 데이터 확인${NC}"
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c "SELECT COUNT(*) FROM \"Stock\";"

echo -e "${GREEN}✅ 설치 완료!${NC}"
echo "웹사이트: http://3.36.116.11"
echo "포트 80 사용"