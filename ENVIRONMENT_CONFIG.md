# 환경별 설정 가이드

## 🔧 개발 환경 (Development)

### 포트 매핑
| 서비스 | 호스트 포트 | 컨테이너 포트 | 설명 |
|--------|------------|--------------|------|
| PostgreSQL | 5433 | 5432 | 데이터베이스 |
| Redis | 6380 | 6379 | 캐시 서버 |
| Backend | 5002 | 5001 | API 서버 |
| Frontend | 3002 | 5173 | Vite 개발 서버 |

### API 설정
- Frontend → Backend: `http://localhost:5002/api`
- WebSocket: `http://localhost:5002`

### 실행 명령어
```bash
docker compose up -d
```

## 🚀 프로덕션 환경 (Production)

### 포트 매핑
| 서비스 | 외부 포트 | 내부 포트 | 설명 |
|--------|----------|----------|------|
| Nginx | 80, 443 | 80, 443 | 웹서버/리버스 프록시 |
| Backend | - | 5000 | API 서버 (내부 통신만) |
| PostgreSQL | - | 5432 | 데이터베이스 (내부 통신만) |
| Redis | - | 6379 | 캐시 서버 (내부 통신만) |

### 도메인 및 API 설정
- 도메인: `https://경제교실.com` (자동으로 HTTPS로 리다이렉트)
- API 엔드포인트: `https://경제교실.com/api`
- WebSocket: `wss://경제교실.com/socket.io`

### 네트워크 구조
```
인터넷 → Nginx (80/443) → Backend (5000)
                        ↘ Frontend (정적 파일)
```

### 실행 명령어
```bash
# 프론트엔드 빌드
./scripts/build-frontend.sh

# 컨테이너 실행
docker compose -f docker-compose.prod.yml up -d --build
```

## 📦 컨테이너 이름
모든 환경에서 동일:
- `mathematical-economics-postgres`
- `mathematical-economics-redis`
- `mathematical-economics-backend`
- `mathematical-economics-nginx` (프로덕션 전용)
- `mathematical-economics-certbot` (SSL 인증서 관리)

## 🔍 환경 변수

### Backend (.env)
```env
# 개발환경
PORT=5001
DATABASE_URL=postgresql://mathuser:mathpass123@mathematical-economics-postgres:5432/mathematical_economics
REDIS_URL=redis://mathematical-economics-redis:6379
CORS_ORIGIN=http://localhost:3002

# 프로덕션환경 (docker-compose.prod.yml에서 설정)
PORT=5000
CORS_ORIGIN=https://경제교실.com,https://xn--289aykm66cwye.com,https://www.경제교실.com,https://www.xn--289aykm66cwye.com
```

### Frontend
- 개발: `.env` 파일 사용
- 프로덕션: Nginx를 통한 프록시로 상대 경로 사용 (`/api`)

## 🔐 SSL 인증서 설정

### 최초 인증서 발급
```bash
# Certbot으로 인증서 발급
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d 경제교실.com -d www.경제교실.com \
  -d xn--289aykm66cwye.com -d www.xn--289aykm66cwye.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

### 인증서 자동 갱신
Certbot 컨테이너가 12시간마다 자동으로 인증서를 갱신합니다.

## ⚠️ 주의사항

1. **프로덕션 보안**: 
   - 백엔드, DB, Redis는 외부에서 직접 접근 불가
   - 모든 트래픽은 Nginx를 통해서만 처리
   - HTTPS 강제 적용

2. **프로덕션 배포 시**: 
   - 프론트엔드 빌드 필수 (`./scripts/build-frontend.sh`)
   - `--build` 플래그로 백엔드 이미지 재빌드

3. **데이터베이스 초기화**: 
   - 첫 실행 시 Prisma 마이그레이션 필요
   ```bash
   docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

## 🐛 문제 해결

### API 연결 실패
1. Nginx 설정 확인
2. 백엔드 컨테이너 상태 확인
3. CORS 설정 확인

### 컨테이너 시작 실패
```bash
# 로그 확인
docker compose -f docker-compose.prod.yml logs [서비스명]

# 상태 확인
docker compose -f docker-compose.prod.yml ps

# 완전 재시작
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

### SSL 인증서 문제
```bash
# 인증서 상태 확인
docker compose -f docker-compose.prod.yml exec nginx ls -la /etc/letsencrypt/live/

# Nginx 설정 테스트
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```