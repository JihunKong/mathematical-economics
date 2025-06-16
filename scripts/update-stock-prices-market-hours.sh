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
CURRENT_HOUR=$(date +%H)
CURRENT_DAY=$(date +%u) # 1=월요일, 7=일요일

# 주말 체크 (토요일=6, 일요일=7)
if [ $CURRENT_DAY -eq 6 ] || [ $CURRENT_DAY -eq 7 ]; then
    echo "[$CURRENT_TIME] 주말에는 업데이트하지 않습니다" >> $LOG_FILE
    exit 0
fi

# 장 운영 시간 체크 (9시~15시 30분)
if [ $CURRENT_HOUR -lt 9 ] || [ $CURRENT_HOUR -gt 15 ]; then
    if [ $CURRENT_HOUR -eq 15 ]; then
        CURRENT_MIN=$(date +%M)
        if [ $CURRENT_MIN -gt 30 ]; then
            echo "[$CURRENT_TIME] 장 운영 시간이 아닙니다" >> $LOG_FILE
            exit 0
        fi
    else
        echo "[$CURRENT_TIME] 장 운영 시간이 아닙니다" >> $LOG_FILE
        exit 0
    fi
fi

# 실제 업데이트 스크립트 실행
$SCRIPT_DIR/update-stock-prices.sh