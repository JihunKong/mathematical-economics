# Claude Code 개발 지침서
## 경제수학 모의주식 투자 앱 개발 가이드

이 문서는 Claude Code를 활용하여 경제수학 모의주식 투자 앱을 효율적으로 개발하기 위한 상세한 지침을 제공합니다.

## 🎯 프로젝트 목표 요약

**앱 이름**: 경제수학 모의주식 투자 앱  
**목적**: 고등학생 대상 교육용 모의주식 투자 플랫폼  
**핵심 기능**: 한국투자증권 API 연동, 모의투자, 학습 분석, 교사 관리 시스템

## 🛠️ Claude Code 프로젝트 초기 설정

### 1. 프로젝트 생성 명령어
```bash
# 프로젝트 루트 디렉토리 생성
mkdir economic-math-stock-app
cd economic-math-stock-app

# 모노레포 구조 초기화
npm init -y
```

### 2. Claude Code에게 전달할 초기 컨텍스트

#### 프로젝트 구조 요청
```
Claude Code에게 요청할 내용:

"다음 구조로 모노레포 프로젝트를 생성해주세요:

1. 루트 디렉토리: economic-math-stock-app
2. 서브 프로젝트:
   - frontend/ (React + TypeScript + Vite)
   - backend/ (Node.js + Express + TypeScript)
   - shared/ (공통 타입 및 유틸리티)

각 서브 프로젝트에 package.json과 기본 설정 파일들을 생성하고,
루트에서 모든 서브 프로젝트를 관리할 수 있는 스크립트를 추가해주세요."
```

## 📋 단계별 개발 가이드

### Phase 1: 기본 구조 및 설정

#### 1.1 백엔드 기본 구조 생성
```
Claude Code 명령어:

"backend 디렉토리에서 다음을 수행해주세요:

1. Express + TypeScript 프로젝트 초기화
2. 필수 의존성 설치:
   - express, cors, helmet, morgan
   - @types/express, @types/cors, @types/node
   - typescript, ts-node, nodemon
   - prisma, @prisma/client
   - jsonwebtoken, bcryptjs
   - joi (validation)
   - redis, ioredis
   - socket.io

3. 기본 폴더 구조 생성:
   - src/controllers/
   - src/services/
   - src/middleware/
   - src/routes/
   - src/types/
   - src/utils/
   - src/config/

4. 기본 설정 파일 생성:
   - tsconfig.json
   - nodemon.json
   - .env.example"
```

#### 1.2 프론트엔드 기본 구조 생성
```
Claude Code 명령어:

"frontend 디렉토리에서 다음을 수행해주세요:

1. Vite + React + TypeScript 프로젝트 생성
2. 필수 의존성 설치:
   - react, react-dom
   - @types/react, @types/react-dom
   - react-router-dom
   - @reduxjs/toolkit, react-redux
   - axios
   - tailwindcss, autoprefixer, postcss
   - chart.js, react-chartjs-2
   - socket.io-client
   - react-hook-form
   - @headlessui/react, @heroicons/react

3. Tailwind CSS 설정
4. 기본 폴더 구조 생성:
   - src/components/
   - src/pages/
   - src/hooks/
   - src/services/
   - src/store/
   - src/types/
   - src/utils/"
```

### Phase 2: 데이터베이스 및 API 설계

#### 2.1 Prisma 스키마 생성
```
Claude Code 명령어:

"backend/prisma/schema.prisma 파일을 생성하고 다음 모델들을 정의해주세요:

1. User 모델:
   - id (String, @id @default(cuid()))
   - email (String, @unique)
   - password (String)
   - name (String)
   - role (Role enum: STUDENT, TEACHER)
   - grade (Int?)
   - class (String?)
   - createdAt, updatedAt

2. Portfolio 모델:
   - id (String, @id @default(cuid()))
   - userId (String, User와 관계)
   - cashBalance (Decimal)
   - totalValue (Decimal)
   - createdAt, updatedAt

3. Stock 모델:
   - id (String, @id @default(cuid()))
   - symbol (String, @unique)
   - name (String)
   - market (String)
   - sector (String?)
   - createdAt, updatedAt

4. Transaction 모델:
   - id (String, @id @default(cuid()))
   - userId (String, User와 관계)
   - stockId (String, Stock과 관계)
   - type (TransactionType enum: BUY, SELL)
   - quantity (Int)
   - price (Decimal)
   - totalAmount (Decimal)
   - reason (String)
   - newsReference (String?)
   - createdAt

5. Holdings 모델:
   - id (String, @id @default(cuid()))
   - userId (String, User와 관계)
   - stockId (String, Stock과 관계)
   - quantity (Int)
   - averagePrice (Decimal)
   - createdAt, updatedAt

관계 설정과 인덱스도 적절히 추가해주세요."
```

