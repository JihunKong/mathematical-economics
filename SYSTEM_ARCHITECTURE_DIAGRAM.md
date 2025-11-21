# 경제수학 모의주식 투자 교육 플랫폼
## 시스템 아키텍처 다이어그램

### 🏗️ 전체 시스템 구조

```mermaid
graph TB
    %% User Interface Layer
    subgraph "Frontend Layer (React + TypeScript)"
        UI1[학생 대시보드<br/>- 포트폴리오 관리<br/>- 실시간 거래<br/>- 학습 분석]
        UI2[교사 관리 패널<br/>- 클래스 관리<br/>- 학생 모니터링<br/>- 성과 분석]
        UI3[관리자 시스템<br/>- 사용자 관리<br/>- 시스템 설정<br/>- 통계 대시보드]
    end

    %% API Gateway
    subgraph "API Gateway Layer"
        GW[Nginx Reverse Proxy<br/>- HTTPS 종료<br/>- 로드 밸런싱<br/>- 정적 파일 서빙]
    end

    %% Backend Services
    subgraph "Backend Services (Node.js + Express)"
        API[REST API Server<br/>- 인증/인가<br/>- 비즈니스 로직<br/>- 데이터 검증]
        WS[WebSocket Server<br/>- 실시간 가격 업데이트<br/>- 알림 서비스<br/>- 채팅 기능]
        CRON[Scheduled Jobs<br/>- 주식 가격 수집<br/>- 포트폴리오 계산<br/>- 리포트 생성]
    end

    %% Stock Data Collection
    subgraph "Stock Data Collection System"
        KRX[KRX API<br/>실시간 데이터<br/>장중 최우선]
        NAVER[Naver Finance<br/>웹 스크래핑<br/>백업 소스]
        YAHOO[Yahoo Finance<br/>국제 주식<br/>과거 데이터]
        CRAWLER[Python Crawlers<br/>배치 업데이트<br/>다중 소스]
    end

    %% Data Storage
    subgraph "Data Storage Layer"
        PG[(PostgreSQL<br/>- 사용자 데이터<br/>- 거래 내역<br/>- 포트폴리오)]
        REDIS[(Redis Cache<br/>- 세션 관리<br/>- 실시간 데이터<br/>- API 캐시)]
        FILES[File System<br/>- JWT 키 저장<br/>- 로그 파일<br/>- 업로드 파일]
    end

    %% External Services
    subgraph "External Integrations"
        EMAIL[Email Service<br/>알림 발송]
        MONITOR[Monitoring<br/>로그 수집<br/>성능 모니터링]
        BACKUP[Backup System<br/>데이터 백업<br/>재해 복구]
    end

    %% Connections
    UI1 --> GW
    UI2 --> GW
    UI3 --> GW
    
    GW --> API
    GW --> WS
    
    API --> PG
    API --> REDIS
    API --> FILES
    
    WS --> REDIS
    
    CRON --> KRX
    CRON --> NAVER
    CRON --> YAHOO
    CRON --> CRAWLER
    CRON --> PG
    
    API --> EMAIL
    API --> MONITOR
    PG --> BACKUP

    %% Styling
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef data fill:#e8f5e8
    classDef external fill:#fff3e0
    
    class UI1,UI2,UI3 frontend
    class API,WS,CRON,GW backend
    class PG,REDIS,FILES data
    class KRX,NAVER,YAHOO,CRAWLER,EMAIL,MONITOR,BACKUP external
```

---

### 📊 데이터 플로우 다이어그램

```mermaid
sequenceDiagram
    participant Student as 학생
    participant Frontend as React Frontend
    participant API as Express API
    participant Cache as Redis Cache
    participant DB as PostgreSQL
    participant StockService as Stock Data Service
    participant KRX as KRX API
    participant Naver as Naver Finance

    %% 실시간 주식 가격 조회 플로우
    Student->>Frontend: 주식 정보 요청
    Frontend->>API: GET /api/stocks/{symbol}
    
    API->>Cache: 캐시 확인
    alt 캐시 히트
        Cache-->>API: 캐시된 데이터 반환
        API-->>Frontend: 주식 데이터
    else 캐시 미스
        API->>StockService: getStockPrice(symbol)
        
        StockService->>KRX: 실시간 데이터 요청
        alt KRX 성공
            KRX-->>StockService: 실시간 주식 데이터
        else KRX 실패
            StockService->>Naver: 웹 스크래핑 요청
            Naver-->>StockService: 백업 주식 데이터
        end
        
        StockService->>DB: 가격 데이터 저장
        StockService->>Cache: 캐시 업데이트 (60초 TTL)
        StockService-->>API: 주식 데이터
        API-->>Frontend: 주식 데이터
    end
    
    Frontend-->>Student: 실시간 주식 정보 표시
```

