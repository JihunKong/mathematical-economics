// 경제 개념 태그 데이터
export interface EconomicConcept {
  id: string;
  name: string;
  description: string;
  category: 'fundamental' | 'strategy' | 'market' | 'risk' | 'other';
}

export const ECONOMIC_CONCEPTS: EconomicConcept[] = [
  // 기본 분석 (Fundamental)
  {
    id: 'PER',
    name: 'PER',
    description: '주가수익비율 - 주가를 주당순이익으로 나눈 값',
    category: 'fundamental',
  },
  {
    id: 'PBR',
    name: 'PBR',
    description: '주가순자산비율 - 주가를 주당순자산으로 나눈 값',
    category: 'fundamental',
  },
  {
    id: 'EPS',
    name: 'EPS',
    description: '주당순이익 - 순이익을 발행주식수로 나눈 값',
    category: 'fundamental',
  },
  {
    id: 'ROE',
    name: 'ROE',
    description: '자기자본이익률 - 순이익을 자기자본으로 나눈 비율',
    category: 'fundamental',
  },
  {
    id: 'ROA',
    name: 'ROA',
    description: '총자산이익률 - 순이익을 총자산으로 나눈 비율',
    category: 'fundamental',
  },

  // 투자 전략 (Strategy)
  {
    id: '분산투자',
    name: '분산투자',
    description: '위험을 줄이기 위해 여러 자산에 나누어 투자',
    category: 'strategy',
  },
  {
    id: '가치투자',
    name: '가치투자',
    description: '내재가치 대비 저평가된 주식에 투자',
    category: 'strategy',
  },
  {
    id: '성장투자',
    name: '성장투자',
    description: '높은 성장 가능성이 있는 기업에 투자',
    category: 'strategy',
  },
  {
    id: '모멘텀',
    name: '모멘텀',
    description: '가격 추세를 따라 투자하는 전략',
    category: 'strategy',
  },
  {
    id: '배당',
    name: '배당투자',
    description: '배당금 수익을 목표로 하는 투자',
    category: 'strategy',
  },

  // 시장 분석 (Market)
  {
    id: '시장분석',
    name: '시장분석',
    description: '전체 시장 상황과 경기 흐름 분석',
    category: 'market',
  },
  {
    id: '기술적분석',
    name: '기술적분석',
    description: '차트와 가격 패턴을 이용한 분석',
    category: 'market',
  },
  {
    id: '기본적분석',
    name: '기본적분석',
    description: '재무제표와 기업 가치를 이용한 분석',
    category: 'market',
  },
  {
    id: '산업분석',
    name: '산업분석',
    description: '특정 산업/섹터의 동향 분석',
    category: 'market',
  },
  {
    id: '수급',
    name: '수급분석',
    description: '외국인/기관/개인 투자자 동향 분석',
    category: 'market',
  },

  // 리스크 관리 (Risk)
  {
    id: '리스크관리',
    name: '리스크관리',
    description: '투자 위험을 관리하고 손실을 제한',
    category: 'risk',
  },
  {
    id: '변동성',
    name: '변동성',
    description: '가격의 변동 정도를 고려한 투자',
    category: 'risk',
  },

  // 기타 (Other)
  {
    id: '뉴스기반',
    name: '뉴스/이벤트',
    description: '뉴스나 공시 정보 기반 투자 판단',
    category: 'other',
  },
  {
    id: '실적발표',
    name: '실적발표',
    description: '기업 실적 발표 기반 투자 판단',
    category: 'other',
  },
  {
    id: '시가총액',
    name: '시가총액',
    description: '기업의 총 시장 가치 고려',
    category: 'other',
  },
  {
    id: '거래량',
    name: '거래량',
    description: '거래량 변화를 고려한 투자',
    category: 'other',
  },
];

// 카테고리별 그룹화
export const CONCEPT_CATEGORIES = {
  fundamental: { name: '기본 분석', color: 'blue' },
  strategy: { name: '투자 전략', color: 'green' },
  market: { name: '시장 분석', color: 'purple' },
  risk: { name: '리스크 관리', color: 'orange' },
  other: { name: '기타', color: 'gray' },
} as const;

// 개념 ID로 개념 찾기
export const getConceptById = (id: string): EconomicConcept | undefined => {
  return ECONOMIC_CONCEPTS.find(c => c.id === id);
};

// 카테고리별 개념 가져오기
export const getConceptsByCategory = (category: EconomicConcept['category']): EconomicConcept[] => {
  return ECONOMIC_CONCEPTS.filter(c => c.category === category);
};
