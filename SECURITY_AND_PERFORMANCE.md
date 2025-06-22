# 보안 및 성능 가이드

## 🔒 보안 강화 사항

### 1. JWT 키 관리
- **자동 키 생성**: 서버 최초 실행 시 안전한 랜덤 키 자동 생성
- **키 영속성**: `.jwt-keys.json` 파일에 저장 (권한 600)
- **키 로테이션**: 30일마다 키 로테이션 권장
- **이중 키 지원**: 이전 키로 발급된 토큰도 일정 기간 유효

```bash
# JWT 키 로테이션 (관리자만)
curl -X POST http://localhost:5000/api/admin/rotate-jwt-key \
  -H "Authorization: Bearer <admin-token>"
```

### 2. 인증 토큰 관리
- **Access Token**: 15분 유효
- **Refresh Token**: 30일 유효
- **자동 갱신**: 클라이언트에서 토큰 만료 시 자동 갱신

### 3. 보안 미들웨어
- **Rate Limiting**: 
  - 일반 API: 100 요청/분
  - 로그인 시도: 5회/15분
- **보안 헤더**: HSTS, XSS Protection, Frame Options 등
- **의심스러운 활동 감지**: SQL Injection, XSS 시도 자동 차단

### 4. 입력 검증
- 모든 사용자 입력 sanitization
- SQL Injection 방지 (Prisma ORM)
- XSS 방지

## ⚡ 성능 최적화

### 1. 캐싱 전략
```typescript
// 캐시 TTL 설정
- 주식 가격: 1분
- 리더보드: 5분
- 포트폴리오: 2분
- 정적 데이터: 1시간
```

### 2. 데이터베이스 최적화
```sql
-- 필수 인덱스
CREATE INDEX idx_transactions_user_created ON transactions(userId, createdAt);
CREATE INDEX idx_holdings_user_stock ON holdings(userId, stockId);
CREATE INDEX idx_stock_symbol ON stocks(symbol);
```

### 3. Python 크롤러 최적화
```bash
# 환경변수 설정
export PYTHON_PATH=/usr/bin/python3
```

### 4. PM2 모니터링
```bash
# PM2 모니터링 명령어
pm2 monit          # 실시간 모니터링
pm2 status         # 프로세스 상태
pm2 logs           # 로그 확인
pm2 web            # 웹 대시보드 (포트 9615)
```

## 📊 모니터링 엔드포인트

### 상태 확인
```bash
GET /api/health
```

### 상세 메트릭 (관리자 전용)
```bash
GET /api/metrics
Authorization: Bearer <admin-token>
```

응답 예시:
```json
{
  "system": {
    "cpu": {
      "usage": 12.5,
      "loadAverage": [0.5, 0.7, 0.8]
    },
    "memory": {
      "percentage": 45.2,
      "used": 1073741824
    }
  },
  "app": {
    "requestsPerMinute": 120,
    "averageResponseTime": 85,
    "errorRate": 0.5
  }
}
```

## 🧪 보안 테스트

### 보안 테스트 실행
```bash
cd tests/security
npx ts-node security-test.ts
```

테스트 항목:
- SQL Injection
- XSS
- Directory Traversal
- Authentication Bypass
- Rate Limiting
- Security Headers
- JWT Security

### 성능 테스트 실행
```bash
cd tests/performance
./run-load-test.sh
```

테스트 시나리오:
- 동시 사용자 100명
- 3분간 부하 테스트
- 주요 API 엔드포인트 테스트

## 🚨 알림 및 모니터링

### 자동 알림 조건
- 메모리 사용률 > 90%
- 에러율 > 5%
- 평균 응답 시간 > 2초
- 데이터베이스 연결 실패

### 로그 위치
```
backend/logs/
├── error.log      # 에러 로그
├── combined.log   # 전체 로그
├── pm2-error.log  # PM2 에러
└── pm2-out.log    # PM2 출력
```

## 🔧 문제 해결

### JWT 키 문제
```bash
# JWT 키 백업
cp backend/.jwt-keys.json backend/.jwt-keys.backup.json

# JWT 키 복원
cp backend/.jwt-keys.backup.json backend/.jwt-keys.json
```

### 메모리 부족
```bash
# PM2 재시작
pm2 restart backend

# 메모리 사용량 확인
pm2 monit
```

### 크롤러 실패
```bash
# Python 경로 확인
which python3

# 수동 크롤러 테스트
cd backend
/usr/bin/python3 scripts/improved_requests_crawler.py 005930
```

## 📝 체크리스트

### 배포 전 확인사항
- [ ] 모든 테스트 통과
- [ ] 보안 테스트 실행
- [ ] 환경변수 설정 확인
- [ ] JWT 키 백업
- [ ] 데이터베이스 백업

### 배포 후 확인사항
- [ ] API 상태 확인 (`/api/health`)
- [ ] 로그 에러 확인
- [ ] 모니터링 대시보드 확인
- [ ] 주요 기능 테스트