#### 2.2 기본 API 라우트 구조 생성
```
Claude Code 명령어:

"backend/src/routes/ 디렉토리에 다음 라우트 파일들을 생성해주세요:

1. auth.ts - 인증 관련 라우트
   - POST /login
   - POST /register
   - POST /logout
   - GET /profile

2. stocks.ts - 주식 데이터 라우트
   - GET / (주식 목록)
   - GET /:symbol (종목 상세)
   - GET /:symbol/chart (차트 데이터)
   - GET /:symbol/news (관련 뉴스)

3. trading.ts - 거래 라우트
   - POST /buy (매수)
   - POST /sell (매도)
   - GET /history (거래 내역)
   - GET /daily-limit/:symbol (일일 거래 제한 확인)

4. portfolio.ts - 포트폴리오 라우트
   - GET / (포트폴리오 조회)
   - GET /performance (수익률 분석)
   - GET /holdings (보유 종목)

5. leaderboard.ts - 리더보드 라우트
   - GET / (수익률 순위)
   - GET /class/:classId (반별 순위)

각 라우트에 기본 핸들러와 미들웨어를 추가해주세요."
```

### Phase 3: 핵심 서비스 구현

#### 3.1 한국투자증권 API 서비스 구현
```
Claude Code 명령어:

"backend/src/services/kisApiService.ts 파일을 생성하고 다음 기능을 구현해주세요:

1. KIS API 인증 토큰 관리
2. 실시간 주식 가격 조회
3. 주식 기본 정보 조회
4. 차트 데이터 조회 (일/주/월/년)
5. 관련 뉴스 조회
6. API 호출 제한 관리 (rate limiting)
7. 에러 핸들링 및 재시도 로직

TypeScript 인터페이스도 함께 정의해주세요:
- KISTokenResponse
- StockPrice
- StockInfo
- ChartData
- NewsItem

환경변수를 사용한 설정 관리도 포함해주세요."
```

#### 3.2 거래 로직 서비스 구현
```
Claude Code 명령어:

"backend/src/services/tradingService.ts 파일을 생성하고 다음 기능을 구현해주세요:

1. 매수 로직:
   - 자금 충분성 검증
   - 일일 거래 제한 확인
   - 현재가 조회 및 거래 실행
   - 포트폴리오 업데이트

2. 매도 로직:
   - 보유 수량 검증
   - 일일 거래 제한 확인
   - 현재가 조회 및 거래 실행
   - 포트폴리오 업데이트

3. 거래 제한 검증:
   - 종목별 일일 거래 횟수 확인
   - 시장 운영 시간 확인
   - 거래 가능 상태 확인

4. 수수료 계산 및 적용
5. 거래 로그 기록
6. 트랜잭션 처리 (원자성 보장)

Prisma를 사용한 데이터베이스 작업도 포함해주세요."
```

#### 3.3 포트폴리오 관리 서비스 구현
```
Claude Code 명령어:

"backend/src/services/portfolioService.ts 파일을 생성하고 다음 기능을 구현해주세요:

1. 포트폴리오 가치 계산:
   - 현금 + 보유 주식 평가액
   - 실시간 가격 반영
   - 수익률 계산

2. 보유 종목 관리:
   - 평균 단가 계산
   - 보유 수량 관리
   - 손익 계산

3. 성과 분석:
   - 일별/월별 수익률
   - 종목별 손익
   - 포트폴리오 분산도

4. 리더보드 데이터 생성:
   - 학급별/전체 순위
   - 수익률 계산
   - 캐싱 로직

Redis를 활용한 캐싱도 구현해주세요."
```

### Phase 4: 프론트엔드 핵심 컴포넌트

#### 4.1 공통 컴포넌트 생성
```
Claude Code 명령어:

"frontend/src/components/common/ 디렉토리에 다음 컴포넌트들을 생성해주세요:

1. Layout.tsx - 전체 레이아웃 컴포넌트
2. Header.tsx - 상단 네비게이션
3. Sidebar.tsx - 사이드바 메뉴
4. LoadingSpinner.tsx - 로딩 인디케이터
5. Modal.tsx - 재사용 가능한 모달
6. Button.tsx - 공통 버튼 컴포넌트
7. Input.tsx - 공통 입력 컴포넌트
8. Card.tsx - 카드 레이아웃 컴포넌트

각 컴포넌트에 TypeScript Props 인터페이스와 Tailwind CSS 스타일링을 적용해주세요.
반응형 디자인도 고려해주세요."
```

