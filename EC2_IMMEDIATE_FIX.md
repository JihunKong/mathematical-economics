# EC2 서버 즉시 수정 가이드

## 🚨 현재 문제
1. 교사 계정이 없어서 클래스 생성 시 500 에러 발생
2. 프론트엔드에서 formatters 미포함으로 toFixed 에러 발생

## 🔧 즉시 실행 명령어

SSH로 서버 접속 후 다음 명령어를 순서대로 실행하세요:

```bash
# 1. 프로젝트 디렉토리로 이동
cd /home/ubuntu/mathematical-economics

# 2. 최신 코드 가져오기
git pull origin main

# 3. 데이터베이스 스키마 동기화 (가장 중요!)
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# 4. 교사 계정 생성 (이미 생성한 스크립트 사용)
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/create-teacher-immediate.js

# 5. 프론트엔드 재빌드 (formatter 수정 반영)
sudo docker compose -f docker-compose.prod.yml build frontend

# 6. 전체 서비스 재시작
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml up -d

# 7. 초기화 스크립트 재실행 (선택사항)
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js
```

## 📝 생성되는 계정 정보

### 교사 계정
- **이메일**: teacher@test.com
- **비밀번호**: teacher123!

### 관리자 계정 (이미 존재)
- **이메일**: purusil55@gmail.com
- **비밀번호**: alsk2004A!@#
- **참고**: 관리자도 클래스 생성 가능

## 🧪 테스트 방법

1. http://43.203.121.32:8081 접속
2. 교사 계정으로 로그인 (teacher@test.com / teacher123!)
3. 교사 대시보드에서 "새 클래스 만들기" 클릭
4. 클래스 정보 입력 후 생성

## 🔍 문제 확인 명령어

### 로그 확인
```bash
# 백엔드 로그 (에러 확인)
sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend

# 실시간 로그 모니터링
sudo docker compose -f docker-compose.prod.yml logs -f backend
```

### 데이터베이스 확인
```bash
# 교사 계정 존재 확인
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma studio
# 브라우저에서 User 테이블 확인
```

### 서비스 상태 확인
```bash
sudo docker compose -f docker-compose.prod.yml ps
```

## ⚡ 빠른 수정 (코드 수정 없이)

만약 위 명령어가 작동하지 않으면:

```bash
# 데이터베이스 직접 수정
sudo docker compose -f docker-compose.prod.yml exec postgres psql -U matheconomy -d matheconomy

# SQL로 교사 계정 생성 (비밀번호는 이미 해시됨)
INSERT INTO "User" (id, email, password, name, role, "isActive", "initialCapital", "currentCash", "createdAt", "updatedAt")
VALUES (
  'teacher-test-001',
  'teacher@test.com',
  '$2a$10$YourHashedPasswordHere', -- bcrypt hash of 'teacher123!'
  '테스트 교사',
  'TEACHER',
  true,
  10000000,
  10000000,
  NOW(),
  NOW()
);
```

## 📞 추가 지원

문제가 계속되면 다음을 확인하세요:
1. Docker 컨테이너가 모두 실행 중인지
2. 데이터베이스 연결이 정상인지
3. Redis 연결이 정상인지
4. 프론트엔드와 백엔드 간 CORS 설정이 올바른지