---

### 🔐 보안 아키텍처

```mermaid
graph LR
    subgraph "Client Security"
        HTTPS[HTTPS/TLS 1.3<br/>암호화 통신]
        CSP[Content Security Policy<br/>XSS 방어]
        CSRF[CSRF Token<br/>요청 위조 방어]
    end

    subgraph "API Security"
        RATE[Rate Limiting<br/>100 req/min 일반<br/>5 req/15min 로그인]
        CORS[CORS Policy<br/>도메인 제한]
        HELMET[Security Headers<br/>HSTS, X-Frame-Options]
    end

    subgraph "Authentication"
        JWT[JWT Token System<br/>Access: 15분<br/>Refresh: 30일]
        KEYROT[Key Rotation<br/>30일 자동 갱신<br/>파일 영구 저장]
        RBAC[Role-Based Access<br/>STUDENT/TEACHER/ADMIN]
    end

    subgraph "Data Security"
        HASH[Password Hashing<br/>bcrypt + salt]
        ENCRYPT[Sensitive Data<br/>AES-256 암호화]
        AUDIT[Audit Logging<br/>모든 민감 작업 기록]
    end

    Client --> HTTPS
    HTTPS --> RATE
    RATE --> JWT
    JWT --> HASH
    
    CSP --> CORS
    CSRF --> HELMET
    CORS --> KEYROT
    HELMET --> RBAC
    KEYROT --> ENCRYPT
    RBAC --> AUDIT

    classDef security fill:#ffebee
    class HTTPS,CSP,CSRF,RATE,CORS,HELMET,JWT,KEYROT,RBAC,HASH,ENCRYPT,AUDIT security
```

---

### 💾 데이터베이스 구조

```mermaid
erDiagram
    User ||--o{ Portfolio : has
    User ||--o{ Transaction : makes
    User ||--o{ Holding : owns
    User ||--o{ Watchlist : creates
    User ||--o{ Notification : receives
    User }o--|| Class : belongs_to
    
    Teacher ||--o{ Class : teaches
    Class ||--o{ AllowedStock : allows
    
    Stock ||--o{ Transaction : involves
    Stock ||--o{ Holding : represents
    Stock ||--o{ PriceHistory : has
    Stock ||--o{ StockPriceHistory : tracks
    Stock ||--o{ AllowedStock : included_in
    Stock ||--o{ Watchlist : watched_in

    User {
        string id PK
        string email UK
        string password
        string name
        enum role
        boolean isActive
        float initialCapital
        float currentCash
        datetime createdAt
    }

    Class {
        string id PK
        string name
        string code UK
        string teacherId FK
        datetime startDate
        datetime endDate
        boolean isActive
    }

    Stock {
        string id PK
        string symbol UK
        string name
        string market
        float currentPrice
        float previousClose
        bigint volume
        boolean isActive
        boolean isTracked
    }

    Portfolio {
        string id PK
        string userId FK
        float totalValue
        float totalCost
        float totalProfitLoss
        float totalProfitLossPercent
    }

    Transaction {
        string id PK
        string userId FK
        string stockId FK
        enum type
        int quantity
        float price
        float totalAmount
        string reason
        datetime createdAt
    }

    Holding {
        string id PK
        string userId FK
        string stockId FK
        int quantity
        float averagePrice
        float currentValue
        float profitLoss
    }
```

---

### ⚡ 실시간 데이터 처리 흐름

```mermaid
graph TD
    subgraph "Data Sources"
        KRX[KRX API<br/>실시간 데이터]
        NAVER[Naver Finance<br/>웹 스크래핑]
        PYTHON[Python Crawlers<br/>배치 수집]
    end

    subgraph "Collection Layer"
        COLLECTOR[Stock Data Collector<br/>- 다중 소스 병합<br/>- 데이터 검증<br/>- 중복 제거]
    end

    subgraph "Processing Layer"
        PROCESSOR[Data Processor<br/>- 가격 계산<br/>- 변동률 산출<br/>- 히스토리 생성]
    end

    subgraph "Storage Layer"
        CACHE[Redis Cache<br/>60초 TTL]
        DATABASE[PostgreSQL<br/>영구 저장]
    end

    subgraph "Distribution Layer"
        WEBSOCKET[WebSocket Server<br/>실시간 브로드캐스트]
        API_RESPONSE[API Response<br/>REST 엔드포인트]
    end

    subgraph "Client Layer"
        DASHBOARD[학생 대시보드]
        ADMIN[관리자 패널]
        MOBILE[모바일 앱]
    end

    %% Data flow
    KRX --> COLLECTOR
    NAVER --> COLLECTOR
    PYTHON --> COLLECTOR
    
    COLLECTOR --> PROCESSOR
    PROCESSOR --> CACHE
    PROCESSOR --> DATABASE
    
    CACHE --> WEBSOCKET
    CACHE --> API_RESPONSE
    
    WEBSOCKET --> DASHBOARD
    WEBSOCKET --> ADMIN
    API_RESPONSE --> MOBILE

    %% Styling
    classDef source fill:#e3f2fd
    classDef process fill:#f3e5f5
    classDef storage fill:#e8f5e8
    classDef client fill:#fff3e0
    
    class KRX,NAVER,PYTHON source
    class COLLECTOR,PROCESSOR process
    class CACHE,DATABASE storage
    class DASHBOARD,ADMIN,MOBILE client
```

