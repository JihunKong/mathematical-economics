#!/bin/bash

# 라이트세일 배포 관리 대시보드
# 사용법: ./scripts/deploy-dashboard.sh [명령]

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 환경 변수 확인
if [ -z "$LIGHTSAIL_INSTANCE_NAME" ]; then
    echo -e "${RED}❌ LIGHTSAIL_INSTANCE_NAME 환경 변수가 설정되지 않았습니다.${NC}"
    exit 1
fi

if [ -z "$LIGHTSAIL_SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ LIGHTSAIL_SSH_KEY_PATH 환경 변수가 설정되지 않았습니다.${NC}"
    exit 1
fi

# 인스턴스 IP 가져오기
INSTANCE_IP=$(aws lightsail get-instance --instance-name $LIGHTSAIL_INSTANCE_NAME --query 'instance.publicIpAddress' --output text 2>/dev/null)

if [ -z "$INSTANCE_IP" ]; then
    echo -e "${RED}❌ 인스턴스 IP를 가져올 수 없습니다.${NC}"
    exit 1
fi

# 명령어 도움말
show_help() {
    echo -e "${BLUE}라이트세일 배포 관리 대시보드${NC}"
    echo ""
    echo "사용법: $0 [명령]"
    echo ""
    echo "명령어:"
    echo "  status      - 현재 서비스 상태 확인"
    echo "  logs        - 최근 로그 확인"
    echo "  restart     - 서비스 재시작"
    echo "  update      - 최신 코드 배포"
    echo "  backup      - 데이터베이스 백업"
    echo "  security    - 보안 상태 확인"
    echo "  blocked     - 차단된 IP 목록 확인"
    echo "  unblock     - IP 차단 해제"
    echo "  monitor     - 실시간 모니터링"
    echo "  help        - 이 도움말 표시"
}

# 서비스 상태 확인
check_status() {
    echo -e "${BLUE}📊 서비스 상태 확인 중...${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
        echo -e "\n=== 컨테이너 상태 ==="
        cd ~/mathematical-economics
        docker-compose ps
        
        echo -e "\n=== 디스크 사용량 ==="
        df -h | grep -E "^/dev|^Filesystem"
        
        echo -e "\n=== 메모리 사용량 ==="
        free -h
        
        echo -e "\n=== CPU 사용률 ==="
        top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU 사용률: " 100 - $1"%"}'
        
        echo -e "\n=== 최근 에러 로그 ==="
        docker-compose logs backend 2>&1 | grep -i error | tail -5
ENDSSH
    
    # API 헬스체크
    echo -e "\n${BLUE}🏥 API 헬스체크...${NC}"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$INSTANCE_IP/api/health || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ API 서버 정상${NC}"
    else
        echo -e "${RED}❌ API 서버 응답 없음 (HTTP $HTTP_STATUS)${NC}"
    fi
}

# 로그 확인
view_logs() {
    echo -e "${BLUE}📝 최근 로그 확인 중...${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
        cd ~/mathematical-economics
        echo -e "\n=== Backend 로그 (최근 50줄) ==="
        docker-compose logs backend --tail=50
        
        echo -e "\n=== Frontend 로그 (최근 20줄) ==="
        docker-compose logs frontend --tail=20
ENDSSH
}

# 서비스 재시작
restart_service() {
    echo -e "${YELLOW}🔄 서비스 재시작 중...${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
        cd ~/mathematical-economics
        docker-compose restart
        sleep 10
        docker-compose ps
ENDSSH
    
    echo -e "${GREEN}✅ 서비스 재시작 완료${NC}"
}

# 최신 코드 배포
deploy_update() {
    echo -e "${YELLOW}🚀 최신 코드 배포 중...${NC}"
    
    # deploy-lightsail.sh 스크립트 실행
    ./scripts/deploy-lightsail.sh
}

# 데이터베이스 백업
backup_database() {
    echo -e "${BLUE}💾 데이터베이스 백업 중...${NC}"
    
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << ENDSSH
        cd ~/mathematical-economics
        
        # 백업 디렉토리 생성
        mkdir -p ~/backups
        
        # PostgreSQL 백업
        docker-compose exec -T postgres pg_dump -U mathuser mathematical_economics > ~/backups/backup_${BACKUP_DATE}.sql
        
        # 백업 파일 압축
        gzip ~/backups/backup_${BACKUP_DATE}.sql
        
        # 오래된 백업 삭제 (7일 이상)
        find ~/backups -name "backup_*.sql.gz" -mtime +7 -delete
        
        echo "✅ 백업 완료: ~/backups/backup_${BACKUP_DATE}.sql.gz"
        
        # 백업 파일 목록
        echo -e "\n현재 백업 파일:"
        ls -lh ~/backups/
ENDSSH
}

# 보안 상태 확인
check_security() {
    echo -e "${BLUE}🔐 보안 상태 확인 중...${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
        echo -e "\n=== 방화벽 상태 ==="
        sudo ufw status numbered
        
        echo -e "\n=== 최근 로그인 시도 ==="
        last -10
        
        echo -e "\n=== 최근 인증 실패 ==="
        sudo grep "Failed password" /var/log/auth.log | tail -10
        
        echo -e "\n=== 열린 포트 ==="
        sudo netstat -tlnp | grep LISTEN
        
        echo -e "\n=== Docker 보안 설정 ==="
        docker version --format '{{.Server.Version}}'
ENDSSH
}

# 차단된 IP 확인
check_blocked_ips() {
    echo -e "${BLUE}🚫 차단된 IP 목록 확인 중...${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
        cd ~/mathematical-economics
        
        # Redis에서 차단된 IP 조회
        docker-compose exec redis redis-cli --scan --pattern "blocked:*" | while read key; do
            ip=${key#blocked:}
            ttl=$(docker-compose exec redis redis-cli TTL "$key" | tr -d '\r')
            echo "IP: $ip (남은 시간: ${ttl}초)"
        done
        
        # 최근 차단 로그
        echo -e "\n=== 최근 차단 활동 ==="
        docker-compose logs backend 2>&1 | grep -i "blocked\|suspicious" | tail -10
ENDSSH
}

# IP 차단 해제
unblock_ip() {
    if [ -z "$2" ]; then
        echo -e "${RED}사용법: $0 unblock <IP주소>${NC}"
        return 1
    fi
    
    IP_TO_UNBLOCK=$2
    echo -e "${YELLOW}🔓 IP 차단 해제 중: $IP_TO_UNBLOCK${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << ENDSSH
        cd ~/mathematical-economics
        
        # Redis에서 차단 해제
        docker-compose exec redis redis-cli DEL "blocked:$IP_TO_UNBLOCK"
        
        echo "✅ IP 차단 해제 완료: $IP_TO_UNBLOCK"
ENDSSH
}

# 실시간 모니터링
monitor_realtime() {
    echo -e "${BLUE}📊 실시간 모니터링 시작 (Ctrl+C로 종료)${NC}"
    
    ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@$INSTANCE_IP << 'ENDSSH'
        cd ~/mathematical-economics
        
        # watch 명령으로 실시간 모니터링
        watch -n 2 '
            echo "=== 컨테이너 상태 ==="
            docker-compose ps
            echo ""
            echo "=== CPU/메모리 사용량 ==="
            docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
            echo ""
            echo "=== 최근 요청 ==="
            docker-compose logs backend --tail=5 2>&1 | grep -E "GET|POST|PUT|DELETE"
        '
ENDSSH
}

# 메인 로직
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
        deploy_update
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
    unblock)
        unblock_ip "$@"
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