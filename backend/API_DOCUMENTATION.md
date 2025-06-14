# Stock Data API Documentation

## Overview
주식 데이터를 외부 API에서 가져오는 서비스 구현 문서입니다.

## 구현된 기능

### 1. StockDataService (`/backend/src/services/stockDataService.ts`)
통합 주식 데이터 서비스로 여러 데이터 소스를 관리합니다.

#### 주요 기능:
- **실시간 가격 조회**: 네이버 금융, Yahoo Finance, Mock 데이터를 순차적으로 시도
- **과거 데이터 조회**: 일별/주별/월별/연도별 차트 데이터 제공
- **캐싱**: 실시간 데이터 1분, 과거 데이터 1시간 캐싱
- **데이터베이스 저장**: 조회한 데이터를 자동으로 DB에 저장
- **재시도 로직**: API 호출 실패 시 자동 재시도

### 2. StockDataUpdater (`/backend/src/utils/stockDataUpdater.ts`)
크론 작업을 통한 자동 주식 데이터 업데이트 서비스

#### 기능:
- 평일 9시-15시 30분 동안 1분마다 실행
- 매일 오전 8시 30분에 전일 종가 업데이트
- 수동 업데이트 및 백필 기능 제공

### 3. API 엔드포인트

#### 기존 엔드포인트 (개선됨):
- `GET /api/stocks` - 주식 목록 (실시간 가격 포함)
- `GET /api/stocks/:symbol/chart` - 차트 데이터 (외부 API 연동)

#### 새로운 엔드포인트:
- `GET /api/stocks/:symbol/realtime` - 실시간 가격 조회
- `POST /api/stocks/prices/multiple` - 여러 종목 가격 일괄 조회
- `GET /api/stocks/:symbol/historical` - 과거 데이터 조회

#### 관리용 엔드포인트:
- `POST /api/stock-data/update/:symbol` - 특정 종목 수동 업데이트
- `POST /api/stock-data/backfill/:symbol` - 과거 데이터 백필
- `POST /api/stock-data/cache/clear` - 캐시 초기화

## 사용 예제

### 1. 실시간 가격 조회
```bash
GET /api/stocks/005930/realtime

Response:
{
  "success": true,
  "data": {
    "symbol": "005930",
    "name": "삼성전자",
    "currentPrice": 75000,
    "previousClose": 74500,
    "change": 500,
    "changePercent": 0.67,
    "dayOpen": 74800,
    "dayHigh": 75200,
    "dayLow": 74600,
    "volume": 15234567,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. 여러 종목 가격 조회
```bash
POST /api/stocks/prices/multiple
Content-Type: application/json

{
  "symbols": ["005930", "000660", "035420"]
}

Response:
{
  "success": true,
  "data": [
    { "symbol": "005930", "name": "삼성전자", "currentPrice": 75000, ... },
    { "symbol": "000660", "name": "SK하이닉스", "currentPrice": 135000, ... },
    { "symbol": "035420", "name": "NAVER", "currentPrice": 215000, ... }
  ]
}
```

### 3. 과거 데이터 조회
```bash
GET /api/stocks/005930/historical?period=1M

Response:
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01T00:00:00.000Z",
      "open": 73000,
      "high": 73500,
      "low": 72800,
      "close": 73200,
      "volume": 12345678
    },
    ...
  ]
}
```

## 환경 변수 설정

`.env` 파일에 다음 환경 변수를 추가하세요:

```env
# Stock Data APIs
YAHOO_FINANCE_API_URL=https://query1.finance.yahoo.com
NAVER_FINANCE_URL=https://finance.naver.com
STOCK_DATA_CACHE_TTL=60000        # 1분 (밀리초)
HISTORICAL_DATA_CACHE_TTL=3600000  # 1시간 (밀리초)

# Stock Price Updater
ENABLE_STOCK_UPDATER=true  # 자동 업데이트 활성화
```

## 데이터 소스

1. **네이버 금융**: 한국 주식 실시간 가격
2. **Yahoo Finance**: 국제 주식 및 과거 데이터
3. **Mock Service**: 개발/테스트용 더미 데이터

## 에러 처리

- API 호출 실패 시 다음 소스로 자동 전환
- 최대 3회 재시도 후 실패 처리
- 모든 소스 실패 시 Mock 데이터 제공
- 상세한 에러 로깅

## 성능 최적화

- 메모리 기반 캐싱으로 빠른 응답
- 배치 처리로 API 호출 최소화
- 비동기 처리로 블로킹 방지
- API 호출 제한 관리 (Rate Limiting)

## 주의사항

1. 실제 운영 시 API 키가 필요할 수 있습니다
2. 무료 API는 호출 제한이 있으므로 캐싱을 적극 활용하세요
3. 주식시장 운영시간 외에는 가격이 업데이트되지 않습니다
4. Mock 데이터는 실제 시장 데이터와 다를 수 있습니다