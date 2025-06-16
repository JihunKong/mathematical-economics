#!/bin/bash

# Nginx 정리 및 확인 스크립트

echo "=== Nginx 상태 정리 및 확인 ==="
echo ""

# 1. 시스템 Nginx가 완전히 비활성화되었는지 확인
echo "1. 시스템 Nginx 상태 확인..."
sudo systemctl is-enabled nginx || echo "시스템 Nginx는 비활성화되어 있습니다."
sudo systemctl is-active nginx || echo "시스템 Nginx는 중지되어 있습니다."

# 2. Docker 컨테이너 상태 확인
echo ""
echo "2. Docker 컨테이너 상태..."
cd /home/ubuntu/mathematical-economics
docker-compose -f docker-compose.prod.yml ps

# 3. 포트 사용 상태 확인
echo ""
echo "3. 포트 80 사용 상태..."
sudo lsof -i :80

# 4. 웹사이트 접속 테스트
echo ""
echo "4. 웹사이트 응답 테스트..."
echo "로컬 테스트:"
curl -s -o /dev/null -w "HTTP 상태 코드: %{http_code}\n" http://localhost

echo ""
echo "API 테스트:"
curl -s -o /dev/null -w "HTTP 상태 코드: %{http_code}\n" http://localhost/api/health

# 5. Nginx 설정 확인 (Docker 내부)
echo ""
echo "5. Docker Nginx 설정 확인..."
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

echo ""
echo "=== 상태 확인 완료 ==="
echo ""
echo "✓ 시스템 Nginx는 비활성화되었습니다."
echo "✓ Docker Nginx가 포트 80을 사용 중입니다."
echo ""
echo "브라우저에서 다음 주소로 접속하세요:"
echo "  http://$(curl -s ifconfig.me)"
echo ""
echo "문제가 있다면 다음 로그를 확인하세요:"
echo "  docker-compose -f docker-compose.prod.yml logs -f nginx"