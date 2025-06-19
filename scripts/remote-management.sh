#!/bin/bash

# 라이트세일 인스턴스에서 직접 실행할 수 있는 관리 스크립트
# 이 스크립트를 라이트세일에 복사해서 사용하세요

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리
PROJECT_DIR="$HOME/mathematical-economics"

# 명령어 도움말
show_help() {
    echo -e "${BLUE}라이트세일 로컬 관리 스크립트${NC}"
    echo ""
    echo "사용법: $0 [명령]"
    echo ""
    echo "명령어:"
    echo "  status      - 현재 서비스 상태 확인"
    echo "  logs        - 최근 로그 확인"
    echo "  restart     - 서비스 재시작"
    echo "  update      - 최신 코드 가져오기 및 재시작"
    echo "  backup      - 데이터베이스 백업"
    echo "  security    - 보안 상태 확인"
    echo "  blocked     - 차단된 IP 목록 확인"
    echo "  monitor     - 실시간 모니터링"
    echo "  help        - 이 도움말 표시"
}

# 서비스 상태 확인
check_status() {
    echo -e "${BLUE}📊 서비스 상태 확인 중...${NC}"
    
    cd $PROJECT_DIR
    
    echo -e "\n=== 컨테이너 상태 ==="
    docker compose ps
    
    echo -e "\n=== 디스크 사용량 ==="
    df -h | grep -E "^/dev|^Filesystem"
    
    echo -e "\n=== 메모리 사용량 ==="
    free -h
    
    echo -e "\n=== CPU 사용률 ==="
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU 사용률: " 100 - $1"%"}'
    
    echo -e "\n=== 최근 에러 로그 ==="
    docker compose logs backend 2>&1 | grep -i error | tail -5
}

# 로그 확인
view_logs() {
    echo -e "${BLUE}📝 최근 로그 확인 중...${NC}"
    
    cd $PROJECT_DIR
    
    echo -e "\n=== Backend 로그 (최근 50줄) ==="
    docker compose logs backend --tail=50
    
    echo -e "\n=== Frontend 로그 (최근 20줄) ==="
    docker compose logs frontend --tail=20
}

# 서비스 재시작
restart_service() {
    echo -e "${YELLOW}🔄 서비스 재시작 중...${NC}"
    
    cd $PROJECT_DIR
    docker compose restart
    sleep 10
    docker compose ps
    
    echo -e "${GREEN}✅ 서비스 재시작 완료${NC}"
}

# 최신 코드 업데이트
update_code() {
    echo -e "${YELLOW}🚀 최신 코드 업데이트 중...${NC}"
    
    cd $PROJECT_DIR
    
    # 현재 브랜치 확인
    CURRENT_BRANCH=$(git branch --show-current)
    echo "현재 브랜치: $CURRENT_BRANCH"
    
    # 최신 코드 가져오기
    echo "📥 최신 코드 가져오는 중..."
    git pull origin $CURRENT_BRANCH
    
    # Docker 컨테이너 재빌드 및 재시작
    echo "🔨 컨테이너 재빌드 중..."
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    
    # 헬스체크
    sleep 10
    docker compose ps
    
    echo -e "${GREEN}✅ 업데이트 완료!${NC}"
}

# 데이터베이스 백업
backup_database() {
    echo -e "${BLUE}💾 데이터베이스 백업 중...${NC}"
    
    cd $PROJECT_DIR
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    
    # 백업 디렉토리 생성
    mkdir -p ~/backups
    
    # PostgreSQL 백업
    docker compose exec -T postgres pg_dump -U mathuser mathematical_economics > ~/backups/backup_${BACKUP_DATE}.sql
    
    # 백업 파일 압축
    gzip ~/backups/backup_${BACKUP_DATE}.sql
    
    # 오래된 백업 삭제 (7일 이상)
    find ~/backups -name "backup_*.sql.gz" -mtime +7 -delete
    
    echo "✅ 백업 완료: ~/backups/backup_${BACKUP_DATE}.sql.gz"
    
    # 백업 파일 목록
    echo -e "\n현재 백업 파일:"
    ls -lh ~/backups/
}

# 보안 상태 확인
check_security() {
    echo -e "${BLUE}🔐 보안 상태 확인 중...${NC}"
    
    echo -e "\n=== 방화벽 상태 ==="
    sudo ufw status numbered
    
    echo -e "\n=== 최근 로그인 시도 ==="
    last -10
    
    echo -e "\n=== 최근 인증 실패 ==="
    sudo grep "Failed password" /var/log/auth.log | tail -10 || echo "로그 파일을 찾을 수 없습니다."
    
    echo -e "\n=== 열린 포트 ==="
    sudo netstat -tlnp | grep LISTEN
    
    echo -e "\n=== Docker 버전 ==="
    docker version --format '{{.Server.Version}}'
}

# 차단된 IP 확인
check_blocked_ips() {
    echo -e "${BLUE}🚫 차단된 IP 목록 확인 중...${NC}"
    
    cd $PROJECT_DIR
    
    # Redis에서 차단된 IP 조회
    echo "=== Redis에 저장된 차단 IP ==="
    docker compose exec redis redis-cli --scan --pattern "blocked:*" | while read key; do
        ip=${key#blocked:}
        ttl=$(docker compose exec redis redis-cli TTL "$key" | tr -d '\r')
        echo "IP: $ip (남은 시간: ${ttl}초)"
    done
    
    # 최근 차단 로그
    echo -e "\n=== 최근 차단 활동 ==="
    docker compose logs backend 2>&1 | grep -i "blocked\|suspicious" | tail -10
}

# 실시간 모니터링
monitor_realtime() {
    echo -e "${BLUE}📊 실시간 모니터링 시작 (Ctrl+C로 종료)${NC}"
    
    cd $PROJECT_DIR
    
    # watch 명령 확인
    if ! command -v watch &> /dev/null; then
        echo -e "${RED}watch 명령이 없습니다. 설치 중...${NC}"
        sudo apt-get update && sudo apt-get install -y watch
    fi
    
    # 실시간 모니터링
    watch -n 2 '
        echo "=== 컨테이너 상태 ==="
        docker compose ps
        echo ""
        echo "=== CPU/메모리 사용량 ==="
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        echo ""
        echo "=== 최근 요청 ==="
        docker compose logs backend --tail=5 2>&1 | grep -E "GET|POST|PUT|DELETE"
    '
}

# 메인 로직
cd $PROJECT_DIR 2>/dev/null || {
    echo -e "${RED}❌ 프로젝트 디렉토리를 찾을 수 없습니다: $PROJECT_DIR${NC}"
    echo "현재 디렉토리: $(pwd)"
    exit 1
}

case "$1" in
    status)
        check_status
        ;;
    logs)
        view_logs
        ;;
    restart)
        restart_service
        ;;
    update)
        update_code
        ;;
    backup)
        backup_database
        ;;
    security)
        check_security
        ;;
    blocked)
        check_blocked_ips
        ;;
    monitor)
        monitor_realtime
        ;;
    help|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ 알 수 없는 명령: $1${NC}"
        show_help
        exit 1
        ;;
esac