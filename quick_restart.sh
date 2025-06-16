#!/bin/bash

# 빠른 재시작 스크립트 (코드 변경사항이 없을 때)

echo "=== 빠른 재시작 중... ==="

cd /home/ubuntu/mathematical-economics

# 컨테이너 재시작
docker compose -f docker compose.prod.yml restart

echo "✓ 재시작 완료!"
echo ""
echo "로그 확인: docker compose -f docker compose.prod.yml logs -f"