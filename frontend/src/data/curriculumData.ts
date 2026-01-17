// 2022 개정 교육과정 연계 데이터

// 6개 교과목 정의
export type SubjectCode = 'ECON_MATH' | 'BASIC_MATH' | 'COMMON_SOC1' | 'COMMON_SOC2' | 'ECONOMICS' | 'INTEGRATED_SOC';

export interface CurriculumSubject {
  code: SubjectCode;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  grade: string;
  description: string;
}

export const CURRICULUM_SUBJECTS: Record<SubjectCode, CurriculumSubject> = {
  ECON_MATH: {
    code: 'ECON_MATH',
    name: '경제수학',
    color: '#3B82F6',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    grade: '고2-3',
    description: '경제 현상을 수학적으로 분석하고 해석하는 능력을 기릅니다.'
  },
  BASIC_MATH: {
    code: 'BASIC_MATH',
    name: '기초수학',
    color: '#10B981',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-300',
    grade: '고1',
    description: '실생활에 필요한 기초적인 수학 개념을 학습합니다.'
  },
  COMMON_SOC1: {
    code: 'COMMON_SOC1',
    name: '공통사회1',
    color: '#F59E0B',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    grade: '고1',
    description: '시민으로서 필요한 사회 인식과 참여 능력을 기릅니다.'
  },
  COMMON_SOC2: {
    code: 'COMMON_SOC2',
    name: '공통사회2',
    color: '#EF4444',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    grade: '고1',
    description: '글로벌 시대의 사회 현상을 이해하고 분석합니다.'
  },
  ECONOMICS: {
    code: 'ECONOMICS',
    name: '경제',
    color: '#8B5CF6',
    bgColor: 'bg-violet-100',
    borderColor: 'border-violet-300',
    grade: '고2-3',
    description: '경제 원리와 현상을 체계적으로 학습합니다.'
  },
  INTEGRATED_SOC: {
    code: 'INTEGRATED_SOC',
    name: '통합사회',
    color: '#EC4899',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300',
    grade: '고1',
    description: '다양한 사회 현상을 통합적 관점에서 탐구합니다.'
  }
};

// 성취기준 정의
export interface AchievementStandard {
  code: string;
  subject: SubjectCode;
  description: string;
  unit?: string;
}

