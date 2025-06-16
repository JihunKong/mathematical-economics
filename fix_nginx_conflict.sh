#!/bin/bash

# Nginx 충돌 해결 스크립트

echo "=== Nginx 충돌 해결 스크립트 ==="
echo ""

# 1. 시스템 Nginx 상태 확인
echo "1. 시스템 Nginx 상태 확인..."
sudo systemctl status nginx --no-pager

# 2. 시스템 Nginx 비활성화
echo ""
echo "2. 시스템 Nginx를 비활성화합니다..."
sudo systemctl stop nginx
sudo systemctl disable nginx

echo "✓ 시스템 Nginx 비활성화 완료"

# 3. 포트 80 사용 확인
echo ""
echo "3. 포트 80 사용 상태 확인..."
sudo netstat -tulpn | grep :80 || echo "포트 80이 사용되지 않고 있습니다."

# 4. Docker Nginx 컨테이너 확인
echo ""
echo "4. Docker Nginx 컨테이너 상태..."
cd /home/ubuntu/mathematical-economics
docker-compose -f docker-compose.prod.yml ps nginx

# 5. Docker 컨테이너 재시작
echo ""
echo "5. Docker 컨테이너를 재시작합니다..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# 6. 상태 확인
echo ""
echo "6. 최종 상태 확인..."
sleep 5
docker-compose -f docker-compose.prod.yml ps

# 7. 웹사이트 접속 테스트
echo ""
echo "7. 웹사이트 응답 확인..."
curl -I http://localhost || echo "로컬 접속 실패"

echo ""
echo "=== 완료! ==="
echo ""
echo "이제 브라우저에서 http://서버IP 로 접속해보세요."
echo ""
echo "문제가 지속되면 다음 명령어로 로그를 확인하세요:"
echo "  docker-compose -f docker-compose.prod.yml logs nginx"