#### 4.2 차트 컴포넌트 생성
```
Claude Code 명령어:

"frontend/src/components/charts/ 디렉토리에 다음 차트 컴포넌트들을 생성해주세요:

1. CandlestickChart.tsx - 캔들스틱 차트
   - Chart.js 또는 Recharts 사용
   - 시간대별 데이터 표시 (1일, 1주, 1개월, 1년)
   - 거래량 차트 포함
   - 확대/축소 기능

2. LineChart.tsx - 라인 차트
   - 포트폴리오 가치 변화
   - 수익률 추이

3. PieChart.tsx - 파이 차트
   - 포트폴리오 구성 비율
   - 섹터별 분산

4. BarChart.tsx - 바 차트
   - 종목별 손익
   - 거래 통계

각 차트에 반응형 디자인과 인터랙티브 기능을 추가해주세요."
```

#### 4.3 거래 관련 컴포넌트 생성
```
Claude Code 명령어:

"frontend/src/components/trading/ 디렉토리에 다음 컴포넌트들을 생성해주세요:

1. StockCard.tsx - 주식 정보 카드
   - 종목명, 현재가, 변동률
   - 간단한 차트 미리보기
   - 매수/매도 버튼

2. BuyModal.tsx - 매수 모달
   - 현재가 표시
   - 수량 입력
   - 거래 근거 입력 (필수)
   - 참조 뉴스 선택
   - 예상 거래 금액 계산

3. SellModal.tsx - 매도 모달
   - 보유 수량 표시
   - 매도 수량 입력
   - 거래 근거 입력 (필수)
   - 예상 손익 계산

4. TransactionHistory.tsx - 거래 내역
   - 거래 일시, 종목, 수량, 가격
   - 거래 근거 표시
   - 필터링 및 정렬 기능

5. OrderBook.tsx - 호가창 (선택사항)

React Hook Form을 사용한 폼 검증도 구현해주세요."
```

### Phase 5: 상태 관리 및 API 연동

#### 5.1 Redux 스토어 설정
```
Claude Code 명령어:

"frontend/src/store/ 디렉토리에 Redux Toolkit 기반 상태 관리를 구현해주세요:

1. store.ts - 스토어 설정
2. authSlice.ts - 인증 상태 관리
   - user, isAuthenticated, token
   - login, logout, updateProfile actions

3. stockSlice.ts - 주식 데이터 상태 관리
   - stocks, currentStock, priceUpdates
   - fetchStocks, selectStock, updatePrice actions

4. portfolioSlice.ts - 포트폴리오 상태 관리
   - portfolio, holdings, performance
   - fetchPortfolio, updateHoldings actions

5. tradingSlice.ts - 거래 상태 관리
   - transactions, pendingTrades
   - executeTrade, fetchTransactions actions

6. uiSlice.ts - UI 상태 관리
   - modals, loading, notifications

RTK Query를 활용한 API 연동도 구현해주세요."
```

#### 5.2 API 서비스 레이어 구현
```
Claude Code 명령어:

"frontend/src/services/ 디렉토리에 API 서비스들을 구현해주세요:

1. api.ts - Axios 기본 설정
   - 베이스 URL 설정
   - 인터셉터 (토큰 자동 추가, 에러 처리)
   - 타임아웃 설정

2. authService.ts - 인증 API
   - login, register, logout
   - 토큰 갱신 로직

3. stockService.ts - 주식 데이터 API
   - 주식 목록, 상세 정보, 차트 데이터
   - 뉴스 조회

4. tradingService.ts - 거래 API
   - 매수/매도 주문
   - 거래 내역 조회

5. portfolioService.ts - 포트폴리오 API
   - 포트폴리오 조회
   - 성과 분석 데이터

6. websocketService.ts - WebSocket 연결
   - 실시간 가격 업데이트
   - 연결 관리 및 재연결 로직

TypeScript 타입 정의도 함께 구현해주세요."
```

### Phase 6: 페이지 컴포넌트 및 라우팅

