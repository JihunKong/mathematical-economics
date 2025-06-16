#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 로그 파일 경로
LOG_FILE="/home/ubuntu/stock-price-update.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 현재 시간
CURRENT_TIME=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "${GREEN}[$CURRENT_TIME] 주식 가격 업데이트 시작${NC}" | tee -a $LOG_FILE

# 프로젝트 디렉토리로 이동
cd $PROJECT_DIR

# 백엔드 컨테이너가 실행 중인지 확인
if ! docker compose -f docker-compose.prod.ssl.yml ps backend | grep -q "Up"; then
    echo -e "${RED}[$CURRENT_TIME] 백엔드 컨테이너가 실행 중이 아닙니다${NC}" | tee -a $LOG_FILE
    exit 1
fi

# API 호출로 가격 업데이트
RESPONSE=$(docker compose -f docker-compose.prod.ssl.yml exec -T backend \
    curl -s -X POST http://localhost:5000/api/real-stocks/update-all-prices)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[$CURRENT_TIME] 주식 가격 업데이트 성공${NC}" | tee -a $LOG_FILE
    echo "Response: $RESPONSE" >> $LOG_FILE
else
    echo -e "${RED}[$CURRENT_TIME] 주식 가격 업데이트 실패${NC}" | tee -a $LOG_FILE
    echo "Error: $RESPONSE" >> $LOG_FILE
fi

# 로그 파일 크기 관리 (10MB 이상이면 압축)
LOG_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
if [ "$LOG_SIZE" -gt 10485760 ]; then
    mv $LOG_FILE "$LOG_FILE.$(date +%Y%m%d)"
    gzip "$LOG_FILE.$(date +%Y%m%d)"
    touch $LOG_FILE
    echo -e "${YELLOW}[$CURRENT_TIME] 로그 파일 압축 완료${NC}" | tee -a $LOG_FILE
fi