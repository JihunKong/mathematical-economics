# EC2 t3.small 배포 가이드
## 경제수학 모의주식 투자 앱 - Zero-Based Optimized Version

---

## 📋 목차
1. [개요](#개요)
2. [시스템 요구사항](#시스템-요구사항)
3. [최적화 내용](#최적화-내용)
4. [배포 절차](#배포-절차)
5. [SSL 인증서 설정](#ssl-인증서-설정)
6. [모니터링 및 관리](#모니터링-및-관리)
7. [문제 해결](#문제-해결)

---

## 🎯 개요

이 문서는 **t3.small EC2 인스턴스** (2GB RAM, 2 vCPU)에 **5명의 사용자**를 위한 최적화된 버전을 배포하는 방법을 설명합니다.

### 주요 최적화 사항
- **주식 데이터**: 2,879개 → 60개 큐레이션된 글로벌 우량주
- **크롤러**: 19개 → 1개 (improved_requests_crawler.py)
- **백그라운드 작업**: 3개 → 1개 통합 작업 (unifiedPriceUpdater)
- **Puppeteer 제거**: ~170MB 절약
- **메모리 사용**: ~800MB (여유 1.2GB)
- **도메인**: 경제교실.com (xn--289aykm66cwye.com)

---

## 💻 시스템 요구사항

### EC2 인스턴스
- **타입**: t3.small
- **아키텍처**: AMD64 (x86_64)
- **RAM**: 2GB
- **vCPU**: 2 (Burstable)
- **스토리지**: 20GB EBS (SSD)
- **OS**: Ubuntu 22.04 LTS

### 네트워크
- **Elastic IP**: 고정 IP 필요
- **도메인**: 경제교실.com
- **Security Group**:
  - Inbound: 22 (SSH), 80 (HTTP), 443 (HTTPS)
  - Outbound: All

### 소프트웨어
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Python3
- OpenSSL

---

## 🚀 최적화 내용

### 1. 큐레이션된 주식 (60개)

#### 한국 우량주 (20개)
| 섹터 | 주식 | 개수 |
|------|------|------|
| IT | 삼성전자, SK하이닉스, 네이버, 카카오, LG전자 | 5 |
| 자동차 | 현대차, 기아 | 2 |
| 금융 | KB금융, 신한지주, 하나금융 | 3 |
| 엔터 | 하이브, SM, JYP | 3 |
| 식품 | CJ제일제당, 오리온, 농심 | 3 |
| 의류 | 한국콜마 | 1 |
| 에너지 | 포스코, SK이노베이션, LG화학 | 3 |

#### 미국 대기업 (25개)
| 섹터 | 주식 | 개수 |
|------|------|------|
| IT | Apple, Microsoft, Google, Amazon, Tesla, Nvidia, Meta | 7 |
| 식품 | McDonald's, Coca-Cola, PepsiCo, Starbucks, Chipotle | 5 |
| 의류 | Nike, Lululemon | 2 |
| 금융 | JPMorgan, Visa, Mastercard | 3 |
| 엔터 | Disney, Netflix, Spotify | 3 |
| 에너지 | Exxon, Chevron | 2 |
| 자동차 | Tesla (중복 제외) | - |

#### 글로벌 기업 (15개)
| 섹터 | 주식 | 개수 |
|------|------|------|
| 식품 | Nestle, Unilever, Danone | 3 |
| 의류 | LVMH, Adidas | 2 |
| IT | TSMC, Sony, ASML, Alibaba, Baidu | 5 |
| 자동차 | Toyota, BMW, Volkswagen | 3 |
| 에너지 | Shell, TotalEnergies | 2 |

### 2. 리소스 할당

```yaml
서비스           CPU 제한    메모리 제한    예상 사용
PostgreSQL       0.5 vCPU    256MB         150MB
Redis            0.25 vCPU   64MB          30MB
Backend          1.0 vCPU    512MB         400MB
Nginx            0.25 vCPU   32MB          10MB
---------------------------------------------------
합계             2.0 vCPU    864MB         590MB
여유             -           1.14GB        57% 여유
```

### 3. 백그라운드 작업

**통합 작업 (unifiedPriceUpdater)**:
- **스케줄**: 장중 15분마다 (월-금 09:00-15:30)
- **대상**: 워치리스트 주식만 (최대 50개)
- **클린업**: 매일 자정, 3일 이상된 가격 히스토리 삭제

### 4. 캐싱 전략

| 데이터 유형 | TTL | 이유 |
|------------|-----|------|
| 주식 가격 | 5분 | 교육용으로 충분 |
| 과거 데이터 | 2시간 | 자주 변경되지 않음 |
| 리더보드 | 5분 | 실시간 순위 불필요 |

---

## 📦 배포 절차

### 1단계: EC2 인스턴스 생성

```bash
# AWS CLI로 EC2 인스턴스 생성
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \  # Ubuntu 22.04 LTS (Region에 따라 변경)
  --instance-type t3.small \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxxx \
  --subnet-id subnet-xxxxxx \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=mathematical-economics}]'
```

### 2단계: Elastic IP 할당

```bash
# Elastic IP 생성
aws ec2 allocate-address --domain vpc

# Elastic IP 연결
aws ec2 associate-address --instance-id i-xxxxxx --allocation-id eipalloc-xxxxxx
```

### 3단계: 도메인 연결

1. DNS 레코드 설정:
   ```
   A Record:   경제교실.com → Elastic IP
   A Record:   www.경제교실.com → Elastic IP
   ```

2. DNS 전파 확인:
   ```bash
   dig 경제교실.com
   nslookup 경제교실.com
   ```

### 4단계: 서버 접속 및 배포

```bash
# SSH 접속
ssh -i your-key.pem ubuntu@<ELASTIC_IP>

# 배포 스크립트 다운로드 및 실행
curl -O https://raw.githubusercontent.com/your-repo/mathematical-economics/main/deployment/deploy_to_ec2.sh
chmod +x deploy_to_ec2.sh
sudo ./deploy_to_ec2.sh
```

배포 스크립트가 자동으로 수행하는 작업:
1. ✅ 시스템 패키지 업데이트
2. ✅ Docker 및 Docker Compose 설치
3. ✅ Python3 및 Git 설치
4. ✅ 2GB Swap 파일 생성
5. ✅ 리포지토리 클론
6. ✅ JWT Secret 생성
7. ✅ 환경 변수 설정
8. ✅ Docker 컨테이너 빌드 및 실행
9. ✅ 데이터베이스 마이그레이션
10. ✅ 60개 큐레이션된 주식 임포트
11. ✅ 데이터베이스 클린업

### 5단계: 배포 확인

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.t3small.yml ps

# 헬스 체크
curl http://localhost/health

# 로그 확인
docker logs math-economics-backend -f
```

---

## 🔒 SSL 인증서 설정

### Let's Encrypt 인증서 발급

```bash
# Certbot으로 SSL 인증서 발급
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d xn--289aykm66cwye.com \
  -d www.xn--289aykm66cwye.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email

# Nginx 재시작
docker-compose -f docker-compose.t3small.yml restart nginx
```

### 인증서 자동 갱신 확인

```bash
# Certbot 컨테이너가 12시간마다 자동으로 갱신 시도
docker logs math-economics-certbot
```

---

## 📊 모니터링 및 관리

### 리소스 모니터링

```bash
# 메모리 사용량
free -h

# CPU 사용량
top

# 디스크 사용량
df -h

# Docker 컨테이너 리소스
docker stats
```

### 로그 확인

```bash
# 백엔드 로그
docker logs math-economics-backend -f --tail 100

# Nginx 로그
docker logs math-economics-nginx -f --tail 100

# PostgreSQL 로그
docker logs math-economics-postgres -f --tail 100

# 모든 컨테이너 로그
docker-compose -f docker-compose.t3small.yml logs -f
```

### 데이터베이스 관리

```bash
# PostgreSQL 접속
docker exec -it math-economics-postgres psql -U mathuser -d mathematical_economics

# 데이터베이스 백업
docker exec math-economics-postgres pg_dump -U mathuser mathematical_economics > backup.sql

# VACUUM (공간 회수)
docker exec math-economics-postgres psql -U mathuser -d mathematical_economics -c "VACUUM ANALYZE;"
```

### 주기적 유지보수

```bash
# 주간 클린업 (매주 일요일 실행 권장)
docker exec math-economics-backend npm run cleanup:db

# Docker 이미지 정리 (매월)
docker system prune -a --volumes -f
```

---

## 🔧 문제 해결

### 메모리 부족

**증상**: OOM (Out of Memory) 에러, 컨테이너 재시작

**해결**:
```bash
# Swap 사용 확인
swapon --show

# 메모리 소비 많은 프로세스 확인
docker stats

# Backend 재시작
docker-compose -f docker-compose.t3small.yml restart backend
```

### CPU 크레딧 소진

**증상**: 응답 속도 저하

**해결**:
```bash
# CPU 크레딧 확인 (AWS Console 또는 CloudWatch)
# t3.small unlimited 모드 활성화 고려

# 백그라운드 작업 확인
docker exec math-economics-backend cat /app/logs/combined.log | grep "price update"
```

### 데이터베이스 연결 오류

**증상**: "Database connection failed"

**해결**:
```bash
# PostgreSQL 상태 확인
docker ps | grep postgres

# 로그 확인
docker logs math-economics-postgres

# 재시작
docker-compose -f docker-compose.t3small.yml restart postgres

# 연결 테스트
docker exec math-economics-postgres pg_isready -U mathuser
```

### SSL 인증서 문제

**증상**: "Your connection is not private" (HTTPS 오류)

**해결**:
```bash
# 인증서 경로 확인
ls -la certbot/conf/live/xn--289aykm66cwye.com/

# 인증서 갱신
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot renew

# Nginx 재시작
docker-compose -f docker-compose.t3small.yml restart nginx
```

### 컨테이너가 시작되지 않음

**해결**:
```bash
# 상세 로그 확인
docker-compose -f docker-compose.t3small.yml logs backend

# 환경 변수 확인
docker exec math-economics-backend env | grep DATABASE_URL

# 모든 컨테이너 재시작
docker-compose -f docker-compose.t3small.yml down
docker-compose -f docker-compose.t3small.yml up -d
```

---

## 📈 성능 최적화 팁

### 1. PostgreSQL 튜닝

`postgres.conf` 파일이 자동으로 최적화되어 있지만, 추가 튜닝:

```sql
-- 연결 수 확인
SELECT count(*) FROM pg_stat_activity;

-- 슬로우 쿼리 확인
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 2. Redis 캐시 효율

```bash
# Redis 통계
docker exec math-economics-redis redis-cli INFO stats

# 캐시 히트율 확인
docker exec math-economics-redis redis-cli INFO stats | grep keyspace_hits
```

### 3. Nginx 로그 분석

```bash
# 가장 많이 요청된 URL
cat nginx/logs/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -10

# 느린 응답 찾기
cat nginx/logs/access.log | awk '$NF > 1000 {print $0}'
```

---

## 💰 비용 예측

### 월간 운영 비용

| 항목 | 비용 (USD) |
|------|-----------|
| t3.small EC2 | ~$15 |
| EBS 20GB | ~$2 |
| 데이터 전송 | ~$1 |
| Elastic IP | $0 (연결 상태) |
| **합계** | **~$18/월** |

**절감액**: t3.medium 대비 약 $12/월 (40%) 절약

---

## 📞 지원 및 문의

### 유용한 리소스
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Let's Encrypt](https://letsencrypt.org/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

### 추가 도움이 필요한 경우
1. GitHub Issues에 문제 등록
2. 로그 파일 첨부
3. 시스템 정보 포함 (`docker-compose ps`, `free -h`, `df -h`)

---

**마지막 업데이트**: 2025-01-22
**작성자**: Claude Code
**버전**: 1.0 (t3.small Optimized)