export const ACHIEVEMENT_STANDARDS: Record<string, AchievementStandard> = {
  // 경제수학
  '12경수01-02': {
    code: '12경수01-02',
    subject: 'ECON_MATH',
    description: '경제 현상을 수학적으로 모델링하고 해석한다',
    unit: '경제 모델링'
  },
  '12경수02-01': {
    code: '12경수02-01',
    subject: 'ECON_MATH',
    description: '복리 계산과 현재가치를 이해하고 활용한다',
    unit: '금융 수학'
  },
  '12경수02-02': {
    code: '12경수02-02',
    subject: 'ECON_MATH',
    description: '투자 수익률을 계산하고 비교 분석한다',
    unit: '금융 수학'
  },
  '12경수03-01': {
    code: '12경수03-01',
    subject: 'ECON_MATH',
    description: '통계적 방법으로 경제 데이터를 분석한다',
    unit: '경제 통계'
  },
  '12경수03-02': {
    code: '12경수03-02',
    subject: 'ECON_MATH',
    description: '확률 개념을 활용하여 경제적 위험을 평가한다',
    unit: '경제 통계'
  },

  // 기초수학
  '기수01-03': {
    code: '기수01-03',
    subject: 'BASIC_MATH',
    description: '비율과 백분율을 실생활에 적용한다',
    unit: '비와 비율'
  },
  '기수02-01': {
    code: '기수02-01',
    subject: 'BASIC_MATH',
    description: '단순 이자와 복리를 계산한다',
    unit: '이자 계산'
  },
  '기수02-02': {
    code: '기수02-02',
    subject: 'BASIC_MATH',
    description: '백분율 증가와 감소를 계산한다',
    unit: '백분율 계산'
  },
  '기수03-01': {
    code: '기수03-01',
    subject: 'BASIC_MATH',
    description: '간단한 통계 자료를 해석한다',
    unit: '통계 기초'
  },

  // 공통사회1
  '10공사1-02': {
    code: '10공사1-02',
    subject: 'COMMON_SOC1',
    description: '경제생활과 합리적 선택을 이해한다',
    unit: '경제생활'
  },
  '10공사1-03': {
    code: '10공사1-03',
    subject: 'COMMON_SOC1',
    description: '시장경제의 원리를 설명한다',
    unit: '시장경제'
  },
  '10공사1-04': {
    code: '10공사1-04',
    subject: 'COMMON_SOC1',
    description: '금융의 역할과 합리적 금융생활을 이해한다',
    unit: '금융생활'
  },

  // 공통사회2
  '10공사2-04': {
    code: '10공사2-04',
    subject: 'COMMON_SOC2',
    description: '글로벌 경제의 특징과 영향을 분석한다',
    unit: '글로벌 경제'
  },
  '10공사2-05': {
    code: '10공사2-05',
    subject: 'COMMON_SOC2',
    description: '국제 무역과 환율의 영향을 이해한다',
    unit: '국제 무역'
  },

  // 경제
  '12경제02-01': {
    code: '12경제02-01',
    subject: 'ECONOMICS',
    description: '시장 경제에서 가격이 결정되는 원리를 이해한다',
    unit: '시장과 가격'
  },
  '12경제02-02': {
    code: '12경제02-02',
    subject: 'ECONOMICS',
    description: '다양한 시장의 유형과 특징을 비교 분석한다',
    unit: '시장 유형'
  },
  '12경제02-03': {
    code: '12경제02-03',
    subject: 'ECONOMICS',
    description: '자산 관리의 원칙을 알고 이를 생애 주기에 적용한다',
    unit: '자산 관리'
  },
  '12경제03-01': {
    code: '12경제03-01',
    subject: 'ECONOMICS',
    description: '금융 상품의 특성과 위험을 이해한다',
    unit: '금융과 투자'
  },

  // 통합사회
  '10통사06-01': {
    code: '10통사06-01',
    subject: 'INTEGRATED_SOC',
    description: '시장경제의 기본 원리를 이해한다',
    unit: '시장과 경제'
  },
  '10통사06-02': {
    code: '10통사06-02',
    subject: 'INTEGRATED_SOC',
    description: '합리적 선택의 의미와 한계를 파악한다',
    unit: '합리적 선택'
  },
  '10통사06-03': {
    code: '10통사06-03',
    subject: 'INTEGRATED_SOC',
    description: '금융 생활의 중요성과 신용 관리를 이해한다',
    unit: '금융 생활'
  }
};

// 개념-교과 매핑
export interface ConceptCurriculumMapping {
  linkedSubjects: SubjectCode[];
  linkedStandards: string[];
  mathFormula?: {
    formula: string;
    variables: string;
    example: string;
  };
}

