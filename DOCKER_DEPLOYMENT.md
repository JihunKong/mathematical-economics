# Docker Deployment Guide

이 가이드는 Mathematical Economics Stock Trading 앱을 Docker를 사용하여 배포하는 방법을 설명합니다.

## 사전 요구사항

- Docker 및 Docker Compose가 설치되어 있어야 합니다
- Git이 설치되어 있어야 합니다

## 배포 단계

### 1. 환경 변수 설정

`.env.docker` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값들을 설정합니다:

```bash
cp .env.docker .env
```

중요한 환경 변수들:
- `JWT_SECRET`: JWT 토큰 서명용 비밀키 (프로덕션에서는 반드시 변경)
- `JWT_REFRESH_SECRET`: Refresh 토큰용 비밀키 (프로덕션에서는 반드시 변경)
- `ALPHA_VANTAGE_API_KEY`: Alpha Vantage API 키 (선택사항)
- `KIS_APP_KEY`, `KIS_APP_SECRET`: 한국투자증권 API 키 (선택사항)

### 2. Docker Compose로 실행

```bash
# 모든 서비스 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. 데이터베이스 초기화

첫 실행 시 데이터베이스를 초기화해야 합니다:

```bash
# 데이터베이스 마이그레이션 실행 (자동으로 실행됨)
docker-compose exec backend npx prisma migrate deploy

# 초기 데이터 시드 (필요한 경우)
docker-compose exec backend npx prisma db seed
```

### 4. 접속 정보

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5001
- PostgreSQL: localhost:5432 (사용자: mathuser, 비밀번호: mathpass123)
- Redis: localhost:6379

### 5. 기본 계정

시드 데이터가 적용된 경우:
- 관리자: admin@example.com / admin123
- 교사: teacher@example.com / teacher123
- 학생: student1@example.com / student123

## EC2 배포

### 1. EC2 인스턴스 준비

```bash
# Docker 설치 (Amazon Linux 2)
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 코드 배포

```bash
# Git으로 코드 클론
git clone https://github.com/your-repo/mathematical-economics.git
cd mathematical-economics

# 환경 변수 설정
cp .env.docker .env
nano .env  # 필요한 값들 수정
```

### 3. Docker Compose 실행

```bash
# 백그라운드에서 실행
docker-compose up -d

# 상태 확인
docker-compose ps
```

### 4. 보안 그룹 설정

EC2 보안 그룹에서 다음 포트를 열어야 합니다:
- 80 (HTTP) - 프론트엔드
- 5001 (API) - 백엔드 (필요한 경우)

### 5. 도메인 연결 (선택사항)

Nginx를 리버스 프록시로 사용하여 도메인을 연결할 수 있습니다:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 유지보수

### 로그 확인
```bash
docker-compose logs -f [service-name]
```

### 서비스 재시작
```bash
docker-compose restart [service-name]
```

### 데이터베이스 백업
```bash
docker-compose exec postgres pg_dump -U mathuser mathematical_economics > backup.sql
```

### 업데이트 배포
```bash
git pull
docker-compose down
docker-compose up -d --build
```

## 문제 해결

### 포트 충돌
다른 서비스가 같은 포트를 사용하는 경우 `docker-compose.yml`에서 포트를 변경하세요.

### 메모리 부족
EC2 인스턴스의 메모리가 부족한 경우 스왑 파일을 추가하세요:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1G count=2
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 권한 문제
Docker 관련 명령 실행 시 권한 문제가 발생하면:

```bash
sudo usermod -a -G docker $USER
# 로그아웃 후 다시 로그인
```