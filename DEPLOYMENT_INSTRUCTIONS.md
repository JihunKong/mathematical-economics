# 백엔드 오류 메시지 수정 배포 안내

## 문제 상황
- 프론트엔드에서 "이 종목은 거래가 허용되지 않았습니다"라는 간단한 메시지만 받음
- 백엔드 소스코드는 상세 메시지를 보내도록 수정되었음
- 하지만 `dist/` 폴더의 컴파일된 파일은 이전 버전임

## 해결 방법

### AWS Lightsail 서버에서 실행할 명령어:

```bash
# 1. 서버에 접속
ssh -i [키파일] ubuntu@[서버IP]

# 2. 프로젝트 디렉토리로 이동
cd /path/to/mathematical-economics

# 3. 최신 코드 가져오기
git pull origin main

# 4. 백엔드 디렉토리로 이동
cd backend

# 5. 의존성 설치 (혹시 모르니)
npm install

# 6. TypeScript 컴파일
npm run build

# 7. PM2로 백엔드 재시작
pm2 restart backend

# 8. 상태 확인
pm2 status
pm2 logs backend --lines 20
```

## 확인 방법

배포 후 브라우저에서 거래 시도 시 다음과 같은 상세 메시지가 나타나야 함:

```
삼성전자(005930) 종목은 거래가 허용되지 않았습니다.

거래 제한 사유:
• 선생님이 해당 종목을 교육용으로 허용하지 않았습니다
• 안전한 학습을 위해 선별된 종목만 거래 가능합니다

해결 방법:
1. 허용된 종목 목록에서 다른 종목을 선택해주세요
2. 선생님께 해당 종목의 거래 허용을 요청해주세요
3. 관심종목 설정에서 허용된 종목만 선택하세요

참고: 교육 목적상 선생님이 승인한 종목만 거래할 수 있습니다
```

## 백엔드 로그 확인

배포 후 거래 시도 시 다음 로그들이 순서대로 나타나야 함:
- `=== BUY ROUTE START ===`
- `=== AFTER RATE LIMITER ===`
- `=== AFTER WATCHLIST CHECK ===`
- `=== AFTER FRESH PRICE CHECK ===` (여기서 상세 메시지와 함께 멈춤)

## 문제 지속 시

만약 여전히 간단한 메시지만 나온다면:
1. `pm2 logs backend` 로 로그 확인
2. `dist/services/tradingService.js` 파일에서 상세 메시지가 컴파일되었는지 확인
3. 필요시 `pm2 delete backend && pm2 start dist/index.js --name backend`로 완전 재시작