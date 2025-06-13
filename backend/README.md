# Mathematical Economics Stock Trading System - Backend

## 개요 (Overview)

이 시스템은 한국 주식 시장의 실시간 가격 정보를 수집하고 관리하는 백엔드 서비스입니다. EC2 배포를 위해 Docker로 컨테이너화되어 있으며, 해외 서버에서도 안정적으로 작동하도록 설계되었습니다.

## 주요 기능 (Key Features)

- 🚀 **실시간 주식 가격 수집**: 여러 소스에서 한국 주식 가격 수집
- 🔄 **자동 폴백 시스템**: 크롤링 실패 시 하드코딩된 가격 사용
- 🐳 **Docker 지원**: 완전한 컨테이너화로 쉬운 배포
- 🌏 **해외 서버 최적화**: EC2 배포를 위한 프록시 및 우회 기능
- 📊 **가격 히스토리**: PostgreSQL 기반 가격 추적
- 🔐 **보안**: SSL/TLS 지원 및 환경 변수 기반 설정

## 기술 스택 (Tech Stack)

- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Crawling**: Python (BeautifulSoup, Cloudscraper, Selenium)
- **Container**: Docker, Docker Compose
- **Deployment**: AWS EC2, Nginx

## 시작하기 (Getting Started)

### 사전 요구사항 (Prerequisites)

- Node.js 16+
- Python 3.8+
- Docker & Docker Compose
- PostgreSQL 13+
- Redis 6+

### 로컬 개발 환경 설정 (Local Development Setup)

```bash
# 1. 의존성 설치
npm install

# 2. Python 패키지 설치
pip3 install -r requirements.txt

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 설정

# 4. 데이터베이스 마이그레이션
npx prisma migrate dev

# 5. 개발 서버 시작
npm run dev
```

### Docker로 실행 (Run with Docker)

```bash
# 1. Docker 이미지 빌드 및 시작
docker-compose up -d

# 2. 로그 확인
docker-compose logs -f

# 3. 중지
docker-compose down
```

## 주요 구성 요소 (Core Components)

### 1. 크롤러 시스템 (Crawler System)

여러 단계의 폴백을 가진 강력한 크롤링 시스템:

1. **Advanced Multi Crawler** (`scripts/advanced_multi_crawler.py`)
   - 프록시 지원
   - User-Agent 로테이션
   - 다중 소스 (Yahoo, Google, Investing.com)
   - 재시도 로직

2. **Public API Crawler** (`scripts/public_api_crawler.py`)
   - 하드코딩된 최신 가격
   - 20개 주요 종목 지원
   - 쉬운 업데이트 기능

3. **가격 업데이트 도구**
   - `scripts/update_hardcoded_prices.py`: 대화형 업데이터
   - `scripts/update_prices_advanced.py`: JSON 기반 벌크 업데이터

### 2. API 엔드포인트 (API Endpoints)

```
GET /api/stocks - 모든 주식 목록
GET /api/stocks/:symbol - 특정 주식 정보
GET /api/stocks/:symbol/history - 가격 히스토리
POST /api/stocks/:symbol/price - 가격 업데이트
```

### 3. 스케줄러 (Scheduler)

- 매분 자동 가격 업데이트
- 추적 중인 종목만 업데이트
- 실패 시 자동 재시도

## EC2 배포 (EC2 Deployment)

자세한 EC2 배포 가이드는 [EC2_DEPLOYMENT_GUIDE.md](EC2_DEPLOYMENT_GUIDE.md)를 참조하세요.

### 빠른 배포 단계:

1. **EC2 인스턴스 생성**
   - Ubuntu 22.04 LTS
   - t3.medium 이상 권장
   - 보안 그룹: 80, 443, 22 포트 오픈

2. **도메인 설정**
   - Route 53 또는 외부 DNS 설정
   - EC2 Elastic IP 연결

3. **서버 설정**
   ```bash
   # Docker 설치
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # 코드 배포
   git clone [repository]
   cd mathematical-economics/backend
   
   # 환경 변수 설정
   cp .env.production .env
   nano .env  # 실제 값으로 수정
   
   # 시작
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **SSL 설정**
   - Nginx 설치 및 설정
   - Let's Encrypt SSL 인증서 발급

## 가격 업데이트 방법 (Updating Prices)

### 방법 1: 대화형 업데이터
```bash
python3 scripts/update_hardcoded_prices.py
```

### 방법 2: JSON 파일 사용
```bash
# 템플릿 생성
python3 scripts/update_prices_advanced.py --generate-template

# 가격 업데이트
python3 scripts/update_prices_advanced.py --update stock_prices.json
```

### 방법 3: 단일 종목 업데이트
```bash
python3 scripts/update_prices_advanced.py --single 005930 --price 59500
```

## 문제 해결 (Troubleshooting)

### 크롤링이 실패하는 경우

1. **로컬 환경**: 한국 금융 사이트들이 해외 IP를 차단할 수 있습니다
   - 하드코딩된 가격 사용
   - EC2 배포 시 해결됨

2. **EC2 환경**: 여전히 차단되는 경우
   - 한국 프록시 서버 사용
   - Selenium 크롤러 활성화
   - 하드코딩된 가격 업데이트

### 데이터베이스 연결 오류

```bash
# PostgreSQL 상태 확인
docker-compose ps postgres

# 데이터베이스 재시작
docker-compose restart postgres

# 마이그레이션 재실행
docker-compose exec backend npx prisma migrate deploy
```

### 로그 확인

```bash
# 백엔드 로그
docker-compose logs -f backend

# 크롤러 로그
tail -f backend.log | grep crawler
```

## 개발 팁 (Development Tips)

1. **환경 변수 관리**
   - `.env` 파일은 절대 커밋하지 마세요
   - AWS Secrets Manager 사용 권장

2. **크롤러 테스트**
   ```bash
   # 단일 종목 테스트
   python3 scripts/advanced_multi_crawler.py "005930"
   
   # 여러 종목 테스트
   python3 scripts/advanced_multi_crawler.py "005930,000660,035420"
   ```

3. **성능 모니터링**
   - `/health` 엔드포인트 활용
   - CloudWatch 또는 Prometheus 설정

## 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 지원 (Support)

문제가 있거나 도움이 필요한 경우:
- GitHub Issues 생성
- 이메일: [your-email@example.com]

---

**Note**: 이 시스템은 교육 및 연구 목적으로 제작되었습니다. 실제 거래에 사용하기 전에 충분한 테스트를 거치시기 바랍니다.