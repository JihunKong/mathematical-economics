#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SSL 인증서 갱신 시작 ===${NC}"

# Certbot 컨테이너에서 인증서 갱신
echo -e "${YELLOW}인증서 갱신 중...${NC}"
docker compose -f docker-compose.prod.ssl.yml exec certbot certbot renew

# Nginx 리로드
echo -e "${YELLOW}Nginx 리로드 중...${NC}"
docker compose -f docker-compose.prod.ssl.yml exec nginx nginx -s reload

echo -e "${GREEN}=== SSL 인증서 갱신 완료 ===${NC}"