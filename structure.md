# 프로젝트 구조 상세 가이드

## 📁 전체 디렉토리 구조

```
economic-math-stock-app/
├── 📂 frontend/                          # React 클라이언트 애플리케이션
│   ├── 📂 public/
│   │   ├── index.html                    # HTML 템플릿
│   │   ├── favicon.ico                   # 파비콘
│   │   └── manifest.json                 # PWA 매니페스트
│   ├── 📂 src/
│   │   ├── 📂 components/                # 재사용 가능한 UI 컴포넌트
│   │   │   ├── 📂 common/                # 공통 컴포넌트
│   │   │   │   ├── Header.tsx            # 상단 네비게이션
│   │   │   │   ├── Sidebar.tsx           # 사이드바 메뉴
│   │   │   │   ├── LoadingSpinner.tsx    # 로딩 컴포넌트
│   │   │   │   ├── Modal.tsx             # 모달 컴포넌트
│   │   │   │   └── Button.tsx            # 공통 버튼
│   │   │   ├── 📂 charts/                # 차트 관련 컴포넌트
│   │   │   │   ├── CandlestickChart.tsx  # 캔들스틱 차트
│   │   │   │   ├── LineChart.tsx         # 라인 차트
│   │   │   │   └── VolumeChart.tsx       # 거래량 차트
│   │   │   ├── 📂 trading/               # 거래 관련 컴포넌트
│   │   │   │   ├── BuyModal.tsx          # 매수 모달
│   │   │   │   ├── SellModal.tsx         # 매도 모달
│   │   │   │   ├── OrderForm.tsx         # 주문 폼
│   │   │   │   └── TransactionHistory.tsx # 거래 내역
│   │   │   ├── 📂 portfolio/             # 포트폴리오 컴포넌트
│   │   │   │   ├── PortfolioSummary.tsx  # 포트폴리오 요약
│   │   │   │   ├── HoldingsList.tsx      # 보유 종목 리스트
│   │   │   │   └── PerformanceChart.tsx  # 수익률 차트
│   │   │   └── 📂 forms/                 # 폼 컴포넌트
│   │   │       ├── LoginForm.tsx         # 로그인 폼
│   │   │       ├── RegisterForm.tsx      # 회원가입 폼
│   │   │       └── TradeReasonForm.tsx   # 거래 근거 입력 폼
│   │   ├── 📂 pages/                     # 페이지 컴포넌트
│   │   │   ├── HomePage.tsx              # 메인 페이지
│   │   │   ├── LoginPage.tsx             # 로그인 페이지
│   │   │   ├── DashboardPage.tsx         # 대시보드
│   │   │   ├── TradingPage.tsx           # 거래 페이지
│   │   │   ├── PortfolioPage.tsx         # 포트폴리오 페이지
│   │   │   ├── LeaderboardPage.tsx       # 리더보드 페이지
│   │   │   ├── StockDetailPage.tsx       # 종목 상세 페이지
│   │   │   └── TeacherDashboard.tsx      # 교사용 대시보드
│   │   ├── 📂 hooks/                     # 커스텀 React 훅
│   │   │   ├── useAuth.ts                # 인증 관련 훅
│   │   │   ├── useStockData.ts           # 주식 데이터 훅
│   │   │   ├── usePortfolio.ts           # 포트폴리오 훅
│   │   │   ├── useWebSocket.ts           # WebSocket 훅
│   │   │   └── useLocalStorage.ts        # 로컬 스토리지 훅
│   │   ├── 📂 services/                  # API 서비스
│   │   │   ├── api.ts                    # API 기본 설정
│   │   │   ├── authService.ts            # 인증 서비스
│   │   │   ├── stockService.ts           # 주식 데이터 서비스
│   │   │   ├── tradingService.ts         # 거래 서비스
│   │   │   ├── portfolioService.ts       # 포트폴리오 서비스
│   │   │   └── websocketService.ts       # WebSocket 서비스
│   │   ├── 📂 store/                     # 상태 관리
│   │   │   ├── index.ts                  # 스토어 설정
│   │   │   ├── authSlice.ts              # 인증 상태
│   │   │   ├── stockSlice.ts             # 주식 데이터 상태
│   │   │   ├── portfolioSlice.ts         # 포트폴리오 상태
│   │   │   └── uiSlice.ts                # UI 상태
│   │   ├── 📂 types/                     # TypeScript 타입 정의
│   │   │   ├── auth.types.ts             # 인증 관련 타입
│   │   │   ├── stock.types.ts            # 주식 관련 타입
│   │   │   ├── trading.types.ts          # 거래 관련 타입
│   │   │   ├── portfolio.types.ts        # 포트폴리오 타입
│   │   │   └── api.types.ts              # API 응답 타입
│   │   ├── 📂 utils/                     # 유틸리티 함수
│   │   │   ├── formatters.ts             # 데이터 포맷팅
│   │   │   ├── validators.ts             # 입력 검증
│   │   │   ├── calculations.ts           # 수익률 계산
│   │   │   ├── constants.ts              # 상수 정의
│   │   │   └── helpers.ts                # 도우미 함수
│   │   ├── 📂 styles/                    # 스타일 파일
│   │   │   ├── globals.css               # 전역 스타일
│   │   │   ├── components.css            # 컴포넌트 스타일
│   │   │   └── utilities.css             # 유틸리티 클래스
│   │   ├── App.tsx                       # 메인 앱 컴포넌트
│   │   ├── main.tsx                      # 앱 진입점
│   │   └── vite-env.d.ts                 # Vite 타입 정의
│   ├── package.json                      # 의존성 및 스크립트
│   ├── vite.config.ts                    # Vite 설정
│   ├── tailwind.config.js                # Tailwind 설정
│   ├── tsconfig.json                     # TypeScript 설정
│   └── .env.example                      # 환경변수 예시
├── 📂 backend/                           # Express 서버 애플리케이션
│   ├── 📂 src/
│   │   ├── 📂 controllers/               # 컨트롤러 (요청 처리)
│   │   │   ├── authController.ts         # 인증 컨트롤러
│   │   │   ├── stockController.ts        # 주식 데이터 컨트롤러
│   │   │   ├── tradingController.ts      # 거래 컨트롤러
│   │   │   ├── portfolioController.ts    # 포트폴리오 컨트롤러
│   │   │   ├── userController.ts         # 사용자 컨트롤러
│   │   │   └── leaderboardController.ts  # 리더보드 컨트롤러
│   │   ├── 📂 services/                  # 비즈니스 로직
│   │   │   ├── authService.ts            # 인증 서비스
│   │   │   ├── kisApiService.ts          # 한국투자증권 API 서비스
│   │   │   ├── tradingService.ts         # 거래 로직 서비스
│   │   │   ├── portfolioService.ts       # 포트폴리오 계산 서비스
│   │   │   ├── priceService.ts           # 가격 데이터 서비스
│   │   │   ├── newsService.ts            # 뉴스 데이터 서비스
│   │   │   └── notificationService.ts    # 알림 서비스
│   │   ├── 📂 models/                    # 데이터 모델 (Prisma)
│   │   │   ├── User.ts                   # 사용자 모델
│   │   │   ├── Portfolio.ts              # 포트폴리오 모델
│   │   │   ├── Transaction.ts            # 거래 모델
│   │   │   ├── Stock.ts                  # 주식 모델
│   │   │   └── Holdings.ts               # 보유 종목 모델
│   │   ├── 📂 middleware/                # 미들웨어
│   │   │   ├── auth.ts                   # 인증 미들웨어
│   │   │   ├── validation.ts             # 데이터 검증 미들웨어
│   │   │   ├── rateLimiter.ts            # API 호출 제한
│   │   │   ├── errorHandler.ts           # 에러 처리 미들웨어
│   │   │   ├── logger.ts                 # 로깅 미들웨어
│   │   │   └── cors.ts                   # CORS 설정
│   │   ├── 📂 routes/                    # API 라우트
│   │   │   ├── auth.ts                   # 인증 라우트
│   │   │   ├── stocks.ts                 # 주식 데이터 라우트
│   │   │   ├── trading.ts                # 거래 라우트
│   │   │   ├── portfolio.ts              # 포트폴리오 라우트
│   │   │   ├── users.ts                  # 사용자 라우트
│   │   │   ├── leaderboard.ts            # 리더보드 라우트
│   │   │   └── index.ts                  # 라우트 통합
│   │   ├── 📂 utils/                     # 유틸리티 함수
│   │   │   ├── encryption.ts             # 암호화 유틸리티
│   │   │   ├── dateHelpers.ts            # 날짜 처리
│   │   │   ├── calculations.ts           # 수학적 계산
│   │   │   ├── validators.ts             # 데이터 검증
│   │   │   ├── formatters.ts             # 데이터 포맷팅
│   │   │   └── logger.ts                 # 로깅 유틸리티
│   │   ├── 📂 config/                    # 설정 파일
│   │   │   ├── database.ts               # 데이터베이스 설정
│   │   │   ├── redis.ts                  # Redis 설정
│   │   │   ├── cors.ts                   # CORS 설정
│   │   │   ├── jwt.ts                    # JWT 설정
│   │   │   └── kis.ts                    # 한국투자증권 API 설정
│   │   ├── 📂 types/                     # TypeScript 타입
│   │   │   ├── express.d.ts              # Express 타입 확장
│   │   │   ├── kis.types.ts              # 한국투자증권 API 타입
│   │   │   └── common.types.ts           # 공통 타입
│   │   ├── app.ts                        # Express 앱 설정
│   │   └── server.ts                     # 서버 시작점
│   ├── 📂 prisma/                        # Prisma ORM
│   │   ├── schema.prisma                 # 데이터베이스 스키마
│   │   ├── 📂 migrations/                # 마이그레이션 파일
│   │   └── seed.ts                       # 초기 데이터
│   ├── 📂 tests/                         # 테스트 파일
│   │   ├── 📂 unit/                      # 단위 테스트
│   │   ├── 📂 integration/               # 통합 테스트
│   │   └── 📂 fixtures/                  # 테스트 데이터
│   ├── package.json                      # 의존성 및 스크립트
│   ├── tsconfig.json                     # TypeScript 설정
│   ├── jest.config.js                    # Jest 테스트 설정
│   └── .env.example                      # 환경변수 예시
├── 📂 shared/                            # 공통 모듈
│   ├── 📂 types/                         # 공통 타입 정의
│   │   ├── api.types.ts                  # API 공통 타입
│   │   ├── user.types.ts                 # 사용자 타입
│   │   ├── stock.types.ts                # 주식 타입
│   │   └── trading.types.ts              # 거래 타입
│   ├── 📂 utils/                         # 공통 유틸리티
│   │   ├── constants.ts                  # 상수 정의
│   │   ├── enums.ts                      # 열거형 정의
│   │   └── validators.ts                 # 공통 검증 함수
│   └── package.json                      # 공통 모듈 의존성
├── 📂 docs/                              # 프로젝트 문서
│   ├── api.md                            # API 문서
│   ├── deployment.md                     # 배포 가이드
│   ├── database.md                       # 데이터베이스 설계
│   ├── architecture.md                   # 시스템 아키텍처
│   └── user-guide.md                     # 사용자 가이드
├── 📂 scripts/                           # 자동화 스크립트
│   ├── setup.sh                          # 초기 설정 스크립트
│   ├── deploy.sh                         # 배포 스크립트
│   └── backup.sh                         # 백업 스크립트
├── docker-compose.yml                    # Docker 구성
├── .gitignore                            # Git 무시 파일
├── package.json                          # 루트 패키지 설정
├── README.md                             # 프로젝트 설명
├── structure.md                          # 이 파일
└── config.yaml                           # 프로젝트 설정
```

