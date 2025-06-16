#!/bin/bash

# SSH 키 파일 경로
KEY_FILE="/Users/jihunkong/Downloads/LightsailDefaultKey-ap-northeast-2 (9).pem"
REMOTE_HOST="ubuntu@3.36.116.11"

echo "🚀 Mathematical Economics 원격 설치 시작..."

# 1. 시스템 업데이트
echo "1. 시스템 업데이트 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "sudo apt update && sudo apt upgrade -y"

# 2. Docker 설치
echo "2. Docker 설치 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh && sudo usermod -aG docker ubuntu && sudo apt install -y docker-compose-plugin"

# 3. Git 설치 및 프로젝트 클론
echo "3. 프로젝트 클론 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "sudo apt install -y git && cd /home/ubuntu && git clone https://github.com/JihunKong/mathematical-economics.git"

# 4. 환경 파일 생성
echo "4. 환경 파일 생성 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics && mkdir -p backend frontend"

ssh -i "$KEY_FILE" $REMOTE_HOST "cat > /home/ubuntu/mathematical-economics/backend/.env.production << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/economic_math_stock_db
JWT_SECRET=your-secret-key-here-change-this-in-production
JWT_EXPIRES_IN=30d
REDIS_URL=redis://redis:6379
CORS_ORIGIN=*
EOF"

ssh -i "$KEY_FILE" $REMOTE_HOST "cat > /home/ubuntu/mathematical-economics/frontend/.env.production << 'EOF'
VITE_API_URL=/api
VITE_SOCKET_URL=/
VITE_APP_NAME=경제수학 모의주식 투자
EOF"

# 5. Docker 재시작
echo "5. Docker 서비스 재시작 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "sudo systemctl restart docker"

# 6. 포트 변경 (80 포트 사용)
echo "6. Docker Compose 파일 수정 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics && sed -i 's/8081:80/80:80/g' docker-compose.prod.yml"

# 7. 컨테이너 빌드 및 실행
echo "7. 컨테이너 빌드 및 실행 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics && sudo docker compose -f docker-compose.prod.yml up -d --build"

# 8. 대기
echo "8. 컨테이너 시작 대기 중 (30초)..."
sleep 30

# 9. CSV 파일 다운로드 및 복사
echo "9. CSV 파일 처리 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics/backend && wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3241_20250615.csv && wget https://raw.githubusercontent.com/JihunKong/mathematical-economics/main/backend/data_3308_20250615.csv"

ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics && sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/ && sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/"

# 10. Import 실행
echo "10. 주식 데이터 Import 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics && sudo docker compose -f docker-compose.prod.yml exec backend sh -c 'cd /app && node scripts/importStocksFromCSV.js'"

# 11. 상태 확인
echo "11. 설치 완료! 상태 확인 중..."
ssh -i "$KEY_FILE" $REMOTE_HOST "cd /home/ubuntu/mathematical-economics && sudo docker compose -f docker-compose.prod.yml ps"

echo "✅ 설치 완료!"
echo "웹사이트 접속: http://3.36.116.11"
echo "(80 포트 사용)"