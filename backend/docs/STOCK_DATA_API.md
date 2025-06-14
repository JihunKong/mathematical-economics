# 주식 데이터 API 시스템 문서

## 개요
이 시스템은 네이버 금융과 KRX(한국거래소) API를 활용하여 실시간 주식 데이터와 차트 데이터를 제공합니다.

## 아키텍처

### 데이터 소스
1. **KRX API** - 실시간 주식 가격 (장중)
2. **네이버 금융 Chart API** - 과거 차트 데이터
3. **네이버 금융 Web Scraping** - 백업 가격 데이터
4. **Yahoo Finance** - 국제 주식 데이터
5. **Mock Service** - 개발/테스트용 데이터

### 데이터 플로우

#### 실시간 가격 조회
```
1. KRX API (장중, 실시간)
   ↓ 실패 시
2. 네이버 금융 (전일 종가)
   ↓ 실패 시
3. Yahoo Finance
   ↓ 실패 시
4. Mock Data
```

#### 차트 데이터 조회
```
1. 네이버 차트 API (과거 데이터)
   +
2. KRX API (오늘 실시간 데이터)
   ↓ 실패 시
3. 데이터베이스 캐시
   ↓ 실패 시
4. Yahoo Finance
   ↓ 실패 시
5. Mock Data
```

## 서비스 구조

### 1. KRXApiService
KRX(한국거래소)에서 실시간 주식 데이터를 조회합니다.

**주요 기능:**
- 실시간 가격 조회 (장중)
- KOSPI/KOSDAQ 전체 종목 데이터
- 시장 운영 시간 확인
- 여러 종목 일괄 조회

**특징:**
- 장중에만 실시간 데이터 제공
- 1분 캐싱
- 시장별 구분 (KOSPI: STK, KOSDAQ: KSQ)

### 2. NaverChartService
네이버 금융에서 차트 데이터를 조회합니다.

**주요 기능:**
- 일/주/월 차트 데이터
- EUC-KR 인코딩 처리
- XML 파싱

**API 엔드포인트:**
```
https://fchart.stock.naver.com/sise.nhn
```

**파라미터:**
- `symbol`: 종목코드
- `timeframe`: day, week, month
- `count`: 데이터 개수
- `requestType`: 0

### 3. 통합 StockDataService
모든 데이터 소스를 통합하여 관리합니다.

**주요 기능:**
- 우선순위 기반 데이터 조회
- 캐싱 관리
- 데이터베이스 저장
- 에러 처리 및 폴백

## API 사용 예제

### 실시간 가격 조회
```typescript
const stockService = new StockDataService();
const price = await stockService.getStockPrice('005930'); // 삼성전자
```

### 차트 데이터 조회
```typescript
const chartData = await stockService.getHistoricalData('005930', '1M');
// 1개월간의 일별 데이터 + 오늘 실시간 데이터
```

### 여러 종목 일괄 조회
```typescript
const symbols = ['005930', '000660', '035720'];
const prices = await stockService.getMultipleStockPrices(symbols);
```

## 캐싱 전략

### 캐시 TTL
- **실시간 가격**: 1분
- **차트 데이터**: 1시간
- **정적 정보**: 24시간

### 캐시 키 형식
- 가격: `price:{symbol}`
- 차트: `historical:{symbol}:{period}`
- 네이버 차트: `naver-chart:{symbol}:{timeframe}:{count}`
- KRX: `krx:{symbol}`

## 에러 처리

### 일반적인 에러
1. **네트워크 에러**: 자동 재시도 (3회)
2. **API 제한**: 대기 후 재시도
3. **데이터 없음**: 다음 소스로 폴백
4. **장 마감**: 네이버 데이터 사용

### 에러 코드
- `NETWORK_ERROR`: 네트워크 연결 실패
- `API_LIMIT`: API 호출 제한 초과
- `NO_DATA`: 데이터 없음
- `MARKET_CLOSED`: 장 마감

## 성능 최적화

### 1. 병렬 처리
여러 종목 조회 시 KRX API로 일괄 조회

### 2. 캐싱
Redis 기반 다단계 캐싱

### 3. 연결 재사용
HTTP 연결 풀링

### 4. 데이터 압축
응답 데이터 gzip 압축

## 주의사항

1. **KRX API**
   - 장 운영시간(09:00-15:30)에만 실시간 데이터
   - 주말/공휴일 제외

2. **네이버 차트 API**
   - EUC-KR 인코딩 처리 필요
   - User-Agent 헤더 필수

3. **API 제한**
   - 과도한 요청 시 차단 가능
   - 적절한 딜레이 필요

## 테스트

### 단위 테스트
```bash
npm test services/stockDataService.test.ts
```

### 통합 테스트
```bash
ts-node src/test/testStockDataService.ts
```

## 향후 개선사항

1. **WebSocket 지원**
   - 실시간 가격 스트리밍

2. **더 많은 데이터 소스**
   - 다음 금융
   - 한국투자증권 API

3. **고급 차트 기능**
   - 기술적 지표
   - 보조 지표

4. **성능 개선**
   - 더 효율적인 캐싱
   - 데이터 압축