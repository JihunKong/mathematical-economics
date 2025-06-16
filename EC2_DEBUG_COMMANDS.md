# EC2 서버 디버깅 명령어

## 🔍 500 에러 디버깅

### 1. 백엔드 로그 확인
```bash
# 최근 100줄 로그 확인
sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend

# 실시간 로그 모니터링
sudo docker compose -f docker-compose.prod.yml logs -f backend
```

### 2. 데이터베이스 상태 확인
```bash
# 데이터베이스 연결 테스트
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c "\dt"

# User 테이블 확인
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c "SELECT id, email, role FROM \"User\";"

# Class 테이블 구조 확인
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c "\d \"Class\""
```

### 3. Prisma 스키마 재동기화
```bash
# 스키마 강제 동기화
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --force-reset

# 또는 안전한 동기화
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss
```

### 4. 백엔드 셸 접속하여 직접 테스트
```bash
# 백엔드 컨테이너 접속
sudo docker compose -f docker-compose.prod.yml exec backend sh

# Node.js REPL에서 테스트
node
> const { PrismaClient } = require('@prisma/client')
> const prisma = new PrismaClient()
> await prisma.user.findMany()
> await prisma.class.create({ data: { name: "Test", code: "TEST01", teacherId: "USER_ID_HERE", startDate: new Date() } })
```

### 5. 환경 변수 확인
```bash
# 환경 변수 확인
sudo docker compose -f docker-compose.prod.yml exec backend printenv | grep -E "DATABASE|NODE_ENV"
```

### 6. 헬스체크
```bash
# API 헬스체크
curl http://localhost:5001/api/health
```

## 🛠️ 일반적인 500 에러 원인과 해결책

### 1. 데이터베이스 연결 문제
```bash
# PostgreSQL 재시작
sudo docker compose -f docker-compose.prod.yml restart postgres

# 잠시 대기 후 백엔드 재시작
sleep 10
sudo docker compose -f docker-compose.prod.yml restart backend
```

### 2. Prisma 클라이언트 문제
```bash
# Prisma 클라이언트 재생성
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma generate

# 백엔드 재시작
sudo docker compose -f docker-compose.prod.yml restart backend
```

### 3. 권한 문제
```bash
# 파일 권한 확인
sudo docker compose -f docker-compose.prod.yml exec backend ls -la prisma/
```

### 4. 메모리 부족
```bash
# 컨테이너 리소스 확인
sudo docker stats --no-stream

# 시스템 메모리 확인
free -h
```

## 🔧 빠른 수정 스크립트
```bash
#!/bin/bash
echo "🔧 EC2 Quick Fix Starting..."

# 1. 최신 코드 가져오기
git pull origin main

# 2. 전체 재시작
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d --build

# 3. 데이터베이스 대기
echo "⏳ Waiting for database..."
sleep 15

# 4. 스키마 동기화
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# 5. 초기화
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js

# 6. 로그 확인
echo "📋 Recent logs:"
sudo docker compose -f docker-compose.prod.yml logs --tail=50 backend

echo "✅ Fix completed!"
```

## 📊 로그에서 확인할 사항

1. **Prisma 에러**: `PrismaClientKnownRequestError`, `P2002` (unique constraint)
2. **데이터베이스 연결**: `Can't reach database server`
3. **타입 에러**: `TypeError`, `Cannot read property`
4. **권한 에러**: `Insufficient permissions`
5. **유효성 검증**: `Validation error`

실행 후 로그를 확인하고 구체적인 에러 메시지를 알려주세요!