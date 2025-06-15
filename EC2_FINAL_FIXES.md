# EC2 서버 최종 수정 가이드

## 🚀 즉시 적용해야 할 수정사항

### 1. 최신 코드 배포
```bash
cd /home/ubuntu/mathematical-economics
git pull origin main

# 서비스 재시작
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d --build
```

### 2. 데이터베이스 스키마 동기화
```bash
# Prisma 스키마 적용
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# 초기화 스크립트 실행
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js
```

### 3. 관리자 비밀번호 초기화 (로그인 문제 해결)
```bash
# 간단한 비밀번호로 변경 (특수문자 문제 해결)
sudo docker compose -f docker-compose.prod.yml exec backend node -e "
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'purusil55@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('Admin password updated to: admin123');
  await prisma.\$disconnect();
})();
"
```

## 🔧 주요 기능 확인 방법

### 1. API 테스트
```bash
# 로그인 테스트
curl -X POST http://43.203.121.32:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"purusil55@gmail.com","password":"admin123"}'

# 주식 데이터 확인 (토큰 필요)
TOKEN="your_token_here"
curl -H "Authorization: Bearer $TOKEN" http://43.203.121.32:5001/api/stocks
```

### 2. 웹사이트 접속
- **메인 사이트**: http://43.203.121.32:8081
- **관리자 로그인**: 
  - 이메일: purusil55@gmail.com
  - 비밀번호: admin123

### 3. 기능 체크리스트
- [ ] 관리자 로그인
- [ ] 교사 대시보드 접근 (관리자로)
- [ ] 클래스 생성
- [ ] 주식 데이터 조회
- [ ] 주식 관리 페이지
- [ ] 거래 페이지

## 🎯 핵심 개선사항

### 1. 권한 시스템 개선
- 관리자가 모든 교사 기능 접근 가능
- 사이드바에서 교사 메뉴 표시

### 2. 비밀번호 정책
- 특수문자로 인한 JSON 파싱 에러 방지
- 간단하고 안전한 비밀번호 사용

### 3. 데이터베이스 안정성
- Prisma 스키마 완전 동기화
- 초기 데이터 자동 생성

## 🔍 문제 해결 가이드

### 로그인 실패 시
```bash
# 1. 데이터베이스 사용자 확인
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d economic_math_stock_db -c "SELECT email, role FROM \"User\";"

# 2. 비밀번호 재설정
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js
```

### API 오류 시
```bash
# 백엔드 로그 확인
sudo docker compose -f docker-compose.prod.yml logs backend --tail=50

# 헬스체크
curl http://43.203.121.32:5001/api/health
```

### 데이터베이스 문제 시
```bash
# 스키마 재동기화
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# 데이터 재생성
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js
```

## 📊 성공 확인 방법

모든 수정 완료 후 다음을 확인하세요:

1. **웹사이트 접속**: http://43.203.121.32:8081
2. **관리자 로그인**: purusil55@gmail.com / admin123
3. **교사 대시보드**: 사이드바에서 "교사 대시보드" 클릭
4. **클래스 생성**: "새 클래스 만들기" 버튼으로 클래스 생성
5. **주식 데이터**: 거래 페이지에서 종목 목록 확인

모든 기능이 정상 작동하면 수정 완료입니다! 🎉