# 배포 체크리스트 (Deployment Checklist)

## 📋 배포 전 확인사항 (Pre-Deployment)

### 1. 코드 준비 (Code Preparation)
- [ ] 모든 변경사항 커밋
- [ ] 최신 마스터 브랜치와 동기화
- [ ] 테스트 실행 및 통과 확인
- [ ] 환경 변수 파일 준비 (`.env.production`)

### 2. Docker 이미지 (Docker Images)
- [ ] `docker-compose build` 로컬 테스트
- [ ] 이미지 빌드 성공 확인
- [ ] 컨테이너 시작 테스트

### 3. 데이터베이스 (Database)
- [ ] 마이그레이션 파일 최신화
- [ ] 초기 데이터 (seed) 준비
- [ ] 백업 전략 수립

## 🚀 EC2 배포 단계 (EC2 Deployment Steps)

### 1. EC2 인스턴스 설정
- [ ] Ubuntu 22.04 LTS 인스턴스 생성
- [ ] 인스턴스 타입: t3.medium 이상
- [ ] 스토리지: 최소 30GB
- [ ] 보안 그룹 설정:
  - [ ] SSH (22)
  - [ ] HTTP (80)
  - [ ] HTTPS (443)
  - [ ] Backend (5001) - 내부만
- [ ] Elastic IP 할당

### 2. 도메인 설정
- [ ] 도메인 구매/준비
- [ ] Route 53 호스팅 영역 생성
- [ ] A 레코드 설정 (Elastic IP)

### 3. 서버 초기 설정
```bash
# SSH 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt install -y git curl wget vim

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 4. 애플리케이션 배포
```bash
# 코드 클론
git clone https://github.com/your-repo/mathematical-economics.git
cd mathematical-economics/backend

# 환경 변수 설정
cp .env.example .env
nano .env  # 프로덕션 값으로 수정

# 이미지 빌드 및 시작
docker-compose -f docker-compose.prod.yml up -d

# 로그 확인
docker-compose logs -f
```

### 5. Nginx 및 SSL 설정
```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 복사
sudo cp nginx.conf /etc/nginx/sites-available/math-econ
sudo ln -s /etc/nginx/sites-available/math-econ /etc/nginx/sites-enabled/

# Certbot 설치
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# SSL 인증서 발급
sudo certbot --nginx -d your-domain.com
```

### 6. 데이터베이스 초기화
```bash
# 마이그레이션 실행
docker-compose exec backend npx prisma migrate deploy

# 초기 데이터 입력
docker-compose exec backend npm run seed
```

### 7. 크롤러 설정
```bash
# Python 환경 테스트
docker-compose exec backend python3 scripts/advanced_multi_crawler.py "005930"

# Cron job 확인
docker-compose exec backend crontab -l
```

## 🔍 배포 후 확인사항 (Post-Deployment Verification)

### 1. 서비스 상태 확인
- [ ] `https://your-domain.com` 접속 확인
- [ ] API 엔드포인트 테스트:
  ```bash
  curl https://your-domain.com/api/health
  curl https://your-domain.com/api/stocks
  ```
- [ ] 프론트엔드 정상 작동

### 2. 크롤러 동작 확인
- [ ] 로그에서 크롤링 성공 확인:
  ```bash
  docker-compose logs backend | grep "Successfully crawled"
  ```
- [ ] 가격 업데이트 확인

### 3. 모니터링 설정
- [ ] CloudWatch 에이전트 설치
- [ ] 알람 설정 (CPU, 메모리, 디스크)
- [ ] 로그 수집 설정

### 4. 보안 점검
- [ ] 불필요한 포트 닫기
- [ ] SSH 키 권한 확인 (600)
- [ ] 환경 변수 파일 권한 (600)
- [ ] 정기 보안 업데이트 설정

## 🛠 문제 발생 시 (Troubleshooting)

### 크롤링 실패
1. **하드코딩 가격 업데이트**:
   ```bash
   docker-compose exec backend python3 scripts/update_hardcoded_prices.py
   ```

2. **프록시 설정 확인**:
   ```bash
   # 한국 프록시 서버 추가
   docker-compose exec backend nano scripts/advanced_multi_crawler.py
   ```

### 데이터베이스 연결 오류
```bash
# PostgreSQL 로그 확인
docker-compose logs postgres

# 연결 테스트
docker-compose exec postgres psql -U mathuser -d mathematical_economics
```

### 메모리 부족
```bash
# 스왑 파일 생성 (4GB)
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 📊 성능 최적화 (Performance Optimization)

### 1. 캐싱 설정
- [ ] Redis 메모리 제한 설정
- [ ] Nginx 캐싱 활성화
- [ ] CDN 설정 (CloudFront)

### 2. 데이터베이스 최적화
- [ ] 인덱스 생성
- [ ] 쿼리 최적화
- [ ] 커넥션 풀 크기 조정

### 3. 크롤러 최적화
- [ ] 동시 실행 수 제한
- [ ] 타임아웃 설정
- [ ] 실패 재시도 횟수 조정

## 📝 운영 관리 (Operations)

### 일일 점검
- [ ] 서비스 가용성
- [ ] 크롤러 성공률
- [ ] 디스크 사용량

### 주간 작업
- [ ] 로그 로테이션
- [ ] 데이터베이스 백업
- [ ] 보안 업데이트 확인

### 월간 작업
- [ ] 성능 리뷰
- [ ] 비용 최적화
- [ ] 보안 감사

## 🚨 비상 연락처 (Emergency Contacts)

- AWS Support: [AWS Console Support]
- Domain Registrar: [Your Registrar]
- Team Lead: [Contact Info]

---

**마지막 업데이트**: 2025년 1월 13일