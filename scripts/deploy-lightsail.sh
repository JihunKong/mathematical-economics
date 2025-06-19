#!/bin/bash

# 라이트세일 원클릭 배포 스크립트
# 사용법: ./scripts/deploy-lightsail.sh

set -e

echo "🚀 라이트세일 배포 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경 변수 확인
if [ -z "$LIGHTSAIL_INSTANCE_NAME" ]; then
    echo -e "${RED}❌ LIGHTSAIL_INSTANCE_NAME 환경 변수가 설정되지 않았습니다.${NC}"
    echo "export LIGHTSAIL_INSTANCE_NAME='your-instance-name' 으로 설정하세요."
    exit 1
fi

# SSH 키 경로 확인
if [ -z "$LIGHTSAIL_SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ LIGHTSAIL_SSH_KEY_PATH 환경 변수가 설정되지 않았습니다.${NC}"
    echo "export LIGHTSAIL_SSH_KEY_PATH='~/.ssh/your-key.pem' 으로 설정하세요."
    exit 1
fi

# 인스턴스 IP 가져오기
INSTANCE_IP=$(aws lightsail get-instance --instance-name $LIGHTSAIL_INSTANCE_NAME --query 'instance.publicIpAddress' --output text 2>/dev/null)

if [ -z "$INSTANCE_IP" ]; then
    echo -e "${RED}❌ 인스턴스 IP를 가져올 수 없습니다. AWS CLI 설정을 확인하세요.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 인스턴스 IP: $INSTANCE_IP${NC}"

# 배포 전 로컬 테스트
echo -e "${YELLOW}📋 로컬 Docker 테스트 중...${NC}"
docker-compose build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker 빌드 실패. 로컬에서 먼저 문제를 해결하세요.${NC}"
    exit 1
fi

# Git 상태 확인
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ 커밋되지 않은 변경사항이 있습니다. 먼저 커밋하세요.${NC}"
    exit 1
fi

# 최신 코드 가져오기
echo -e "${YELLOW}📥 최신 코드 가져오는 중...${NC}"
git pull origin main

# 라이트세일 인스턴스에 연결하여 배포
echo -e "${YELLOW}🔄 라이트세일 인스턴스에 배포 중...${NC}"

ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
    set -e
    
    # 프로젝트 디렉토리로 이동
    cd ~/mathematical-economics || exit 1
    
    # 최신 코드 가져오기
    echo "📥 최신 코드 가져오는 중..."
    git pull origin main
    
    # 환경 변수 파일 확인
    if [ ! -f backend/.env ]; then
        echo "⚠️  backend/.env 파일이 없습니다. .env.example을 복사합니다."
        cp backend/.env.example backend/.env
        echo "❗ 중요: backend/.env 파일을 편집하여 실제 값을 설정하세요!"
    fi
    
    # Docker 컨테이너 중지 및 정리
    echo "🛑 기존 컨테이너 중지 중..."
    docker-compose down
    
    # Docker 이미지 정리 (디스크 공간 확보)
    echo "🧹 오래된 이미지 정리 중..."
    docker system prune -f
    
    # 새 이미지 빌드 및 컨테이너 시작
    echo "🔨 새 이미지 빌드 중..."
    docker-compose build --no-cache
    
    echo "🚀 컨테이너 시작 중..."
    docker-compose up -d
    
    # 헬스체크
    echo "❤️  헬스체크 수행 중..."
    sleep 10
    
    # 컨테이너 상태 확인
    docker-compose ps
    
    # 로그 확인
    echo "📝 최근 로그:"
    docker-compose logs --tail=50
    
    echo "✅ 배포 완료!"
ENDSSH

# 배포 후 검증
echo -e "${YELLOW}🔍 배포 검증 중...${NC}"

# API 헬스체크
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$INSTANCE_IP/api/health || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ API 서버가 정상적으로 실행 중입니다.${NC}"
else
    echo -e "${RED}❌ API 서버 응답 없음 (HTTP $HTTP_STATUS)${NC}"
    echo "라이트세일 인스턴스에 SSH로 접속하여 로그를 확인하세요:"
    echo "ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP"
    echo "docker-compose logs backend"
fi

# 보안 그룹 확인 알림
echo -e "${YELLOW}🔐 보안 설정 확인사항:${NC}"
echo "1. 라이트세일 방화벽에서 다음 포트가 열려있는지 확인:"
echo "   - HTTP (80)"
echo "   - HTTPS (443)"
echo "   - SSH (22) - 특정 IP만 허용 권장"
echo "2. 민감한 환경 변수가 .env 파일에 올바르게 설정되었는지 확인"
echo "3. SSL 인증서가 설정되었는지 확인"

echo -e "${GREEN}🎉 배포 프로세스 완료!${NC}"
echo -e "웹사이트 주소: http://$INSTANCE_IP"