export const CONCEPT_CURRICULUM_MAP: Record<string, ConceptCurriculumMapping> = {
  // 기초 개념
  '주식': {
    linkedSubjects: ['ECONOMICS', 'COMMON_SOC1'],
    linkedStandards: ['12경제02-03', '10공사1-04']
  },
  '주식시장': {
    linkedSubjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['12경제02-01', '10통사06-01']
  },
  '시가총액': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수01-02', '12경제02-01'],
    mathFormula: {
      formula: '시가총액 = 주가 × 발행주식수',
      variables: '주가(P), 발행주식수(N)',
      example: '주가 7만원 × 60억주 = 420조원'
    }
  },
  '거래량': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수03-01', '12경제02-01']
  },
  '매수/매도': {
    linkedSubjects: ['ECONOMICS', 'COMMON_SOC1'],
    linkedStandards: ['12경제02-01', '10공사1-02']
  },

  // 투자 지표
  'PER (주가수익비율)': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수01-02', '12경제02-03'],
    mathFormula: {
      formula: 'PER = 주가 ÷ EPS',
      variables: '주가(P), 주당순이익(EPS)',
      example: '주가 10만원 ÷ EPS 1만원 = PER 10배'
    }
  },
  'PBR (주가순자산비율)': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수01-02', '12경제02-03'],
    mathFormula: {
      formula: 'PBR = 주가 ÷ BPS',
      variables: '주가(P), 주당순자산(BPS)',
      example: '주가 5만원 ÷ BPS 6.25만원 = PBR 0.8배'
    }
  },
  'ROE (자기자본이익률)': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수02-02', '12경제02-03'],
    mathFormula: {
      formula: 'ROE = (순이익 ÷ 자기자본) × 100%',
      variables: '순이익(NI), 자기자본(E)',
      example: '순이익 150억 ÷ 자기자본 1000억 × 100% = ROE 15%'
    }
  },
  'EPS (주당순이익)': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수01-02', '12경제02-03'],
    mathFormula: {
      formula: 'EPS = 순이익 ÷ 발행주식수',
      variables: '순이익(NI), 발행주식수(N)',
      example: '순이익 1조원 ÷ 1억주 = EPS 10,000원'
    }
  },
  'BPS (주당순자산)': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수01-02', '12경제02-03'],
    mathFormula: {
      formula: 'BPS = 순자산 ÷ 발행주식수',
      variables: '순자산(NA), 발행주식수(N)',
      example: '순자산 10조원 ÷ 1억주 = BPS 10만원'
    }
  },
  '배당수익률': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수02-02', '12경제03-01'],
    mathFormula: {
      formula: '배당수익률 = (주당배당금 ÷ 주가) × 100%',
      variables: '주당배당금(D), 주가(P)',
      example: '배당금 2,500원 ÷ 주가 5만원 × 100% = 5%'
    }
  },

  // 경제 원리
  '기회비용': {
    linkedSubjects: ['COMMON_SOC1', 'ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['10공사1-02', '12경제02-03', '10통사06-02']
  },
  '분산투자': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS', 'COMMON_SOC2'],
    linkedStandards: ['12경수03-02', '12경제03-01', '10공사2-04']
  },
  '포트폴리오': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수03-02', '12경제03-01']
  },
  '수익률': {
    linkedSubjects: ['BASIC_MATH', 'ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['기수01-03', '12경수02-02', '12경제03-01'],
    mathFormula: {
      formula: '수익률 = (현재가치 - 투자원금) ÷ 투자원금 × 100%',
      variables: '현재가치(V), 투자원금(I)',
      example: '(120만원 - 100만원) ÷ 100만원 × 100% = 20%'
    }
  },
  '위험(리스크)': {
    linkedSubjects: ['ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['12경수03-02', '12경제03-01']
  },
  '상관관계': {
    linkedSubjects: ['ECON_MATH'],
    linkedStandards: ['12경수03-01', '12경수03-02'],
    mathFormula: {
      formula: '상관계수 범위: -1 ≤ ρ ≤ 1',
      variables: '상관계수(ρ)',
      example: 'ρ = 1 (완전 양의 상관), ρ = -1 (완전 음의 상관), ρ = 0 (무상관)'
    }
  },
  '복리': {
    linkedSubjects: ['BASIC_MATH', 'ECON_MATH', 'ECONOMICS'],
    linkedStandards: ['기수02-01', '12경수02-01', '12경제02-03'],
    mathFormula: {
      formula: '미래가치 = 현재가치 × (1 + 이자율)^기간',
      variables: '현재가치(PV), 이자율(r), 기간(n)',
      example: '100만원 × (1 + 0.1)^7 ≈ 194.9만원 (7년 후 약 2배)'
    }
  },

  // 투자 전략
  '가치투자': {
    linkedSubjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['12경제02-03', '10통사06-02']
  },
  '성장투자': {
    linkedSubjects: ['ECONOMICS'],
    linkedStandards: ['12경제02-03', '12경제03-01']
  },
  '배당투자': {
    linkedSubjects: ['ECONOMICS', 'ECON_MATH'],
    linkedStandards: ['12경제03-01', '12경수02-02']
  },
  '적립식 투자': {
    linkedSubjects: ['BASIC_MATH', 'ECONOMICS'],
    linkedStandards: ['기수02-01', '12경제02-03']
  },

  // 행동경제학
  '손실회피': {
    linkedSubjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['12경제02-03', '10통사06-02']
  },
  '확증편향': {
    linkedSubjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['12경제02-03', '10통사06-02']
  },
  '매몰비용 오류': {
    linkedSubjects: ['COMMON_SOC1', 'ECONOMICS'],
    linkedStandards: ['10공사1-02', '12경제02-03']
  },
  '군중심리 (허딩)': {
    linkedSubjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['12경제02-01', '10통사06-01']
  },
  '과신 편향': {
    linkedSubjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    linkedStandards: ['12경제02-03', '10통사06-02']
  }
};

// 활동 유형 정의
export type ActivityType = 'individual' | 'group' | 'club' | 'autonomous';

export interface Activity {
  id: string;
  title: string;
  description: string;
  subjects: SubjectCode[];
  standards: string[];
  duration: string;
  type: ActivityType;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  materials?: string[];
  steps: string[];
  assessment?: string;
  worksheetUrl?: string;
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'PER/PBR 계산 실습',
    description: '실제 기업 데이터를 활용하여 PER과 PBR을 직접 계산하고 투자 가치를 평가합니다.',
    subjects: ['ECON_MATH', 'ECONOMICS'],
    standards: ['12경수01-02', '12경제02-03'],
    duration: '45분',
    type: 'individual',
    difficulty: 'intermediate',
    materials: ['계산기', '재무제표 자료', '활동지'],
    steps: [
      '관심 기업 3개를 선정합니다',
      '각 기업의 주가, 순이익, 순자산 데이터를 수집합니다',
      'EPS와 BPS를 계산합니다',
      'PER과 PBR을 계산합니다',
      '동일 업종 평균과 비교하여 저평가/고평가를 판단합니다',
      '투자 의견을 작성합니다'
    ],
    assessment: 'PER, PBR 계산의 정확성과 투자 분석의 논리성을 평가합니다.'
  },
  {
    id: 'act-2',
    title: '복리 계산기 만들기',
    description: '엑셀이나 코드를 활용하여 복리 계산기를 직접 만들고, 장기 투자의 효과를 시각화합니다.',
    subjects: ['BASIC_MATH', 'ECON_MATH'],
    standards: ['기수02-01', '12경수02-01'],
    duration: '50분',
    type: 'individual',
    difficulty: 'basic',
    materials: ['컴퓨터', '엑셀 또는 구글 스프레드시트'],
    steps: [
      '복리 공식을 이해합니다',
      '엑셀에서 복리 계산 함수를 작성합니다',
      '투자 원금, 이자율, 기간을 입력받는 셀을 만듭니다',
      '연도별 자산 증가 그래프를 만듭니다',
      '72의 법칙을 검증합니다',
      '다양한 시나리오를 비교합니다'
    ],
    assessment: '복리 계산의 정확성과 시각화 결과물을 평가합니다.'
  },
  {
    id: 'act-3',
    title: '수익률 비교 분석',
    description: '여러 투자 상품의 수익률을 계산하고 비교하여 최적의 투자 선택을 찾아봅니다.',
    subjects: ['BASIC_MATH', 'ECON_MATH', 'ECONOMICS'],
    standards: ['기수01-03', '12경수02-02', '12경제03-01'],
    duration: '40분',
    type: 'individual',
    difficulty: 'basic',
    materials: ['계산기', '수익률 데이터', '활동지'],
    steps: [
      '5가지 가상 투자 상품 데이터를 받습니다',
      '각 상품의 수익률을 계산합니다',
      '연환산 수익률로 변환합니다',
      '위험도와 수익률의 관계를 분석합니다',
      '자신의 투자 성향에 맞는 상품을 선택합니다'
    ],
    assessment: '수익률 계산의 정확성과 투자 판단의 논리성을 평가합니다.'
  },
  {
    id: 'act-4',
    title: '포트폴리오 분산효과 검증',
    description: '실제 주식 데이터를 활용하여 분산투자의 위험 감소 효과를 직접 확인합니다.',
    subjects: ['ECON_MATH', 'ECONOMICS'],
    standards: ['12경수03-02', '12경제03-01'],
    duration: '60분',
    type: 'group',
    difficulty: 'advanced',
    materials: ['컴퓨터', '주식 가격 데이터', '스프레드시트'],
    steps: [
      '업종이 다른 5개 종목을 선정합니다',
      '각 종목의 과거 1년 수익률 데이터를 수집합니다',
      '개별 종목의 변동성(표준편차)을 계산합니다',
      '동일 비중 포트폴리오의 변동성을 계산합니다',
      '분산투자 효과를 수치로 확인합니다',
      '결과를 모둠별로 발표합니다'
    ],
    assessment: '통계 계산의 정확성과 분산효과 분석의 타당성을 평가합니다.'
  },
  {
    id: 'act-5',
    title: '기회비용 의사결정 게임',
    description: '다양한 투자 시나리오에서 기회비용을 고려한 의사결정을 연습합니다.',
    subjects: ['COMMON_SOC1', 'ECONOMICS', 'INTEGRATED_SOC'],
    standards: ['10공사1-02', '12경제02-03', '10통사06-02'],
    duration: '45분',
    type: 'group',
    difficulty: 'basic',
    materials: ['시나리오 카드', '의사결정 워크시트'],
    steps: [
      '4인 모둠을 구성합니다',
      '각 라운드별 투자 시나리오 카드를 받습니다',
      '선택지별 기회비용을 분석합니다',
      '모둠 토론 후 최종 결정을 내립니다',
      '결과를 확인하고 기회비용을 계산합니다',
      '최적 전략을 토론합니다'
    ],
    assessment: '기회비용 개념 적용의 적절성과 의사결정 과정의 합리성을 평가합니다.'
  },
  {
    id: 'act-6',
    title: '글로벌 기업 분석',
    description: '해외 주요 기업을 분석하여 글로벌 경제와 투자의 관계를 이해합니다.',
    subjects: ['COMMON_SOC2', 'ECONOMICS'],
    standards: ['10공사2-04', '10공사2-05', '12경제02-03'],
    duration: '50분',
    type: 'group',
    difficulty: 'intermediate',
    materials: ['컴퓨터', '기업 분석 템플릿'],
    steps: [
      '모둠별로 글로벌 기업 1개를 선정합니다',
      '기업의 사업 모델과 수익 구조를 조사합니다',
      '환율이 기업 실적에 미치는 영향을 분석합니다',
      '국내 경쟁사와 비교 분석합니다',
      '투자 보고서를 작성합니다',
      '전체 발표 및 질의응답'
    ],
    assessment: '글로벌 관점의 분석 능력과 발표의 논리성을 평가합니다.'
  },
  {
    id: 'act-7',
    title: '투자 토론회',
    description: '특정 투자 주제에 대해 찬반 토론을 통해 다양한 관점을 탐색합니다.',
    subjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    standards: ['12경제02-03', '12경제03-01', '10통사06-02'],
    duration: '60분',
    type: 'group',
    difficulty: 'intermediate',
    materials: ['토론 주제 카드', '토론 평가지'],
    steps: [
      '토론 주제를 선정합니다 (예: 주식 vs 부동산, 성장주 vs 가치주)',
      '찬성팀과 반대팀으로 나눕니다',
      '10분간 입론을 준비합니다',
      '각 팀 5분씩 입론을 발표합니다',
      '교차 질의 시간을 갖습니다',
      '청중 투표로 승패를 결정합니다'
    ],
    assessment: '논거의 타당성, 반론 능력, 의사소통 능력을 평가합니다.'
  },
  {
    id: 'act-8',
    title: '뉴스 기반 투자 판단',
    description: '실제 경제 뉴스를 분석하여 투자 판단에 활용하는 연습을 합니다.',
    subjects: ['ECONOMICS', 'INTEGRATED_SOC', 'COMMON_SOC2'],
    standards: ['12경제02-01', '10통사06-01', '10공사2-04'],
    duration: '45분',
    type: 'individual',
    difficulty: 'intermediate',
    materials: ['경제 뉴스 기사 3편', '분석 워크시트'],
    steps: [
      '오늘의 주요 경제 뉴스 3편을 읽습니다',
      '각 뉴스가 어떤 산업/기업에 영향을 미치는지 분석합니다',
      '예상되는 주가 영향(상승/하락/중립)을 판단합니다',
      '투자 전략을 수립합니다',
      '1주일 후 실제 결과와 비교합니다'
    ],
    assessment: '뉴스 분석 능력과 투자 판단의 논리성을 평가합니다.'
  },
  {
    id: 'act-9',
    title: '모의 투자 대회',
    description: '동아리 또는 학급 단위로 일정 기간 모의 투자 대회를 진행합니다.',
    subjects: ['ECON_MATH', 'ECONOMICS', 'INTEGRATED_SOC'],
    standards: ['12경수02-02', '12경제02-03', '10통사06-02'],
    duration: '4주',
    type: 'club',
    difficulty: 'intermediate',
    materials: ['모의투자 앱', '투자 일지'],
    steps: [
      '대회 규칙과 평가 기준을 설정합니다',
      '동일한 가상 자금으로 시작합니다',
      '매주 투자 현황을 기록합니다',
      '중간 점검 시간에 전략을 공유합니다',
      '최종 수익률을 계산합니다',
      '우수 투자자 시상 및 전략 발표'
    ],
    assessment: '수익률, 투자 일지의 충실성, 전략의 일관성을 종합 평가합니다.'
  },
  {
    id: 'act-10',
    title: '투자 성찰 일지 작성',
    description: '자신의 투자 경험을 되돌아보고 교훈을 정리하는 성찰 활동입니다.',
    subjects: ['ECONOMICS', 'INTEGRATED_SOC'],
    standards: ['12경제02-03', '10통사06-02'],
    duration: '30분',
    type: 'autonomous',
    difficulty: 'basic',
    materials: ['성찰 일지 템플릿', '투자 기록'],
    steps: [
      '최근 1주일간의 투자 기록을 확인합니다',
      '성공적이었던 거래와 실패한 거래를 구분합니다',
      '각 거래의 결정 과정을 되돌아봅니다',
      '배운 점과 개선할 점을 작성합니다',
      '다음 주 투자 계획을 세웁니다'
    ],
    assessment: '성찰의 깊이와 자기 개선 의지를 평가합니다.'
  }
];

