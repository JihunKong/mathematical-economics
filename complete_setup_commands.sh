#!/bin/bash

echo "==================================="
echo "Mathematical Economics 전체 설정"
echo "==================================="
echo ""
echo "1. SSH 접속 (터미널에서 실행):"
echo "ssh -i \"/Users/jihunkong/Downloads/LightsailDefaultKey-ap-northeast-2 (9).pem\" ubuntu@3.36.116.11"
echo ""
echo "2. 접속 후 아래 명령어들을 순서대로 실행:"
echo ""
echo "# ===== 시스템 업데이트 ====="
echo "sudo apt update && sudo apt upgrade -y"
echo ""
echo "# ===== Docker 설치 ====="
echo "curl -fsSL https://get.docker.com -o get-docker.sh"
echo "sudo sh get-docker.sh"
echo "sudo usermod -aG docker ubuntu"
echo "sudo apt install -y docker-compose-plugin"
echo ""
echo "# ===== Git 설치 및 프로젝트 클론 ====="
echo "sudo apt install -y git"
echo "cd /home/ubuntu"
echo "git clone https://github.com/JihunKong/mathematical-economics.git"
echo "cd mathematical-economics"
echo ""
echo "# ===== 환경 파일 생성 ====="
echo "cat > backend/.env.production << 'EOF'"
echo "NODE_ENV=production"
echo "PORT=5000"
echo "DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/economic_math_stock_db"
echo "JWT_SECRET=your-secret-key-here-change-this-in-production"
echo "JWT_EXPIRES_IN=30d"
echo "REDIS_URL=redis://redis:6379"
echo "CORS_ORIGIN=*"
echo "EOF"
echo ""
echo "cat > frontend/.env.production << 'EOF'"
echo "VITE_API_URL=/api"
echo "VITE_SOCKET_URL=/"
echo "VITE_APP_NAME=경제수학 모의주식 투자"
echo "EOF"
echo ""
echo "# ===== Docker 재시작 (권한 적용) ====="
echo "sudo systemctl restart docker"
echo ""
echo "# ===== 컨테이너 빌드 및 실행 ====="
echo "sudo docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "# ===== 30초 대기 ====="
echo "sleep 30"
echo ""
echo "# ===== CSV 파일 다운로드 ====="
echo "cd backend"
echo "wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3241_20250615.csv"
echo "wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3308_20250615.csv"
echo "cd .."
echo ""
echo "# ===== CSV 파일 컨테이너로 복사 ====="
echo "sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/"
echo "sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/"
echo ""
echo "# ===== CSV Import 실행 ====="
echo "sudo docker compose -f docker-compose.prod.yml exec backend sh -c \"cd /app && node scripts/importStocksFromCSV.js\""
echo ""
echo "# ===== 방화벽 설정 ====="
echo "sudo ufw allow 22/tcp"
echo "sudo ufw allow 8081/tcp"
echo "sudo ufw allow 5001/tcp"
echo "sudo ufw --force enable"
echo ""
echo "# ===== 상태 확인 ====="
echo "sudo docker compose -f docker-compose.prod.yml ps"
echo ""
echo "# ===== 데이터 확인 ====="
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) FROM \\\"Stock\\\";\""
echo ""
echo "==================================="
echo "완료 후 접속: http://3.36.116.11:8081"
echo "==================================="