## 🔧 컴포넌트 설계 원칙

### Frontend 컴포넌트
1. **Atomic Design Pattern** 적용
   - Atoms: 기본 UI 요소 (Button, Input)
   - Molecules: 단순한 컴포넌트 조합 (SearchBox)
   - Organisms: 복잡한 컴포넌트 (Header, StockCard)
   - Templates: 페이지 레이아웃
   - Pages: 실제 페이지 컴포넌트

2. **Props Interface 설계**
   ```typescript
   interface ComponentProps {
     // 필수 props
     id: string;
     // 선택적 props
     className?: string;
     // 이벤트 핸들러
     onClick?: () => void;
     // 기타 props
   }
   ```

### Backend 구조
1. **MVC Pattern** 기반
   - Model: Prisma 스키마
   - View: JSON API 응답
   - Controller: 요청/응답 처리

2. **Service Layer Pattern**
   - 비즈니스 로직 분리
   - 재사용 가능한 서비스
   - 테스트 용이성

## 📊 데이터 흐름

```
사용자 → Frontend → API Gateway → Controller → Service → Database
                                           ↓
                               External API (한국투자증권)
```

### 주요 데이터 흐름
1. **인증 플로우**
   ```
   Login Request → Auth Controller → Auth Service → JWT Token
   ```