// 헬퍼 함수들
export function getSubjectInfo(code: SubjectCode): CurriculumSubject {
  return CURRICULUM_SUBJECTS[code];
}

export function getSubjectsByTerm(term: string): SubjectCode[] {
  const mapping = CONCEPT_CURRICULUM_MAP[term];
  return mapping?.linkedSubjects || [];
}

export function getStandardsByTerm(term: string): AchievementStandard[] {
  const mapping = CONCEPT_CURRICULUM_MAP[term];
  if (!mapping) return [];

  return mapping.linkedStandards
    .map(code => ACHIEVEMENT_STANDARDS[code])
    .filter(Boolean);
}

export function getMathFormulaByTerm(term: string) {
  return CONCEPT_CURRICULUM_MAP[term]?.mathFormula;
}

export function getActivitiesBySubject(subjectCode: SubjectCode): Activity[] {
  return ACTIVITIES.filter(activity =>
    activity.subjects.includes(subjectCode)
  );
}

export function getActivitiesByType(type: ActivityType): Activity[] {
  return ACTIVITIES.filter(activity => activity.type === type);
}

export function getAllSubjects(): CurriculumSubject[] {
  return Object.values(CURRICULUM_SUBJECTS);
}

export function getStandardsBySubject(subjectCode: SubjectCode): AchievementStandard[] {
  return Object.values(ACHIEVEMENT_STANDARDS).filter(
    standard => standard.subject === subjectCode
  );
}
