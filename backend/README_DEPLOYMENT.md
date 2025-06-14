# 배포 가이드 - 자동 초기화 시스템

이 문서는 배포 후 추가 작업 없이 앱이 즉시 작동하도록 구현된 자동 초기화 시스템에 대해 설명합니다.

## 🚀 빠른 시작

```bash
# 1. 환경변수 설정 (.env 파일 생성)
cp .env.production.example .env

# 2. 필요한 값 설정 (최소한 아래 값은 설정 필요)
# - JWT_SECRET
# - DB_PASSWORD
# - ADMIN_EMAIL (원하는 관리자 이메일)
# - ADMIN_PASSWORD (안전한 비밀번호)

# 3. Docker Compose로 실행
docker compose -f docker-compose.prod.yml up -d

# 4. 시스템 상태 확인
curl http://localhost/api/health
```

## 📦 자동 초기화 기능

### 1. 데이터베이스 마이그레이션
- Docker 컨테이너 시작 시 자동으로 Prisma 마이그레이션 실행
- 데이터베이스 스키마가 최신 상태로 유지됨

### 2. 관리자 계정 생성
- 환경변수에 설정된 `ADMIN_EMAIL`과 `ADMIN_PASSWORD`로 관리자 계정 자동 생성
- 기본값: `admin@example.com` / `Admin123!@#`
- **보안 주의**: 프로덕션에서는 반드시 변경 필요

### 3. 초기 주식 데이터
- 10개의 기본 주식 데이터 자동 생성 (애플, 구글, 마이크로소프트 등)
- `AUTO_CREATE_STOCKS=false`로 설정하면 비활성화 가능

### 4. 포트폴리오 자동 생성
- 모든 사용자에게 자동으로 포트폴리오 생성
- 교사: 1,000만원 초기 자금
- 학생: 100만원 초기 자금

### 5. 데모 학생 계정 (선택사항)
- `CREATE_DEMO_STUDENTS=true`로 설정 시 3개의 데모 학생 계정 생성
- 테스트 목적으로 유용

## 🔧 환경변수 설정

### 필수 환경변수
```env
# 보안 관련 (반드시 변경)
JWT_SECRET=your_secure_jwt_secret_here
DB_PASSWORD=your_secure_database_password

# 관리자 계정 (원하는 값으로 변경)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!

# 외부 API 키 (실제 값 필요)
KIS_APP_KEY=your_app_key
KIS_APP_SECRET=your_app_secret
```

### 선택적 환경변수
```env
# 초기화 관련
AUTO_CREATE_STOCKS=true  # 초기 주식 데이터 생성
CREATE_DEMO_STUDENTS=false  # 데모 학생 계정 생성

# 서버 설정
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

## 🏥 헬스체크 엔드포인트

### `/api/health` - 전체 시스템 상태
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "services": {
    "database": {
      "connected": true,
      "userCount": 4,
      "stockCount": 10,
      "portfolioCount": 4
    },
    "redis": {
      "connected": true
    },
    "initialization": {
      "hasAdmin": true,
      "hasStocks": true,
      "hasPortfolios": true,
      "isReady": true
    }
  }
}
```

### `/api/health/ready` - 준비 상태 확인
- 시스템이 요청을 처리할 준비가 되었는지 확인
- Docker 헬스체크에서 사용

### `/api/health/live` - 생존 확인
- 서버가 실행 중인지 간단히 확인

## 🐳 Docker Compose 개선사항

1. **헬스체크 강화**
   - 각 서비스에 헬스체크 구성
   - 의존성 있는 서비스가 준비될 때까지 대기

2. **자동 재시작**
   - 모든 서비스에 `restart: always` 설정
   - 오류 발생 시 자동 복구

3. **초기화 대기**
   - Backend 서비스는 초기화 완료 후 준비 상태로 전환
   - Frontend는 Backend가 준비될 때까지 대기

## 🔍 문제 해결

### 초기화 실패 시
```bash
# 로그 확인
docker logs math-econ-backend

# 수동으로 초기화 스크립트 실행
docker exec -it math-econ-backend node scripts/initialize.js

# 데이터베이스 상태 확인
docker exec -it math-econ-postgres psql -U mathuser -d mathematical_economics -c "\dt"
```

### 포트 충돌
```bash
# 사용 중인 포트 확인
sudo lsof -i :80
sudo lsof -i :5432
sudo lsof -i :6379

# 필요시 docker-compose.prod.yml에서 포트 변경
```

### 권한 문제
```bash
# Docker 볼륨 권한 수정
sudo chown -R 1001:1001 ./backend/logs
sudo chown -R 1001:1001 ./backend/public
```

## 📊 초기 데이터

### 생성되는 주식 목록
1. AAPL - Apple Inc.
2. GOOGL - Alphabet Inc.
3. MSFT - Microsoft Corporation
4. AMZN - Amazon.com Inc.
5. TSLA - Tesla Inc.
6. META - Meta Platforms Inc.
7. NVDA - NVIDIA Corporation
8. JPM - JPMorgan Chase & Co.
9. V - Visa Inc.
10. JNJ - Johnson & Johnson

### 데모 계정 (CREATE_DEMO_STUDENTS=true인 경우)
- student1@example.com (비밀번호: Student123!)
- student2@example.com (비밀번호: Student123!)
- student3@example.com (비밀번호: Student123!)

## 🔐 보안 권장사항

1. **프로덕션 배포 전 체크리스트**
   - [ ] 모든 기본 비밀번호 변경
   - [ ] JWT_SECRET을 안전한 값으로 변경
   - [ ] CORS_ORIGIN을 실제 도메인으로 설정
   - [ ] SSL 인증서 설정
   - [ ] 방화벽 규칙 구성

2. **정기 백업**
   - 자동 백업 서비스가 포함되어 있음
   - 7일간의 백업 보관
   - `./backend/backup` 디렉토리에 저장

3. **모니터링**
   - 헬스체크 엔드포인트를 모니터링 도구와 연동
   - 로그 파일 정기 확인
   - 리소스 사용량 모니터링

이제 `docker compose up` 명령 하나로 전체 시스템이 자동으로 초기화되고 실행됩니다!