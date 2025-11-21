# 경제수학 모의주식 투자 교육 플랫폼
## Mathematical Economics Stock Investment Education Platform

### 작품 정보
- **작품명**: 경제수학 모의주식 투자 교육 플랫폼
- **영문명**: Mathematical Economics Stock Investment Education Platform
- **저작자**: 지훈콩 (JihunKong)
- **창작완료일**: 2025년 6월 22일
- **버전**: v1.0.0

---

## 작품 개요

본 작품은 고등학생을 대상으로 한 **교육용 모의주식 투자 플랫폼**입니다. 실제 주식 시장 데이터를 활용하여 안전한 환경에서 투자 학습을 할 수 있는 웹 애플리케이션으로, 다음과 같은 독창적인 특징을 가지고 있습니다.

### 핵심 혁신 기술

#### 1. 다중 소스 실시간 주식 데이터 시스템
- KRX API, 네이버 금융, Yahoo Finance 등 다중 데이터 소스
- 지능적 폴백 메커니즘으로 99.9% 가용성 보장
- 실시간 가격 업데이트 및 캐싱 최적화

#### 2. 교육 특화 거래 시스템
- 모든 거래에 수학적/경제적 근거 작성 의무
- 일일 거래 제한으로 신중한 투자 학습 유도
- 교사가 설정한 종목만 거래 가능한 큐레이션 시스템

#### 3. 클래스 기반 학습 관리
- 교사 중심의 학급 관리 시스템
- 실시간 학생 투자 성과 모니터링
- 개인별 맞춤 학습 분석 및 피드백

#### 4. 고가용성 보안 시스템
- JWT 키 자동 갱신 시스템으로 서버 안정성 확보
- 다층 보안 구조 및 권한 기반 접근 제어
- 실시간 모니터링 및 이상 탐지

---

## 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **ORM**: Prisma
- **WebSocket**: Socket.io

### Infrastructure
- **Containerization**: Docker
- **Web Server**: Nginx
- **Process Manager**: PM2
- **Monitoring**: Winston Logger

---

## 디렉토리 구조

```
copyright-submission/
├── backend-clean/           # 백엔드 소스코드
│   ├── src/
│   │   ├── controllers/     # API 컨트롤러
│   │   ├── services/        # 비즈니스 로직
│   │   ├── middleware/      # 미들웨어
│   │   ├── routes/          # 라우팅
│   │   ├── config/          # 설정
│   │   ├── utils/           # 유틸리티
│   │   └── types/           # 타입 정의
│   ├── prisma/              # 데이터베이스 스키마
│   ├── package.json
│   └── tsconfig.json
├── frontend-clean/          # 프론트엔드 소스코드
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── store/           # 상태 관리
│   │   ├── services/        # API 서비스
│   │   ├── hooks/           # 커스텀 훅
│   │   └── utils/           # 유틸리티
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md               # 이 파일
```

---

## 파일 현황

### Backend (86개 파일)
- **Controllers**: 10개 - API 엔드포인트 처리
- **Services**: 21개 - 핵심 비즈니스 로직
- **Middleware**: 10개 - 인증, 보안, 검증
- **Routes**: 12개 - API 라우팅 설정
- **Config**: 5개 - 데이터베이스, JWT, Redis 설정
- **Utils**: 6개 - 공통 유틸리티 함수
- **Types**: 5개 - TypeScript 타입 정의
- **기타**: 17개 - Jobs, Tests, Scripts

### Frontend (37개 파일)
- **Pages**: 13개 - 메인 페이지 컴포넌트
- **Components**: 6개 - 재사용 컴포넌트
- **Store**: 5개 - Redux 상태 관리
- **Services**: 2개 - API 통신
- **Hooks**: 2개 - 커스텀 React 훅
- **Utils**: 2개 - 공통 유틸리티
- **기타**: 7개 - 설정 및 타입 파일

---

## 주요 특징

### 1. 교육적 가치
- 실제 주식 시장 데이터 활용한 현실적 학습 환경
- 거래 근거 작성으로 논리적 사고력 강화
- 수학적 분석 도구를 통한 데이터 해석 능력 향상

### 2. 기술적 혁신
- 다중 소스 데이터 수집으로 높은 안정성 확보
- 실시간 WebSocket 통신으로 즉각적인 데이터 업데이트
- 지능형 캐싱 시스템으로 빠른 응답 속도

### 3. 확장성 및 유지보수성
- 마이크로서비스 아키텍처로 독립적 확장 가능
- TypeScript 사용으로 코드 안정성 확보
- 체계적인 에러 처리 및 로깅 시스템

---

## 독창성 및 창작성

본 시스템은 다음과 같은 독창적인 요소들로 구성되어 있습니다:

1. **다중 소스 데이터 통합 알고리즘**: 여러 주식 데이터 API를 지능적으로 통합하여 99.9% 가용성을 달성하는 독창적인 시스템

2. **교육 특화 거래 제약 엔진**: 일반 투자 앱과 달리 교육 목적에 최적화된 거래 제한 및 학습 분석 기능

3. **실시간 학습 모니터링 시스템**: 교사가 학생들의 투자 성과와 학습 진도를 실시간으로 추적할 수 있는 혁신적인 관리 도구

4. **JWT 키 자동 관리 시스템**: 서버 재시작 시에도 세션을 유지하며 보안을 강화하는 독창적인 인증 시스템

---

## 저작권 정보

- **저작권자**: 지훈콩 (JihunKong)
- **저작권 종류**: 컴퓨터프로그램저작물
- **창작 완료일**: 2025년 6월 22일
- **라이선스**: MIT License (상업적 이용 허가)

---

*본 소스코드는 저작권 등록을 위해 주석 및 디버깅 코드를 정리한 버전입니다.*