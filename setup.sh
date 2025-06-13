#!/bin/bash

echo "🚀 경제수학 모의 주식 거래 앱 환경 설정"
echo "======================================"

# .env 파일 복사
echo "📄 .env 파일 복사 중..."

# Backend .env 설정 (개발용)
if [ ! -f ./backend/.env ]; then
    cp ./backend/.env.example ./backend/.env
    echo "✅ Backend .env (개발용) 파일이 생성되었습니다"
else
    echo "ℹ️  Backend .env (개발용) 파일이 이미 존재합니다"
fi

# Backend .env.production 설정 (프로덕션용)
if [ ! -f ./backend/.env.production ]; then
    cp ./backend/.env.example ./backend/.env.production
    # 프로덕션 환경에 맞게 DATABASE_URL과 REDIS_URL 수정
    sed -i.bak 's|localhost:5433|postgres:5432|g' ./backend/.env.production
    sed -i.bak 's|localhost:6380|redis:6379|g' ./backend/.env.production
    sed -i.bak 's|NODE_ENV=development|NODE_ENV=production|g' ./backend/.env.production
    sed -i.bak 's|http://localhost:5173|http://localhost:8081|g' ./backend/.env.production
    rm ./backend/.env.production.bak 2>/dev/null || true
    echo "✅ Backend .env.production (프로덕션용) 파일이 생성되었습니다"
else
    echo "ℹ️  Backend .env.production (프로덕션용) 파일이 이미 존재합니다"
fi

# Frontend .env 설정 (개발용)
if [ ! -f ./frontend/.env ]; then
    cp ./frontend/.env.example ./frontend/.env
    echo "✅ Frontend .env (개발용) 파일이 생성되었습니다"
else
    echo "ℹ️  Frontend .env (개발용) 파일이 이미 존재합니다"
fi

# Frontend .env.production 설정 (프로덕션용)  
if [ ! -f ./frontend/.env.production ]; then
    cp ./frontend/.env.example ./frontend/.env.production
    # 프로덕션 환경에 맞게 API URL 수정
    sed -i.bak 's|localhost:5000|localhost:5001|g' ./frontend/.env.production
    rm ./frontend/.env.production.bak 2>/dev/null || true
    echo "✅ Frontend .env.production (프로덕션용) 파일이 생성되었습니다"
else
    echo "ℹ️  Frontend .env.production (프로덕션용) 파일이 이미 존재합니다"
fi

echo ""
echo "🔧 다음 단계:"
echo "1. 환경 변수 설정 - 한국투자증권 API 키 설정"
echo "   개발용: backend/.env"
echo "   프로덕션용: backend/.env.production"
echo "   필수 설정:"
echo "   - KIS_APP_KEY: 한국투자증권 앱 키"
echo "   - KIS_APP_SECRET: 한국투자증권 앱 시크릿"
echo "   - KIS_ACCOUNT_NUMBER: 계좌번호"
echo "   - JWT_SECRET: 보안 키 (실제 운영시 변경 필요)"
echo ""
echo "2. 개발 환경 실행:"
echo "   docker-compose -f docker-compose.dev.yml up --build"
echo ""
echo "3. 프로덕션 환경 실행:"
echo "   docker-compose -f docker-compose.prod.yml up --build -d"
echo ""
echo "4. 데이터베이스 마이그레이션 (컨테이너 실행 후):"
echo "   docker exec -it economic-math-stock-backend-dev sh"
echo "   npx prisma migrate deploy"
echo "   npx prisma db seed"
echo ""
echo "🌐 접속 주소:"
echo "- 개발 환경: http://localhost:5173"
echo "- 프로덕션 환경: http://localhost:8081"
echo ""
echo "👨‍🏫 테스트 계정:"
echo "- 교사: teacher@example.com / password123"
echo "- 학생: student1@example.com / password123"