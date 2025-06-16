#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 도메인 설정
DOMAIN="xn--289aykm66cwye.com"
EMAIL="your-email@example.com"  # 실제 이메일로 변경해주세요

echo -e "${GREEN}=== SSL 인증서 초기화 시작 ===${NC}"

# certbot 디렉토리 생성
echo -e "${YELLOW}1. certbot 디렉토리 생성 중...${NC}"
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# 기존 컨테이너 정리
echo -e "${YELLOW}2. 기존 컨테이너 정리 중...${NC}"
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.ssl.yml down

# 임시 nginx 컨테이너 실행
echo -e "${YELLOW}3. 임시 nginx 컨테이너 실행 중...${NC}"
docker run -d \
  --name temp-nginx \
  -p 80:80 \
  -v ./nginx/nginx.init.conf:/etc/nginx/nginx.conf:ro \
  -v ./certbot/www:/var/www/certbot:ro \
  nginx:alpine

# 잠시 대기
sleep 5

# Let's Encrypt 인증서 발급
echo -e "${YELLOW}4. SSL 인증서 발급 중...${NC}"
docker run --rm \
  -v ./certbot/conf:/etc/letsencrypt:rw \
  -v ./certbot/www:/var/www/certbot:rw \
  certbot/certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN \
  -d www.$DOMAIN

# 임시 nginx 컨테이너 제거
echo -e "${YELLOW}5. 임시 컨테이너 제거 중...${NC}"
docker stop temp-nginx
docker rm temp-nginx

# SSL 인증서 확인
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✓ SSL 인증서 발급 성공!${NC}"
    echo -e "${GREEN}인증서 위치: ./certbot/conf/live/$DOMAIN/${NC}"
    
    # SSL 적용된 docker-compose 실행
    echo -e "${YELLOW}6. SSL 적용된 서비스 시작 중...${NC}"
    docker compose -f docker-compose.prod.ssl.yml up -d
    
    echo -e "${GREEN}=== SSL 설정 완료 ===${NC}"
    echo -e "${GREEN}https://$DOMAIN 으로 접속하세요${NC}"
else
    echo -e "${RED}✗ SSL 인증서 발급 실패${NC}"
    echo -e "${RED}도메인 DNS 설정을 확인해주세요${NC}"
    exit 1
fi