#### 6.1 주요 페이지 컴포넌트 생성
```
Claude Code 명령어:

"frontend/src/pages/ 디렉토리에 다음 페이지 컴포넌트들을 생성해주세요:

1. HomePage.tsx - 메인 페이지
   - 앱 소개
   - 주요 기능 안내
   - 로그인/회원가입 링크

2. LoginPage.tsx - 로그인 페이지
   - 이메일/패스워드 폼
   - 폼 검증
   - 에러 메시지 표시

3. DashboardPage.tsx - 대시보드
   - 포트폴리오 요약
   - 보유 종목 현황
   - 최근 거래 내역
   - 수익률 차트

4. TradingPage.tsx - 거래 페이지
   - 주식 목록
   - 검색 및 필터링
   - 실시간 가격 업데이트
   - 매수/매도 기능

5. PortfolioPage.tsx - 포트폴리오 페이지
   - 상세 보유 현황
   - 성과 분석
   - 거래 히스토리

6. LeaderboardPage.tsx - 리더보드 페이지
   - 수익률 순위
   - 필터링 (전체/반별)

7. StockDetailPage.tsx - 종목 상세 페이지
   - 상세 차트
   - 기업 정보
   - 관련 뉴스
   - 매수/매도 기능

각 페이지에 로딩 상태와 에러 처리를 포함해주세요."
```

#### 6.2 라우팅 설정
```
Claude Code 명령어:

"frontend/src/App.tsx에서 React Router를 설정해주세요:

1. 라우트 구조:
   - / (HomePage)
   - /login (LoginPage)
   - /dashboard (DashboardPage) - 인증 필요
   - /trading (TradingPage) - 인증 필요
   - /portfolio (PortfolioPage) - 인증 필요
   - /leaderboard (LeaderboardPage) - 인증 필요
   - /stocks/:symbol (StockDetailPage) - 인증 필요
   - /teacher (TeacherDashboard) - 교사 권한 필요

2. 보호된 라우트 컴포넌트 생성
3. 권한별 라우트 가드 구현
4. 404 페이지 처리
5. 리다이렉트 로직 구현

Layout 컴포넌트로 공통 UI를 감싸주세요."
```

### Phase 7: 실시간 기능 및 최적화

#### 7.1 WebSocket 연동
```
Claude Code 명령어:

"실시간 주식 가격 업데이트를 위한 WebSocket 연동을 구현해주세요:

1. backend/src/websocket.ts:
   - Socket.io 서버 설정
   - 클라이언트 연결 관리
   - 가격 업데이트 브로드캐스트
   - 룸 기반 구독 관리

2. frontend에서 WebSocket 클라이언트:
   - 자동 연결/재연결
   - 가격 업데이트 수신
   - 스토어 상태 업데이트
   - 연결 상태 표시

3. 가격 업데이트 로직:
   - KIS API에서 실시간 데이터 수신
   - 변경된 가격만 브로드캐스트
   - 클라이언트별 구독 종목 관리

에러 처리와 성능 최적화도 포함해주세요."
```

#### 7.2 성능 최적화 구현
```
Claude Code 명령어:

"다음 성능 최적화를 구현해주세요:

1. Frontend 최적화:
   - React.memo로 컴포넌트 메모이제이션
   - useMemo, useCallback 훅 최적화
   - 가상 스크롤링 (긴 목록용)
   - 이미지 lazy loading
   - 코드 스플리팅

2. Backend 최적화:
   - Redis 캐싱 구현
   - 데이터베이스 쿼리 최적화
   - API 응답 압축
   - 커넥션 풀링

3. 캐싱 전략:
   - 주식 가격: 1분 캐시
   - 뉴스: 30분 캐시
   - 리더보드: 1시간 캐시
   - 정적 데이터: 24시간 캐시

4. 에러 바운더리 및 폴백 UI 구현"
```

### Phase 8: 교육 특화 기능

#### 8.1 교사 대시보드 구현
```
Claude Code 명령어:

"교사용 대시보드를 구현해주세요:

1. TeacherDashboard.tsx:
   - 학급별 학생 현황
   - 전체 거래 통계
   - 수익률 분포 차트
   - 활발한 거래자 목록

2. StudentAnalytics.tsx:
   - 개별 학생 거래 패턴 분석
   - 거래 근거 검토
   - 학습 진도 추적

3. ClassManagement.tsx:
   - 학급 생성/관리
   - 학생 초대 및 관리
   - 시뮬레이션 설정

4. ReportGeneration.tsx:
   - PDF 보고서 생성
   - Excel 데이터 내보내기
   - 학습 분석 리포트

권한 체크와 데이터 필터링도 구현해주세요."
```

#### 8.2 학습 분석 기능
```
Claude Code 명령어:

"학습 분석 및 리포팅 기능을 구현해주세요:

1. backend/src/services/analyticsService.ts:
   - 거래 패턴 분석
   - 수익률 통계 계산
   - 학습 진도 추적
   - 리스크 분석

2. 거래 근거 분석:
   - 텍스트 분석 (키워드 추출)
   - 뉴스 참조 패턴
   - 의사결정 품질 평가

3. 학습 리포트 생성:
   - 개인별 성과 리포트
   - 반별 비교 분석
   - 추천 학습 방향

4. 데이터 시각화:
   - 학습 진도 차트
   - 거래 패턴 히트맵
   - 성과 트렌드 그래프

PDF 생성과 이메일 전송 기능도 포함해주세요."
```

