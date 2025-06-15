# 배포 가이드 (Deployment Guide)

## 🚀 빠른 수정 (Quick Fix)

현재 발생한 데이터베이스 스키마 문제를 해결하려면:

```bash
# SSH로 라이트세일 서버 접속 후
cd /home/ubuntu/mathematical-economics

# 데이터베이스 스키마 수정 스크립트 실행
chmod +x backend/scripts/fix-database.sh
./backend/scripts/fix-database.sh
```

## 📋 전체 배포 프로세스

### 1. 코드 업데이트 및 배포

```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 백엔드 재빌드 및 재시작
sudo docker compose -f docker-compose.prod.yml down
sudo docker compose -f docker-compose.prod.yml build backend
sudo docker compose -f docker-compose.prod.yml up -d

# 3. 데이터베이스 스키마 동기화
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# 4. 초기화 스크립트 실행
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js
```

### 2. 개별 명령어

#### 데이터베이스 관련
```bash
# Prisma 스키마 적용 (기존 데이터 유지)
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push

# Prisma 스키마 강제 적용 (데이터 손실 가능)
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss

# 데이터베이스 상태 확인
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db pull
```

#### 서비스 관리
```bash
# 전체 서비스 재시작
sudo docker compose -f docker-compose.prod.yml restart

# 백엔드만 재시작
sudo docker compose -f docker-compose.prod.yml restart backend

# 로그 확인
sudo docker compose -f docker-compose.prod.yml logs -f backend

# 서비스 상태 확인
sudo docker compose -f docker-compose.prod.yml ps
```

#### 초기 데이터 설정
```bash
# 관리자 계정 생성 및 초기 데이터 설정
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js

# 주식 데이터 가져오기
sudo docker compose -f docker-compose.prod.yml exec backend python3 scripts/fetch_stock_data.py
```

## 🔧 문제 해결

### 1. "The column Stock.nameEn does not exist" 오류

```bash
# Prisma 스키마를 데이터베이스에 적용
sudo docker compose -f docker-compose.prod.yml exec backend npx prisma db push --accept-data-loss
```

### 2. Redis 연결 오류

```bash
# Redis 재시작
sudo docker compose -f docker-compose.prod.yml restart redis

# Redis 연결 테스트
sudo docker compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### 3. 로그인 실패

```bash
# 관리자 계정 재생성
sudo docker compose -f docker-compose.prod.yml exec backend node scripts/initialize.js
```

## 📊 모니터링

### 로그 확인
```bash
# 실시간 로그
sudo docker compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
sudo docker compose -f docker-compose.prod.yml logs -f backend
sudo docker compose -f docker-compose.prod.yml logs -f frontend

# 최근 100줄 로그
sudo docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### 헬스체크
```bash
# API 헬스체크
curl http://localhost:5001/api/health

# 프론트엔드 확인
curl http://localhost:8081
```

## 🔑 기본 계정 정보

- **관리자 계정**
  - 이메일: purusil55@gmail.com
  - 비밀번호: alsk2004A!@#

- **테스트 교사 계정**
  - 이메일: teacher@test.com
  - 비밀번호: teacher123!

## 🚨 주의사항

1. `npx prisma db push --accept-data-loss` 명령은 스키마 변경 시 데이터 손실이 발생할 수 있습니다.
2. 프로덕션 환경에서는 항상 데이터베이스 백업을 먼저 수행하세요.
3. 초기화 스크립트는 멱등성이 있어 여러 번 실행해도 안전합니다.

## 📱 접속 정보

- **프론트엔드**: http://43.203.121.32:8081
- **백엔드 API**: http://43.203.121.32:5001

## 🔄 자동 배포 스크립트

전체 배포 프로세스를 자동화하려면:

```bash
# 배포 스크립트 생성
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```