#!/bin/bash

echo "🚀 Mathematical Economics 새 인스턴스 설정"
echo "========================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: 시스템 업데이트${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}Step 2: Docker 설치${NC}"
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

echo -e "${YELLOW}Step 3: Docker Compose 설치${NC}"
sudo apt install -y docker-compose-plugin

echo -e "${YELLOW}Step 4: Git 설치 및 프로젝트 클론${NC}"
sudo apt install -y git
cd /home/ubuntu
git clone https://github.com/JihunKong/mathematical-economics.git

echo -e "${YELLOW}Step 5: 환경 파일 생성${NC}"
cd mathematical-economics

# Backend .env.production 생성
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/economic_math_stock_db
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=30d
REDIS_URL=redis://redis:6379
CORS_ORIGIN=*
EOF

# Frontend .env.production 생성
cat > frontend/.env.production << EOF
VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_APP_NAME=경제수학 모의주식 투자
EOF

echo -e "${YELLOW}Step 6: Docker 이미지 빌드 및 실행${NC}"
# Docker 재시작 (그룹 권한 적용)
sudo systemctl restart docker

# 컨테이너 실행
sudo docker compose -f docker-compose.prod.yml up -d --build

echo -e "${YELLOW}Step 7: 데이터베이스 초기화 대기${NC}"
sleep 30

echo -e "${YELLOW}Step 8: CSV 파일 Import${NC}"
# CSV 파일 다운로드
cd backend
wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3241_20250615.csv
wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3308_20250615.csv
cd ..

# 컨테이너로 복사
sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/
sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/

# Import 실행
sudo docker compose -f docker-compose.prod.yml exec backend sh -c "cd /app && node scripts/importStocksFromCSV.js"

echo -e "${YELLOW}Step 9: 방화벽 설정${NC}"
# 필요한 포트 열기
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 8081/tcp  # Frontend
sudo ufw allow 5001/tcp  # Backend API
sudo ufw --force enable

echo -e "${GREEN}✅ 설치 완료!${NC}"
echo ""
echo "다음 명령어로 상태를 확인하세요:"
echo "sudo docker compose -f docker-compose.prod.yml ps"
echo ""
echo "웹사이트 접속: http://[새-IP-주소]:8081"
echo ""
echo "주식 데이터 확인:"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) FROM \\\"Stock\\\";\""