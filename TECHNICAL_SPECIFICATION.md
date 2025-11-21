# 경제수학 모의주식 투자 교육 플랫폼
## 기술 명세서 (Technical Specification)

---

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [핵심 혁신 기술](#핵심-혁신-기술)
3. [기술 스택](#기술-스택)
4. [API 명세](#api-명세)
5. [데이터베이스 설계](#데이터베이스-설계)
6. [보안 시스템](#보안-시스템)
7. [성능 최적화](#성능-최적화)
8. [배포 및 운영](#배포-및-운영)

---

## 🎯 시스템 개요

### 프로젝트 정보
- **프로젝트명**: Mathematical Economics Stock Investment Education Platform
- **한글명**: 경제수학 모의주식 투자 교육 플랫폼
- **버전**: v1.0.0
- **개발 기간**: 2025년 1월 - 6월
- **라이선스**: MIT License

### 핵심 목표
- 고등학생 대상 실전 주식 투자 교육
- 실시간 데이터 기반 안전한 모의투자 환경
- 교사 중심의 클래스 관리 시스템
- 수학적 분석 도구를 통한 투자 학습

---

## 🚀 핵심 혁신 기술

### 1. 다중 소스 실시간 주식 데이터 시스템

#### 기술 개요
```typescript
interface StockDataSource {
  priority: number;
  reliability: number;
  latency: number;
  coverage: string[];
}

const dataSources: StockDataSource[] = [
  { priority: 1, reliability: 99.5, latency: 100, coverage: ['KRX'] },    // KRX API
  { priority: 2, reliability: 95.0, latency: 500, coverage: ['KOSPI', 'KOSDAQ'] }, // Naver
  { priority: 3, reliability: 90.0, latency: 1000, coverage: ['Global'] }, // Yahoo
  { priority: 4, reliability: 100, latency: 10, coverage: ['Mock'] }      // Mock
];
```

#### 폴백 메커니즘
```typescript
async getStockPrice(symbol: string): Promise<StockPriceData | null> {
  const sources = [this.krxService, this.naverService, this.yahooService, this.mockService];
  
  for (const source of sources) {
    try {
      const data = await source.getStockPrice(symbol);
      if (this.validateData(data)) {
        await this.cacheData(symbol, data);
        return data;
      }
    } catch (error) {
      logger.warn(`Source ${source.constructor.name} failed: ${error.message}`);
      continue; // 다음 소스로 폴백
    }
  }
  
  return null; // 모든 소스 실패
}
```

### 2. 지능형 캐싱 시스템

#### 다층 캐싱 전략
```typescript
interface CacheLayer {
  level: number;
  storage: 'memory' | 'redis' | 'database';
  ttl: number;
  capacity: string;
}

const cacheStrategy = {
  L1: { level: 1, storage: 'memory', ttl: 30, capacity: '100MB' },   // 메모리 캐시
  L2: { level: 2, storage: 'redis', ttl: 300, capacity: '1GB' },     // Redis 캐시
  L3: { level: 3, storage: 'database', ttl: 3600, capacity: '∞' }    // DB 캐시
};
```

#### 캐시 무효화 전략
```typescript
class SmartCache {
  async invalidateByPattern(pattern: string) {
    // 스마트 무효화: 관련 데이터만 선택적 삭제
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
      logger.info(`Invalidated ${keys.length} cache entries for pattern: ${pattern}`);
    }
  }

  async updateWithDependency(key: string, data: any, dependencies: string[]) {
    // 의존성 기반 캐시 업데이트
    await this.set(key, data);
    await this.setDependencies(key, dependencies);
  }
}
```

### 3. 실시간 WebSocket 시스템

#### 선택적 구독 메커니즘
```typescript
class WebSocketManager {
  private subscriptions = new Map<string, Set<string>>(); // userId -> symbols

  subscribeToStock(userId: string, symbol: string) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId)!.add(symbol);
    
    // 사용자별 맞춤 업데이트 전송
    this.joinRoom(userId, `stock:${symbol}`);
  }

  broadcastPriceUpdate(symbol: string, data: StockPriceData) {
    // 해당 종목 구독자에게만 전송
    this.io.to(`stock:${symbol}`).emit('priceUpdate', {
      symbol,
      ...data,
      timestamp: Date.now()
    });
  }
}
```

### 4. 교육 특화 거래 시스템

#### 거래 제약 엔진
```typescript
class TradingConstraintEngine {
  async validateTrade(trade: TradeRequest): Promise<ValidationResult> {
    const validations = [
      this.validateDailyLimit(trade.userId, trade.symbol),
      this.validateTradingReason(trade.reason),
      this.validateMarketHours(),
      this.validateFundsAvailability(trade),
      this.validateEducationalConstraints(trade)
    ];

    const results = await Promise.all(validations);
    return this.aggregateResults(results);
  }

  private async validateEducationalConstraints(trade: TradeRequest) {
    // 교육적 제약 검증
    const userClass = await this.getUserClass(trade.userId);
    const allowedStocks = await this.getAllowedStocks(userClass.id);
    
    if (!allowedStocks.includes(trade.symbol)) {
      throw new EducationalConstraintError('해당 종목은 선생님이 허용하지 않은 종목입니다.');
    }
  }
}
```

### 5. JWT 키 자동 관리 시스템

#### 무중단 키 로테이션
```typescript
class JWTKeyManager {
  private currentKey: string;
  private previousKey: string;
  private keyRotationInterval = 30 * 24 * 60 * 60 * 1000; // 30일

  constructor() {
    this.loadKeysFromFile();
    this.scheduleKeyRotation();
  }

  private loadKeysFromFile() {
    try {
      const keyData = JSON.parse(fs.readFileSync('.jwt-keys.json', 'utf8'));
      this.currentKey = keyData.current;
      this.previousKey = keyData.previous;
      
      // 키 만료 확인
      if (Date.now() - keyData.createdAt > this.keyRotationInterval) {
        this.rotateKeys();
      }
    } catch {
      this.generateNewKeys();
    }
  }

  verifyToken(token: string): any {
    try {
      // 현재 키로 검증 시도
      return jwt.verify(token, this.currentKey);
    } catch {
      // 이전 키로 검증 (그레이스 피리어드)
      return jwt.verify(token, this.previousKey);
    }
  }

  private rotateKeys() {
    this.previousKey = this.currentKey;
    this.currentKey = crypto.randomBytes(64).toString('hex');
    this.persistKeysToFile();
    
    logger.info('JWT keys rotated successfully');
  }
}
```

---

## 🛠️ 기술 스택

### Frontend
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.0+",
  "buildTool": "Vite 4.0+",
  "stateManagement": "@reduxjs/toolkit 1.9+",
  "routing": "react-router-dom 6.8+",
  "styling": "Tailwind CSS 3.3+",
  "charts": "Chart.js 4.2+",
  "forms": "react-hook-form 7.43+",
  "http": "axios 1.3+",
  "websocket": "socket.io-client 4.6+",
  "icons": "@heroicons/react 2.0+",
  "notifications": "react-hot-toast 2.4+"
}
```

### Backend
```json
{
  "runtime": "Node.js 18.x LTS",
  "framework": "Express.js 4.18+",
  "language": "TypeScript 5.0+",
  "database": "PostgreSQL 15+",
  "cache": "Redis 7.0+",
  "orm": "Prisma 5.0+",
  "authentication": "jsonwebtoken 9.0+",
  "security": "helmet 6.1+",
  "validation": "joi 17.9+",
  "testing": "Jest 29.5+",
  "websocket": "socket.io 4.6+",
  "cron": "node-cron 3.0+",
  "logging": "winston 3.8+"
}
```

### Infrastructure
```json
{
  "containerization": "Docker 24.0+",
  "orchestration": "Kubernetes 1.27+",
  "webServer": "Nginx 1.24+",
  "processManager": "PM2 5.3+",
  "monitoring": "Winston + Custom Dashboard",
  "deployment": "GitHub Actions",
  "ssl": "Let's Encrypt",
  "cdn": "Cloudflare",
  "domain": "Custom Domain + DNS"
}
```

### External APIs
```json
{
  "stockData": {
    "primary": "KRX API",
    "secondary": "Naver Finance (Web Scraping)",
    "tertiary": "Yahoo Finance API",
    "fallback": "Mock Data Service"
  },
  "crawling": {
    "engine": "Python 3.11+",
    "libraries": ["requests", "beautifulsoup4", "aiohttp", "pandas"],
    "scheduler": "APScheduler"
  }
}
```

---

## 📡 API 명세

### Authentication Endpoints
```typescript
// 사용자 인증
POST /api/auth/register
{
  "email": "student@school.ac.kr",
  "password": "secure123",
  "name": "김학생",
  "role": "STUDENT"
}

POST /api/auth/login
{
  "email": "student@school.ac.kr", 
  "password": "secure123"
}

POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Stock Data Endpoints
```typescript
// 실시간 주식 가격
GET /api/stocks/{symbol}
Response: {
  "symbol": "005930",
  "name": "삼성전자",
  "currentPrice": 75000,
  "change": 1000,
  "changePercent": 1.35,
  "dayHigh": 75500,
  "dayLow": 73800,
  "volume": 12345678,
  "timestamp": "2025-06-22T10:30:00Z"
}

// 차트 데이터
GET /api/stocks/{symbol}/chart?period=1M
Response: {
  "symbol": "005930",
  "period": "1M",
  "data": [
    {
      "date": "2025-05-22",
      "open": 74000,
      "high": 75000,
      "low": 73500,
      "close": 74500,
      "volume": 8765432
    }
  ]
}
```

### Trading Endpoints
```typescript
// 주식 매수
POST /api/trading/buy
{
  "symbol": "005930",
  "quantity": 10,
  "reason": "삼성전자의 실적 개선과 반도체 시장 회복 기대로 매수 결정"
}

// 주식 매도  
POST /api/trading/sell
{
  "symbol": "005930",
  "quantity": 5,
  "reason": "목표 수익률 달성으로 부분 매도하여 수익 실현"
}

// 거래 내역
GET /api/trading/history?page=1&limit=20
Response: {
  "transactions": [
    {
      "id": "tx_123",
      "type": "BUY",
      "symbol": "005930",
      "quantity": 10,
      "price": 74000,
      "totalAmount": 740000,
      "reason": "매수 근거...",
      "createdAt": "2025-06-22T09:30:00Z"
    }
  ],
  "totalCount": 45,
  "currentPage": 1
}
```

### Portfolio Endpoints
```typescript
// 포트폴리오 조회
GET /api/portfolio
Response: {
  "userId": "user_123",
  "totalValue": 10500000,
  "totalCost": 10000000,
  "totalProfitLoss": 500000,
  "totalProfitLossPercent": 5.0,
  "holdings": [
    {
      "symbol": "005930",
      "name": "삼성전자",
      "quantity": 10,
      "averagePrice": 74000,
      "currentPrice": 75000,
      "currentValue": 750000,
      "profitLoss": 10000,
      "profitLossPercent": 1.35
    }
  ]
}
```

### Admin Endpoints
```typescript
// 사용자 관리
GET /api/admin/users
PUT /api/admin/users/{userId}/approve
DELETE /api/admin/users/{userId}/delete

// 시스템 통계
GET /api/admin/statistics
Response: {
  "totalUsers": 1250,
  "activeUsers": 890,
  "totalTrades": 15670,
  "systemHealth": {
    "cpu": "45%",
    "memory": "68%",
    "database": "healthy",
    "cache": "healthy"
  }
}
```

---

## 💾 데이터베이스 설계

### 핵심 테이블 구조

#### Users 테이블
```sql
CREATE TABLE users (
    id VARCHAR(30) PRIMARY KEY DEFAULT cuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    is_active BOOLEAN DEFAULT FALSE,
    initial_capital DECIMAL(15,2) DEFAULT 10000000,
    current_cash DECIMAL(15,2) DEFAULT 10000000,
    class_id VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_class_id ON users(class_id);
CREATE INDEX idx_users_role ON users(role);
```

#### Stocks 테이블
```sql
CREATE TABLE stocks (
    id VARCHAR(30) PRIMARY KEY DEFAULT cuid(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    market VARCHAR(20) NOT NULL,
    sector VARCHAR(50),
    current_price DECIMAL(15,2) DEFAULT 0,
    previous_close DECIMAL(15,2) DEFAULT 0,
    day_open DECIMAL(15,2),
    day_high DECIMAL(15,2),
    day_low DECIMAL(15,2),
    volume BIGINT DEFAULT 0,
    market_cap BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    is_tracked BOOLEAN DEFAULT FALSE,
    last_price_update TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_is_tracked ON stocks(is_tracked);
CREATE INDEX idx_stocks_market ON stocks(market);
```

#### Transactions 테이블
```sql
CREATE TABLE transactions (
    id VARCHAR(30) PRIMARY KEY DEFAULT cuid(),
    user_id VARCHAR(30) NOT NULL,
    stock_id VARCHAR(30) NOT NULL,
    type transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2) DEFAULT 0,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_stock_id ON transactions(stock_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
```

### 데이터베이스 최적화

#### 인덱스 전략
```sql
-- 복합 인덱스로 쿼리 성능 최적화
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX idx_holdings_user_stock ON holdings(user_id, stock_id);
CREATE INDEX idx_price_history_stock_date ON price_history(stock_id, date DESC);

-- 부분 인덱스로 저장 공간 최적화
CREATE INDEX idx_active_stocks ON stocks(symbol) WHERE is_active = TRUE;
CREATE INDEX idx_tracked_stocks ON stocks(id) WHERE is_tracked = TRUE;
```

#### 파티셔닝 전략
```sql
-- 날짜 기반 파티셔닝 (월별)
CREATE TABLE price_history (
    stock_id VARCHAR(30),
    date DATE,
    open DECIMAL(15,2),
    high DECIMAL(15,2),
    low DECIMAL(15,2),
    close DECIMAL(15,2),
    volume BIGINT
) PARTITION BY RANGE (date);

-- 월별 파티션 생성
CREATE TABLE price_history_2025_06 PARTITION OF price_history
FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
```

---

## 🔐 보안 시스템

### 인증 및 인가

#### JWT 토큰 구조
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  classId?: string;
  iat: number;  // 발급 시간
  exp: number;  // 만료 시간
  iss: string;  // 발급자
  aud: string;  // 대상
}

const tokenConfig = {
  accessToken: {
    expiresIn: '15m',
    algorithm: 'HS256',
    issuer: 'mathematical-economics',
    audience: 'mathematical-economics-users'
  },
  refreshToken: {
    expiresIn: '30d',
    algorithm: 'HS256'
  }
};
```

#### 권한 기반 접근 제어 (RBAC)
```typescript
const permissions = {
  STUDENT: [
    'portfolio:read',
    'trading:execute',
    'stocks:read',
    'watchlist:manage'
  ],
  TEACHER: [
    'class:manage',
    'students:monitor',
    'reports:generate',
    'stocks:curate'
  ],
  ADMIN: [
    'users:manage',
    'system:configure',
    'analytics:access',
    'security:audit'
  ]
};

function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const userPermissions = permissions[userRole];
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

### 데이터 보호

#### 암호화 시스템
```typescript
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;

  encrypt(text: string, key: Buffer): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('mathematical-economics'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  // 민감한 데이터 (개인정보, 거래 정보) 암호화
  async encryptSensitiveData(data: any): Promise<string> {
    const key = await this.getDerivedKey();
    const encrypted = this.encrypt(JSON.stringify(data), key);
    return Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }
}
```

### 보안 미들웨어

#### Rate Limiting
```typescript
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 요청 수
  message: {
    error: 'Too many requests',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP별 다른 제한
  keyGenerator: (req) => {
    return req.ip;
  },
  // 특별 제한 (로그인)
  skip: (req) => {
    if (req.path === '/api/auth/login') {
      return false; // 로그인은 더 엄격한 제한 적용
    }
    return false;
  }
};

// 로그인 전용 Rate Limiting
const loginLimiter = {
  windowMs: 15 * 60 * 1000,
  max: 5, // 15분에 5번만 허용
  skipSuccessfulRequests: true
};
```

#### 보안 헤더
```typescript
const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: "strict-origin-when-cross-origin"
};
```

---

## ⚡ 성능 최적화

### 프론트엔드 최적화

#### React 성능 최적화
```typescript
// 컴포넌트 메모이제이션
const StockCard = React.memo<StockCardProps>(({ stock, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(stock.symbol);
  }, [stock.symbol, onSelect]);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(stock.currentPrice);
  }, [stock.currentPrice]);

  return (
    <div onClick={handleClick}>
      <h3>{stock.name}</h3>
      <p>{formattedPrice}</p>
    </div>
  );
});

// 가상 스크롤링으로 대용량 목록 처리
const VirtualStockList = ({ stocks }: { stocks: Stock[] }) => {
  const rowRenderer = useCallback(({ index, key, style }) => (
    <div key={key} style={style}>
      <StockCard stock={stocks[index]} />
    </div>
  ), [stocks]);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          rowCount={stocks.length}
          rowHeight={80}
          rowRenderer={rowRenderer}
        />
      )}
    </AutoSizer>
  );
};
```

#### 코드 스플리팅
```typescript
// 라우트 기반 코드 스플리팅
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trading = lazy(() => import('./pages/Trading'));
const Portfolio = lazy(() => import('./pages/Portfolio'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// 동적 import로 필요시에만 로드
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

### 백엔드 최적화

#### 데이터베이스 쿼리 최적화
```typescript
// 배치 처리로 N+1 문제 해결
async getPortfoliosWithHoldings(userIds: string[]): Promise<Portfolio[]> {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      holdings: {
        include: {
          stock: {
            select: { symbol: true, name: true, currentPrice: true }
          }
        }
      }
    }
  });

  return portfolios;
}

// 커넥션 풀링으로 DB 성능 최적화
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // 커넥션 풀 설정
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty'
});
```

#### 비동기 처리
```typescript
// 병렬 처리로 응답 시간 단축
async function getDashboardData(userId: string): Promise<DashboardData> {
  const [portfolio, recentTransactions, watchlist, marketSummary] = await Promise.all([
    this.portfolioService.getPortfolio(userId),
    this.tradingService.getRecentTransactions(userId, 10),
    this.watchlistService.getUserWatchlist(userId),
    this.stockService.getMarketSummary()
  ]);

  return {
    portfolio,
    recentTransactions,
    watchlist,
    marketSummary
  };
}

