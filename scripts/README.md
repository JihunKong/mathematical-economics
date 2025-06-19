# 배포 및 관리 스크립트

이 디렉토리에는 라이트세일 배포 및 관리를 위한 스크립트가 포함되어 있습니다.

## 사전 준비

1. AWS CLI 설치 및 설정
```bash
aws configure
```

2. 환경 변수 설정
```bash
export LIGHTSAIL_INSTANCE_NAME="your-instance-name"
export LIGHTSAIL_SSH_KEY_PATH="~/.ssh/your-key.pem"
```

## 스크립트 사용법

### 1. 원클릭 배포 (deploy-lightsail.sh)

최신 코드를 라이트세일 인스턴스에 배포합니다.

```bash
./scripts/deploy-lightsail.sh
```

기능:
- 로컬 Docker 빌드 테스트
- Git 상태 확인
- 라이트세일 인스턴스에 자동 배포
- 헬스체크 수행

### 2. 배포 관리 대시보드 (deploy-dashboard.sh)

라이트세일 인스턴스를 관리하는 통합 대시보드입니다.

```bash
# 도움말 보기
./scripts/deploy-dashboard.sh help

# 서비스 상태 확인
./scripts/deploy-dashboard.sh status

# 로그 확인
./scripts/deploy-dashboard.sh logs

# 서비스 재시작
./scripts/deploy-dashboard.sh restart

# 최신 코드 배포
./scripts/deploy-dashboard.sh update

# 데이터베이스 백업
./scripts/deploy-dashboard.sh backup

# 보안 상태 확인
./scripts/deploy-dashboard.sh security

# 차단된 IP 목록 확인
./scripts/deploy-dashboard.sh blocked

# IP 차단 해제
./scripts/deploy-dashboard.sh unblock 123.456.789.0

# 실시간 모니터링
./scripts/deploy-dashboard.sh monitor
```

## 보안 기능

### 의심스러운 활동 감지 및 차단

다음과 같은 패턴을 감지하면 자동으로 IP를 차단합니다:

1. **의심스러운 URL 패턴**
   - Directory traversal (../)
   - XSS 시도 (<script>)
   - SQL injection (union select)
   - 시스템 파일 접근 (/etc/passwd, .env)

2. **의심스러운 User-Agent**
   - 취약점 스캐너 (nikto, sqlmap, nessus 등)
   - 자동화 도구 (burp, metasploit 등)

3. **Rate Limiting**
   - 일반 API: 60초당 100회
   - 로그인 시도: 15분당 5회
   - 초과 시 자동 차단

### 보안 헤더

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HTTPS 환경)
- Content Security Policy

## 모니터링

### 실시간 모니터링
```bash
./scripts/deploy-dashboard.sh monitor
```

2초마다 업데이트되는 정보:
- 컨테이너 상태
- CPU/메모리 사용량
- 최근 API 요청

### 로그 분석
```bash
# 에러 로그만 보기
./scripts/deploy-dashboard.sh logs | grep -i error

# 특정 IP의 활동 추적
./scripts/deploy-dashboard.sh logs | grep "123.456.789.0"
```

## 백업 및 복구

### 자동 백업
```bash
# 수동 백업 실행
./scripts/deploy-dashboard.sh backup

# cron으로 자동 백업 설정 (매일 새벽 3시)
0 3 * * * /home/ubuntu/mathematical-economics/scripts/deploy-dashboard.sh backup
```

백업 파일은 `~/backups/` 디렉토리에 저장되며, 7일 이상된 백업은 자동 삭제됩니다.

### 복구
```bash
# SSH로 접속
ssh -i $LIGHTSAIL_SSH_KEY_PATH ubuntu@<instance-ip>

# 백업 파일 확인
ls -lh ~/backups/

# 데이터베이스 복구
cd ~/mathematical-economics
gunzip < ~/backups/backup_20240619_120000.sql.gz | docker-compose exec -T postgres psql -U mathuser mathematical_economics
```

## 문제 해결

### API 서버가 응답하지 않을 때
1. 상태 확인: `./scripts/deploy-dashboard.sh status`
2. 로그 확인: `./scripts/deploy-dashboard.sh logs`
3. 재시작: `./scripts/deploy-dashboard.sh restart`

### 디스크 공간 부족
1. Docker 이미지 정리: `docker system prune -a`
2. 오래된 로그 삭제: `docker-compose logs --tail=0`

### 성능 저하
1. 실시간 모니터링: `./scripts/deploy-dashboard.sh monitor`
2. 리소스 사용량 확인
3. 필요시 인스턴스 업그레이드

## 보안 권장사항

1. **SSH 접근 제한**
   - 특정 IP에서만 SSH 접근 허용
   - SSH 키 기반 인증만 사용

2. **환경 변수 관리**
   - 민감한 정보는 .env 파일에만 저장
   - .env 파일은 절대 Git에 커밋하지 않음

3. **정기적인 업데이트**
   - 시스템 패키지 업데이트
   - Docker 이미지 업데이트

4. **모니터링**
   - 정기적인 보안 상태 확인
   - 의심스러운 활동 모니터링