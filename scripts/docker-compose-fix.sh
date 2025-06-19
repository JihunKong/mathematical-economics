#!/bin/bash

# Docker Compose 설치 확인 및 수정 스크립트
# 라이트세일에서 실행하세요

echo "🔍 Docker Compose 버전 확인 중..."

# docker-compose 명령어 확인
if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose 명령어 발견"
    docker-compose --version
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    echo "✅ docker compose 명령어 발견"
    docker compose version
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose가 설치되지 않았습니다."
    echo "설치를 시작합니다..."
    
    # Docker Compose 플러그인 설치
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    
    if docker compose version &> /dev/null; then
        echo "✅ Docker Compose 설치 완료"
        COMPOSE_CMD="docker compose"
    else
        echo "❌ 설치 실패. 수동으로 설치해주세요."
        exit 1
    fi
fi

echo ""
echo "사용할 명령어: $COMPOSE_CMD"
echo ""

# docker-compose.yml 파일 확인
if [ -f ~/mathematical-economics/docker-compose.yml ]; then
    echo "✅ docker-compose.yml 파일 발견"
else
    echo "❌ docker-compose.yml 파일을 찾을 수 없습니다."
    echo "프로젝트 디렉토리 확인 중..."
    find ~ -name "docker-compose.yml" -type f 2>/dev/null
fi

echo ""
echo "🧪 테스트 실행..."
cd ~/mathematical-economics 2>/dev/null && $COMPOSE_CMD ps

echo ""
echo "💡 앞으로 사용할 명령어:"
echo "  상태 확인: $COMPOSE_CMD ps"
echo "  로그 보기: $COMPOSE_CMD logs"
echo "  재시작: $COMPOSE_CMD restart"
echo "  중지: $COMPOSE_CMD down"
echo "  시작: $COMPOSE_CMD up -d"