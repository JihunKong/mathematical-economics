#!/bin/bash

# 서버 클린업 및 재배포 스크립트
# JWT 자동 갱신 기능을 포함한 완전한 재배포

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 서버 정보
SERVER_IP="13.125.188.202"
SERVER_USER="ubuntu"
PEM_FILE="/Users/jihunkong/AWS/mathematical-economics/economics.pem"

echo -e "${BLUE}===== 서버 클린업 및 재배포 시작 =====${NC}"

# 1. 서버 접속하여 완전 클린업
echo -e "${YELLOW}1. 서버 클린업 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

echo "모든 Docker 컨테이너 중지..."
docker stop $(docker ps -aq) 2>/dev/null || true

echo "모든 Docker 컨테이너 삭제..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

echo "Docker 시스템 정리..."
docker system prune -af --volumes

echo "좀비 프로세스 정리..."
sudo pkill -9 node 2>/dev/null || true

echo "시스템 nginx 중지..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl disable nginx 2>/dev/null || true

echo "Docker 서비스 재시작..."
sudo systemctl restart docker
sleep 5

echo "프로젝트 디렉토리 정리..."
cd /home/ubuntu/mathematical-economics
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json backend/dist
rm -rf frontend/node_modules frontend/package-lock.json frontend/dist

echo "최신 코드 가져오기..."
git fetch --all
git reset --hard origin/main
git pull origin main

echo "클린업 완료!"
EOF

# 2. 간단한 docker-compose 파일 생성
echo -e "${YELLOW}2. 간단한 docker-compose 파일 생성 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /home/ubuntu/mathematical-economics

# 간단한 버전으로 시작
cat > docker-compose.simple.yml << 'COMPOSE'
services:
  postgres:
    image: postgres:16-alpine
    container_name: math-postgres
    environment:
      POSTGRES_USER: mathuser
      POSTGRES_PASSWORD: mathpass123
      POSTGRES_DB: mathematical_economics
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mathuser -d mathematical_economics"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: math-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: math-backend
    ports:
      - "5001:5001"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://mathuser:mathpass123@postgres:5432/mathematical_economics
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-generated_secret_will_be_here}
      JWT_EXPIRES_IN: 7d
      REFRESH_TOKEN_EXPIRES_IN: 30d
      PORT: 5001
      CORS_ORIGIN: "https://xn--289aykm66cwye.com,http://localhost:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:

COMPOSE

echo "간단한 docker-compose 파일 생성 완료!"
EOF

# 3. Backend Dockerfile 수정
echo -e "${YELLOW}3. Backend Dockerfile 간소화 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /home/ubuntu/mathematical-economics/backend

cat > Dockerfile.simple << 'DOCKERFILE'
FROM node:18-alpine

# Python 및 필수 도구 설치
RUN apk add --no-cache python3 py3-pip openssl

# Python 패키지 설치
RUN pip3 install requests beautifulsoup4 lxml aiohttp --break-system-packages

WORKDIR /app

# 모든 파일 복사
COPY . .

# 의존성 설치
RUN npm install

# Prisma 생성
RUN npx prisma generate

# TypeScript 컴파일
RUN npm run build || npx tsc

# JWT 시크릿 파일 생성 디렉토리
RUN mkdir -p /app/secrets

EXPOSE 5001

# 시작 명령
CMD ["sh", "-c", "npx prisma db push && node dist/server.js || node src/server.js"]
DOCKERFILE

mv Dockerfile.simple Dockerfile
echo "Dockerfile 간소화 완료!"
EOF

# 4. 백엔드 빌드 및 실행
echo -e "${YELLOW}4. 백엔드 빌드 및 실행 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /home/ubuntu/mathematical-economics

echo "Docker 이미지 빌드 중..."
docker compose -f docker-compose.simple.yml build backend

echo "서비스 시작 중..."
docker compose -f docker-compose.simple.yml up -d

echo "30초 대기..."
sleep 30

echo "컨테이너 상태 확인..."
docker ps

echo "백엔드 로그 확인..."
docker logs math-backend --tail=50
EOF

# 5. 관리자 계정 생성
echo -e "${YELLOW}5. 관리자 계정 생성 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /home/ubuntu/mathematical-economics

# 관리자 생성 스크립트 실행
docker exec math-backend sh -c "cd /app && node scripts/createProductionAdmin.js || npx ts-node scripts/createProductionAdmin.ts" || true
EOF

# 6. API 테스트
echo -e "${YELLOW}6. API 테스트 중...${NC}"
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" << 'EOF'
# Health check
echo "Health check..."
curl -s http://localhost:5001/health || echo "Health check failed"

# Login test
echo -e "\nLogin test..."
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"alsk2004A!@#"}' \
  | python3 -m json.tool || echo "Login test failed"
EOF

echo -e "${GREEN}===== 배포 완료 =====${NC}"
echo -e "${BLUE}다음 단계:${NC}"
echo "1. nginx 프록시 설정 확인"
echo "2. SSL 인증서 설정"
echo "3. 프론트엔드 배포"