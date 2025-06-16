# 업데이트 및 재시작 가이드

## 🚀 빠른 시작

### 1. 전체 업데이트 및 재시작 (코드 변경사항이 있을 때)
```bash
# SSH로 서버 접속
ssh -i your-key.pem ubuntu@your-server-ip

# 업데이트 스크립트 실행
cd /home/ubuntu/mathematical-economics
chmod +x update_and_restart.sh
./update_and_restart.sh
```

### 2. 빠른 재시작 (코드 변경 없이 재시작만)
```bash
cd /home/ubuntu/mathematical-economics
chmod +x quick_restart.sh
./quick_restart.sh
```

## 📝 수동 업데이트 방법

### 1. Git 변경사항 가져오기
```bash
cd /home/ubuntu/mathematical-economics
git pull origin main
```

### 2. Docker 컨테이너 중지
```bash
docker-compose -f docker-compose.prod.yml down
```

### 3. Docker 이미지 재빌드
```bash
# 전체 재빌드 (시간이 오래 걸림)
docker-compose -f docker-compose.prod.yml build --no-cache

# 또는 특정 서비스만 재빌드
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml build backend
```

### 4. 데이터베이스 마이그레이션 (필요시)
```bash
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db push
```

### 5. 컨테이너 시작
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 상태 확인 명령어

### 컨테이너 상태 확인
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 실시간 로그 보기
```bash
# 전체 로그
docker-compose -f docker-compose.prod.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### 최근 100줄 로그 보기
```bash
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

## 🛠️ 문제 해결

### 1. 컨테이너가 계속 재시작되는 경우
```bash
# 상세 로그 확인
docker-compose -f docker-compose.prod.yml logs backend

# 컨테이너 내부 접속
docker-compose -f docker-compose.prod.yml exec backend sh
```

### 2. 포트 충돌 문제
```bash
# 사용 중인 포트 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5432

# 기존 프로세스 종료
sudo kill -9 <PID>
```

### 3. 디스크 공간 부족
```bash
# Docker 이미지 정리
docker system prune -a

# 로그 정리
docker-compose -f docker-compose.prod.yml logs --tail=0 --follow
```

### 4. 데이터베이스 초기화
```bash
# 데이터베이스 컨테이너만 재생성
docker-compose -f docker-compose.prod.yml stop postgres
docker-compose -f docker-compose.prod.yml rm -f postgres
docker-compose -f docker-compose.prod.yml up -d postgres

# 마이그레이션 재실행
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db push
```

## 🔄 자동 재시작 설정

### systemd 서비스 등록
```bash
sudo nano /etc/systemd/system/mathematical-economics.service
```

```ini
[Unit]
Description=Mathematical Economics Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/mathematical-economics
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 활성화
sudo systemctl enable mathematical-economics
sudo systemctl start mathematical-economics
```

## 📊 모니터링

### 리소스 사용량 확인
```bash
# CPU/메모리 사용량
docker stats

# 디스크 사용량
df -h
```

### 데이터베이스 백업
```bash
# 백업 생성
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres mathematical_economics > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 복원
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres mathematical_economics < backup_20240615_120000.sql
```

## 🔐 보안 팁

1. **정기적인 업데이트**
   ```bash
   # 시스템 패키지 업데이트
   sudo apt update && sudo apt upgrade -y
   
   # Docker 업데이트
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io
   ```

2. **로그 로테이션 설정**
   ```bash
   # Docker 로그 크기 제한
   echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee /etc/docker/daemon.json
   sudo systemctl restart docker
   ```

3. **방화벽 설정 확인**
   ```bash
   sudo ufw status
   ```

## 📞 지원

문제가 지속되면 다음 정보와 함께 문의하세요:
- 에러 로그 (docker-compose logs의 출력)
- 실행한 명령어
- 발생 시간