#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 경제수학 앱 성능 테스트 ===${NC}"

# Artillery 설치 확인
if ! command -v artillery &> /dev/null; then
    echo -e "${YELLOW}Artillery가 설치되어 있지 않습니다. 설치 중...${NC}"
    npm install -g artillery
fi

# 테스트 환경 확인
API_URL=${API_URL:-"http://localhost:5000"}
echo -e "${BLUE}테스트 대상 API: $API_URL${NC}"

# 서버 상태 확인
echo -e "${YELLOW}서버 상태 확인 중...${NC}"
if curl -s "$API_URL/api/health" > /dev/null; then
    echo -e "${GREEN}✓ 서버가 정상적으로 실행 중입니다.${NC}"
else
    echo -e "${RED}✗ 서버에 연결할 수 없습니다.${NC}"
    exit 1
fi

# 부하 테스트 실행
echo -e "${BLUE}부하 테스트 시작...${NC}"
artillery run load-test.yml \
    --target "$API_URL" \
    --output performance-report.json

# HTML 보고서 생성
echo -e "${YELLOW}성능 보고서 생성 중...${NC}"
artillery report performance-report.json --output performance-report.html

# 결과 요약
echo -e "${GREEN}✓ 테스트 완료!${NC}"
echo -e "${BLUE}보고서 위치:${NC}"
echo "  - JSON: performance-report.json"
echo "  - HTML: performance-report.html"

# 간단한 결과 분석
if command -v jq &> /dev/null; then
    echo -e "\n${BLUE}=== 주요 지표 ===${NC}"
    
    # Response time
    p95_response=$(jq '.aggregate.latency.p95' performance-report.json 2>/dev/null || echo "N/A")
    p99_response=$(jq '.aggregate.latency.p99' performance-report.json 2>/dev/null || echo "N/A")
    
    # Request rate
    rps=$(jq '.aggregate.rps.mean' performance-report.json 2>/dev/null || echo "N/A")
    
    # Error rate
    total_requests=$(jq '.aggregate.counters."http.requests"' performance-report.json 2>/dev/null || echo "0")
    total_errors=$(jq '.aggregate.counters."http.codes.4xx" + .aggregate.counters."http.codes.5xx"' performance-report.json 2>/dev/null || echo "0")
    
    if [ "$total_requests" != "0" ]; then
        error_rate=$(echo "scale=2; $total_errors * 100 / $total_requests" | bc)
    else
        error_rate="N/A"
    fi
    
    echo "• 평균 RPS: $rps"
    echo "• 95% 응답 시간: ${p95_response}ms"
    echo "• 99% 응답 시간: ${p99_response}ms"
    echo "• 에러율: ${error_rate}%"
    
    # 성능 평가
    if [ "$p95_response" != "N/A" ] && [ $(echo "$p95_response < 1000" | bc) -eq 1 ]; then
        echo -e "\n${GREEN}✓ 성능이 양호합니다.${NC}"
    else
        echo -e "\n${YELLOW}⚠ 성능 최적화가 필요할 수 있습니다.${NC}"
    fi
fi