// 스트림 처리로 메모리 효율성 확보
async function processLargeDataset(symbols: string[]): Promise<void> {
  const batchSize = 100;
  
  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    await this.processBatch(batch);
    
    // 메모리 정리를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
```

### 캐싱 최적화

#### 스마트 캐싱 전략
```typescript
class SmartCacheManager {
  private cache = new Map<string, CacheEntry>();
  private dependencies = new Map<string, Set<string>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.invalidate(key);
      return null;
    }
    
    // 액세스 시간 업데이트 (LRU)
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  async set<T>(key: string, data: T, ttl: number, deps: string[] = []): Promise<void> {
    const entry: CacheEntry = {
      data,
      ttl,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
    
    // 의존성 설정
    if (deps.length > 0) {
      this.dependencies.set(key, new Set(deps));
    }
  }

  invalidateByDependency(dependency: string): void {
    // 의존성 기반 캐시 무효화
    for (const [key, deps] of this.dependencies.entries()) {
      if (deps.has(dependency)) {
        this.invalidate(key);
      }
    }
  }
}
```

---

## 🚀 배포 및 운영

### Docker 컨테이너화

#### Dockerfile (Frontend)
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# TypeScript 컴파일
RUN npm run build

# 프로덕션 모드 실행
EXPOSE 5000
CMD ["npm", "start"]
```

### Kubernetes 배포

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stock-education-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stock-education-backend
  template:
    metadata:
      labels:
        app: stock-education-backend
    spec:
      containers:
      - name: backend
        image: stock-education-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

### 모니터링 시스템

#### 헬스체크 엔드포인트
```typescript
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      externalAPIs: await checkExternalAPIs(),
      diskSpace: await checkDiskSpace(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100).toFixed(2)
      }
    }
  };

  const isHealthy = Object.values(healthStatus.checks).every(check => 
    typeof check === 'object' ? check.status === 'ok' : check === 'ok'
  );

  res.status(isHealthy ? 200 : 503).json(healthStatus);
});
```

#### 성능 메트릭 수집
```typescript
class MetricsCollector {
  private metrics = new Map<string, number>();

  recordRequestDuration(route: string, duration: number) {
    const key = `request_duration_${route}`;
    this.metrics.set(key, duration);
  }

  recordDatabaseQuery(query: string, duration: number) {
    const key = `db_query_${query}`;
    this.metrics.set(key, duration);
  }

  recordCacheHit(key: string, hit: boolean) {
    const metricKey = `cache_${hit ? 'hit' : 'miss'}_${key}`;
    const current = this.metrics.get(metricKey) || 0;
    this.metrics.set(metricKey, current + 1);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

---

이 기술 명세서는 시스템의 모든 핵심 구성요소와 혁신적인 기술들을 상세히 문서화하여, 저작권 등록 시 기술적 창작성과 독창성을 명확히 입증할 수 있도록 작성되었습니다.