## 🧪 테스트 및 배포 가이드

### Phase 9: 테스트 구현
```
Claude Code 명령어:

"테스트 스위트를 구현해주세요:

1. Backend 테스트:
   - Jest 설정
   - 단위 테스트 (서비스, 유틸리티)
   - 통합 테스트 (API 엔드포인트)
   - 테스트 데이터베이스 설정

2. Frontend 테스트:
   - Vitest 설정
   - 컴포넌트 테스트 (@testing-library/react)
   - 커스텀 훅 테스트
   - API 모킹

3. E2E 테스트:
   - Playwright 설정
   - 주요 사용자 플로우 테스트
   - 거래 시나리오 테스트

4. 테스트 커버리지 설정:
   - 최소 80% 커버리지 목표
   - CI/CD 파이프라인 연동"
```

### Phase 10: Docker화 및 배포
```
Claude Code 명령어:

"Docker 기반 배포 환경을 구성해주세요:

1. Dockerfile 생성:
   - Frontend용 멀티스테이지 빌드
   - Backend용 Node.js 이미지
   - 최적화된 이미지 크기

2. docker-compose.yml 설정:
   - 애플리케이션 컨테이너
   - PostgreSQL 컨테이너
   - Redis 컨테이너
   - Nginx 프록시

3. 환경별 설정:
   - development.yml
   - staging.yml
   - production.yml

4. 배포 스크립트:
   - 자동화된 빌드 및 배포
   - 헬스체크 구현
   - 로그 수집 설정

보안 설정과 성능 최적화도 포함해주세요."
```

## 🔧 개발 팁 및 모범 사례

### Code Quality Guidelines
```
Claude Code에게 강조할 사항:

1. TypeScript 엄격 모드 사용
2. ESLint + Prettier 설정 준수
3. 의미있는 변수명과 함수명 사용
4. 컴포넌트당 200줄 이하 유지
5. API 응답 타입 정의 필수
6. 에러 처리 및 로깅 구현
7. 접근성(a11y) 고려
8. SEO 최적화 (메타태그 등)
```

### Git Workflow
```
권장하는 브랜치 전략:

main - 프로덕션 브랜치
develop - 개발 브랜치
feature/* - 기능 개발 브랜치
hotfix/* - 긴급 수정 브랜치

커밋 메시지 컨벤션:
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 등
```

### Environment Variables
```
필수 환경변수 목록:

Backend:
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- KIS_APP_KEY
- KIS_APP_SECRET
- KIS_BASE_URL
- PORT

Frontend:
- VITE_API_URL
- VITE_WS_URL
- VITE_APP_NAME
```

## 🚀 Claude Code 실행 순서

1. **프로젝트 초기 설정** (Phase 1)
2. **데이터베이스 스키마** (Phase 2.1)
3. **백엔드 기본 구조** (Phase 2.2)
4. **KIS API 서비스** (Phase 3.1)
5. **거래 로직 구현** (Phase 3.2)
6. **프론트엔드 기본 구조** (Phase 4)
7. **상태 관리 및 API 연동** (Phase 5)
8. **페이지 컴포넌트** (Phase 6)
9. **실시간 기능** (Phase 7)
10. **교육 특화 기능** (Phase 8)
11. **테스트 및 배포** (Phase 9-10)

각 단계를 순차적으로 진행하되, 필요에 따라 병렬로 개발할 수 있는 부분은 동시에 진행하세요.

## 📞 문제 해결 가이드

### 자주 발생하는 이슈들

1. **CORS 에러**: backend에서 적절한 CORS 설정 확인
2. **API 호출 제한**: 캐싱 및 요청 제한 로직 구현
3. **실시간 연결 끊김**: WebSocket 재연결 로직 강화
4. **메모리 누수**: React 컴포넌트 cleanup 확인
5. **타입 에러**: 엄격한 TypeScript 타입 정의

### Claude Code 디버깅 팁

1. 에러 메시지를 정확히 제공
2. 관련 코드 컨텍스트 함께 전달
3. 예상되는 동작과 실제 동작 설명
4. 환경 정보 (Node.js 버전, 브라우저 등) 포함

이 가이드를 따라 단계적으로 개발하면, 견고하고 확장 가능한 교육용 모의주식 투자 앱을 완성할 수 있습니다.