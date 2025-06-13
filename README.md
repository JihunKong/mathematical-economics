# 경제수학 모의 주식 거래 교육 앱

경제수학 교육을 위한 실시간 모의 주식 거래 플랫폼입니다. 교사는 학생들의 투자 활동을 모니터링하고, 학생들은 실제 주식 시장 데이터를 기반으로 모의 투자를 경험할 수 있습니다.

## 주요 기능

### 학생 기능
- 실시간 주식 가격 조회 및 차트 분석
- 모의 주식 매수/매도
- 포트폴리오 관리 및 수익률 확인
- 리더보드를 통한 순위 확인
- 투자 판단 근거 작성

### 교사 기능
- 클래스 생성 및 관리
- 학생별 투자 활동 모니터링
- 거래 가능 종목 설정
- 학생 보유 현금 설정
- 투자 통계 및 분석

### 실시간 데이터
- 한국투자증권 Open API 연동
- 실시간 주식 가격 업데이트
- 네이버 금융 데이터 스크래핑
- 주식 차트 및 뉴스 제공

## 기술 스택

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- Socket.io
- JWT Authentication
- 한국투자증권 Open API
- Puppeteer (웹 스크래핑)

### Frontend
- React + TypeScript
- Vite
- Redux Toolkit
- Tailwind CSS
- Chart.js
- React Router

## 환경 설정

### 1. 환경 변수 설정

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

필수 환경 변수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `REDIS_URL`: Redis 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `KIS_APP_KEY`: 한국투자증권 앱 키
- `KIS_APP_SECRET`: 한국투자증권 앱 시크릿
- `KIS_ACCOUNT_NUMBER`: 한국투자증권 계좌번호

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

### 2. Docker를 사용한 실행

#### 개발 환경
```bash
# 개발 환경 실행
docker-compose -f docker-compose.dev.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.dev.yml up -d
```

#### 프로덕션 환경
```bash
# 프로덕션 환경 실행
docker-compose -f docker-compose.prod.yml up --build -d
```

### 3. 데이터베이스 마이그레이션

```bash
# 컨테이너 내부에서 실행
docker exec -it economic-math-stock-backend sh
npx prisma migrate deploy
npx prisma db seed
```

## 접속 정보

### 개발 환경
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5433
- Redis: localhost:6380

### 프로덕션 환경
- Frontend: http://localhost:8081
- Backend API: http://localhost:5001
- PostgreSQL: localhost:5433
- Redis: localhost:6380

## 테스트 계정

시드 데이터로 생성되는 테스트 계정:

### 교사 계정
- Email: teacher@example.com
- Password: password123

### 학생 계정
- Email: student1@example.com ~ student3@example.com
- Password: password123

## API 문서

### 인증
- POST /api/auth/register - 회원가입
- POST /api/auth/login - 로그인
- POST /api/auth/logout - 로그아웃
- POST /api/auth/refresh - 토큰 갱신

### 주식
- GET /api/stocks - 주식 목록 조회
- GET /api/stocks/:symbol - 주식 상세 정보
- GET /api/real-stocks/:symbol/price - 실시간 가격
- GET /api/real-stocks/:symbol/chart - 차트 데이터
- GET /api/real-stocks/:symbol/news - 관련 뉴스

### 거래
- POST /api/trading/buy - 주식 매수
- POST /api/trading/sell - 주식 매도
- GET /api/trading/history - 거래 내역

### 포트폴리오
- GET /api/portfolio - 포트폴리오 조회
- GET /api/portfolio/holdings - 보유 종목
- GET /api/portfolio/performance - 수익률 분석

## 개발 가이드

### 새로운 기능 추가
1. Prisma 스키마 수정 (`backend/prisma/schema.prisma`)
2. 마이그레이션 생성: `npx prisma migrate dev`
3. 서비스 로직 구현 (`backend/src/services/`)
4. API 엔드포인트 추가 (`backend/src/routes/`)
5. 프론트엔드 컴포넌트 구현 (`frontend/src/`)

### 코드 스타일
- ESLint와 Prettier 설정 준수
- TypeScript strict mode 사용
- 함수형 컴포넌트와 React Hooks 사용

## 문제 해결

### Docker 관련
- 포트 충돌 시 docker-compose 파일에서 포트 변경
- 볼륨 초기화: `docker-compose down -v`

### 데이터베이스 관련
- 마이그레이션 오류: `npx prisma migrate reset`
- 연결 오류: DATABASE_URL 환경 변수 확인

### 한국투자증권 API
- 인증 오류: APP_KEY, APP_SECRET 확인
- 모의투자 모드: KIS_IS_PAPER=true 설정

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.