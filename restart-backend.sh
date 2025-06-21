#!/bin/bash

echo "백엔드 재시작 스크립트"
echo "========================"

# 백엔드 디렉토리로 이동
cd backend

echo "1. TypeScript 컴파일..."
npm run build

echo "2. PM2로 백엔드 재시작..."
pm2 restart backend || pm2 start dist/index.js --name backend

echo "3. PM2 상태 확인..."
pm2 status

echo "4. 최근 로그 확인..."
pm2 logs backend --lines 10

echo "백엔드 재시작 완료!"