2. **주식 데이터 플로우**
   ```
   Stock Request → Stock Controller → KIS API Service → Cache → Response
   ```

3. **거래 플로우**
   ```
   Trade Request → Validation → Trading Service → Portfolio Update → Transaction Log
   ```

## 🔐 보안 구조

### Authentication & Authorization
- JWT 기반 인증
- Role-based 권한 관리 (학생/교사)
- API 엔드포인트별 권한 검증

### Data Protection
- 입력 데이터 검증 및 살균
- SQL Injection 방지 (Prisma ORM)
- XSS 방지 (Content Security Policy)

## 📱 반응형 설계

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Layout Strategy
- Mobile-first 접근법
- Progressive Enhancement
- Touch-friendly 인터페이스

## 🚀 성능 최적화 구조

### Frontend
- Code Splitting (React.lazy)
- Memoization (React.memo, useMemo)
- Virtual Scrolling (큰 목록)
- Image Optimization

### Backend
- Redis 캐싱 레이어
- Database Connection Pooling
- API Response Caching
- Query Optimization

### Database
- 적절한 인덱싱
- 정규화된 스키마
- Connection Pooling
- Query 최적화

이 구조는 확장 가능하고 유지보수가 용이하도록 설계되었으며, 교육용 애플리케이션의 특성을 고려하여 안정성과 사용성에 중점을 두었습니다.