---

### 🔄 배포 및 운영 아키텍처

```mermaid
graph TB
    subgraph "Development"
        DEV[개발 환경<br/>Local Docker]
        TEST[테스트 환경<br/>Staging Server]
    end

    subgraph "CI/CD Pipeline"
        GIT[GitHub Repository<br/>소스 코드 관리]
        BUILD[Build Process<br/>- TypeScript 컴파일<br/>- Docker 이미지 생성<br/>- 테스트 실행]
        DEPLOY[Auto Deployment<br/>- 프로덕션 배포<br/>- 헬스체크<br/>- 롤백 준비]
    end

    subgraph "Production Environment"
        LB[Load Balancer<br/>Nginx]
        APP1[App Server 1<br/>PM2 Cluster]
        APP2[App Server 2<br/>PM2 Cluster]
        DB_MASTER[(PostgreSQL Master<br/>쓰기 전용)]
        DB_SLAVE[(PostgreSQL Slave<br/>읽기 전용)]
        REDIS_CLUSTER[(Redis Cluster<br/>캐시 & 세션)]
    end

    subgraph "Monitoring & Logging"
        MONITOR[System Monitoring<br/>CPU, Memory, Disk]
        LOGS[Log Aggregation<br/>Error Tracking]
        ALERT[Alert System<br/>Email/SMS 알림]
    end

    subgraph "Backup & Recovery"
        BACKUP[(Daily Backup<br/>데이터베이스)]
        CDN[CDN<br/>정적 파일 배포]
        DR[Disaster Recovery<br/>재해 복구 계획]
    end

    %% Development Flow
    DEV --> GIT
    TEST --> GIT
    GIT --> BUILD
    BUILD --> DEPLOY

    %% Production Flow
    DEPLOY --> LB
    LB --> APP1
    LB --> APP2
    APP1 --> DB_MASTER
    APP2 --> DB_SLAVE
    APP1 --> REDIS_CLUSTER
    APP2 --> REDIS_CLUSTER

    %% Operations
    APP1 --> MONITOR
    APP2 --> LOGS
    MONITOR --> ALERT
    DB_MASTER --> BACKUP
    REDIS_CLUSTER --> CDN
    BACKUP --> DR

    classDef dev fill:#e1f5fe
    classDef cicd fill:#f3e5f5
    classDef prod fill:#e8f5e8
    classDef ops fill:#fff3e0
    
    class DEV,TEST dev
    class GIT,BUILD,DEPLOY cicd
    class LB,APP1,APP2,DB_MASTER,DB_SLAVE,REDIS_CLUSTER prod
    class MONITOR,LOGS,ALERT,BACKUP,CDN,DR ops
```

---

### 🎯 성능 최적화 전략

```mermaid
mindmap
    root((성능 최적화))
        Frontend
            React.memo
            useMemo/useCallback
            Code Splitting
            Lazy Loading
            Virtual Scrolling
        Backend
            Connection Pooling
            Query Optimization
            Async Processing
            Batch Operations
            Response Compression
        Cache Strategy
            Redis L1 Cache
            Memory L2 Cache
            CDN L3 Cache
            Database Query Cache
            API Response Cache
        Database
            Index Optimization
            Partitioning
            Read Replicas
            Connection Pooling
            Query Plan Analysis
        Network
            HTTP/2
            Gzip Compression
            Asset Minification
            CDN Distribution
            Keep-Alive Connections
```

---

이 시스템 아키텍처는 **확장성**, **안정성**, **보안성**을 모두 고려한 엔터프라이즈급 설계로, 교육용 플랫폼의 특수성을 반영한 혁신적인 구조입니다.