# 경제수학 모의주식 투자 앱 - 테스트 가이드

## 테스트 구조

```
tests/
├── e2e/                    # End-to-End 테스트
│   ├── auth.spec.ts       # 인증 관련 테스트
│   ├── trading.spec.ts    # 주식 거래 테스트
│   ├── portfolio.spec.ts  # 포트폴리오 관리 테스트
│   ├── teacher.spec.ts    # 교사 기능 테스트
│   ├── leaderboard.spec.ts # 리더보드 테스트
│   ├── realtime.spec.ts   # 실시간 기능 테스트
│   └── error-messages.spec.ts # 에러 메시지 한글화 테스트
├── playwright.config.ts    # Playwright 설정
└── README.md              # 이 파일
```

## 테스트 실행

### 설치
```bash
# 루트 디렉토리에서
npm install
```

### 모든 테스트 실행
```bash
npm run test:e2e
```

### UI 모드로 테스트 실행 (디버깅용)
```bash
npm run test:e2e:ui
```

### 특정 테스트 파일만 실행
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### 특정 브라우저에서만 테스트
```bash
npx playwright test --project=chromium
```

### 테스트 리포트 보기
```bash
npm run test:e2e:report
```

## 테스트 시나리오

### 1. 인증 테스트 (auth.spec.ts)
- 로그인 페이지 접근
- 학생/교사 로그인
- 잘못된 인증 정보 처리
- 로그아웃

### 2. 주식 거래 테스트 (trading.spec.ts)
- 주식 목록 조회 및 검색
- 주식 상세 정보 확인
- 매수/매도 주문
- 관심종목 제한 확인
- 24시간 거래 제한 확인

### 3. 포트폴리오 테스트 (portfolio.spec.ts)
- 포트폴리오 개요
- 보유 종목 목록
- 거래 내역
- 성과 분석
- 현금 잔액 변동

### 4. 교사 기능 테스트 (teacher.spec.ts)
- 교사 대시보드
- 학생 관리
- 클래스 설정
- 거래 분석
- 거래 근거 검토

### 5. 리더보드 테스트 (leaderboard.spec.ts)
- 전체/클래스별 순위
- 정렬 기능
- 페이지네이션
- 통계 요약

### 6. 실시간 기능 테스트 (realtime.spec.ts)
- 실시간 가격 업데이트
- WebSocket 연결 상태
- 실시간 차트
- 실시간 알림

### 7. 에러 메시지 테스트 (error-messages.spec.ts)
- 한글 에러 메시지 표시
- 이모지 제거 확인
- 상세 설명 포함 확인

## 테스트 데이터

테스트에서 사용하는 기본 계정:
- 학생: `student@test.com` / `password123`
- 교사: `teacher@test.com` / `password123`

## 주의사항

1. 테스트 실행 전 백엔드와 프론트엔드 서버가 자동으로 시작됩니다
2. 테스트는 실제 데이터베이스를 사용하므로 테스트 데이터가 생성될 수 있습니다
3. 실시간 테스트는 네트워크 상태에 따라 결과가 달라질 수 있습니다
4. 테스트 실패 시 스크린샷과 비디오가 자동으로 저장됩니다

## CI/CD 통합

GitHub Actions 등의 CI 환경에서 실행 시:
```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
```