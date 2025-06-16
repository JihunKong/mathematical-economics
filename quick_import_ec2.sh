#!/bin/bash

echo "🚀 Quick CSV Import for EC2"
echo "=========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}EC2에서 실행할 명령어:${NC}"
echo ""
echo "# 1. Git pull 및 컨테이너 재시작"
echo "cd /home/ubuntu/mathematical-economics"
echo "git pull origin main"
echo "sudo docker compose -f docker-compose.prod.yml down"
echo "sudo docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "# 2. 30초 대기 (컨테이너 시작)"
echo "sleep 30"
echo ""
echo "# 3. CSV 파일 복사 (git 저장소에서)"
echo "sudo docker cp backend/data_3241_20250615.csv mathematical-economics-backend:/app/"
echo "sudo docker cp backend/data_3308_20250615.csv mathematical-economics-backend:/app/"
echo ""
echo "# 4. Import 실행"
echo "sudo docker compose -f docker-compose.prod.yml exec backend node scripts/importStocksFromCSV.js"
echo ""
echo "# 5. 결과 확인"
echo "sudo docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d economic_math_stock_db -c \"SELECT COUNT(*) FROM \\\"Stock\\\";\""
echo ""
echo -e "${GREEN}✅ 완료!${NC}"