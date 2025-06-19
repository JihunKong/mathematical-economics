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
| 서비스 | 호스트 포트 | 컨테이너 포트 | 설명 |
|--------|------------|--------------|------|
| PostgreSQL | 5432 | 5432 | 데이터베이스 |
| Redis | 6380 | 6379 | 캐시 서버 |
| Backend | 5000 | 5000 | API 서버 |
| Frontend | 3000 | 80 | Nginx 웹서버 |

### API 설정
- Frontend → Backend: `/api` (Nginx 프록시 경유)
- Nginx 프록시: `http://mathematical-economics-backend:5000`
- WebSocket: `/` (Nginx 프록시 경유)

### 실행 명령어
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 📦 컨테이너 이름
모든 환경에서 동일:
- `mathematical-economics-postgres`
- `mathematical-economics-redis`
- `mathematical-economics-backend`
- `mathematical-economics-frontend`

## 🔍 환경 변수

### Backend (.env)
```env
# 개발환경
PORT=5001
DATABASE_URL=postgresql://mathuser:mathpass123@mathematical-economics-postgres:5432/mathematical_economics
REDIS_URL=redis://mathematical-economics-redis:6379

# 프로덕션환경 (docker-compose.prod.yml에서 설정)
PORT=5000
```

### Frontend
- 개발: `.env` 파일 사용
- 프로덕션: `.env.production` 또는 Docker 빌드 시 ARG로 전달

## ⚠️ 주의사항

1. **로컬 개발 시**: macOS에서는 포트 5000이 ControlCenter에서 사용될 수 있음
2. **프로덕션 배포 시**: 반드시 `--build` 플래그 사용하여 최신 코드 반영
3. **데이터베이스 초기화**: 첫 실행 시 Prisma 마이그레이션 필요

## 🐛 문제 해결

### API 연결 실패
1. 포트 매핑 확인
2. 컨테이너 간 네트워크 연결 확인
3. CORS 설정 확인

### 컨테이너 시작 실패
```bash
# 로그 확인
docker compose logs [서비스명]

# 상태 확인
docker compose ps

# 완전 재시작
docker compose down -v
docker compose up -d --build
```