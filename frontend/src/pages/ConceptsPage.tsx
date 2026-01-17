import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  GraduationCap,
  BarChart3,
  DollarSign,
  Scale,
  Brain,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Star,
  BookmarkPlus,
  Bookmark,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight,
  Shuffle,
  Filter,
  Award
} from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import toast from 'react-hot-toast';
import {
  CURRICULUM_SUBJECTS,
  CONCEPT_CURRICULUM_MAP,
  ACHIEVEMENT_STANDARDS,
  getSubjectsByTerm,
  getStandardsByTerm,
  getMathFormulaByTerm,
  SubjectCode
} from '../data/curriculumData';

interface Concept {
  term: string;
  definition: string;
  example: string;
  formula?: string;
  formulaExplanation?: string;
  tip?: string;
  didYouKnow?: string;
  category: string;
  relatedTerms: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  quiz?: {
    question: string;
    options: string[];
    answer: number;
  };
}

const concepts: Concept[] = [
  // 기초 개념
  {
    term: '주식',
    definition: '주식회사의 자본을 구성하는 단위로, 주식을 보유하면 해당 회사의 일부를 소유하게 됩니다. 주주는 회사의 이익 배당을 받을 권리와 주주총회에서 의결권을 행사할 권리를 갖습니다.',
    example: '삼성전자 주식 1주를 보유하면 삼성전자라는 회사의 아주 작은 부분의 주인이 됩니다. 약 60억 주가 발행되어 있으므로 1주는 60억분의 1의 지분입니다.',
    tip: '주식은 크게 보통주와 우선주로 나뉩니다. 보통주는 의결권이 있고, 우선주는 의결권이 없는 대신 배당을 먼저 받습니다.',
    didYouKnow: '세계 최초의 주식회사는 1602년 설립된 네덜란드 동인도회사입니다. 이 회사가 세계 최초로 주식을 발행했습니다.',
    category: '기초',
    relatedTerms: ['주주', '배당', '의결권', '보통주', '우선주'],
    difficulty: 'basic',
    quiz: {
      question: '주식을 보유하면 갖게 되는 권리가 아닌 것은?',
      options: ['배당받을 권리', '의결권', '회사 대출 보증 의무', '잔여재산 분배청구권'],
      answer: 2
    }
  },
  {
    term: '주식시장',
    definition: '주식이 거래되는 시장입니다. 한국에는 대표적으로 코스피(KOSPI)와 코스닥(KOSDAQ)이 있으며, 투자자들이 주식을 사고팔 수 있는 공간을 제공합니다.',
    example: '코스피는 삼성전자, 현대차 같은 대기업이, 코스닥은 셀트리온, 카카오게임즈 같은 기술 성장주가 상장되어 있습니다.',
    tip: '한국 주식시장 거래시간은 오전 9시~오후 3시 30분입니다. 점심시간에도 거래가 가능합니다.',
    didYouKnow: '코스피 지수는 1980년 1월 4일을 기준(100)으로 산출됩니다. 2021년에는 3000을 처음 돌파했습니다.',
    category: '기초',
    relatedTerms: ['코스피', '코스닥', '상장', '거래소', '거래시간'],
    difficulty: 'basic',
    quiz: {
      question: '한국 주식시장의 정규 거래시간은?',
      options: ['오전 8시~오후 4시', '오전 9시~오후 3시 30분', '오전 10시~오후 5시', '24시간'],
      answer: 1
    }
  },
  {
    term: '시가총액',
    definition: '회사가 발행한 모든 주식의 시장 가치 합계입니다. 회사의 규모를 나타내는 가장 기본적인 지표로 사용됩니다.',
    example: '삼성전자의 주가가 7만원이고 발행주식수가 60억주라면, 시가총액은 420조원입니다.',
    formula: '시가총액 = 주가 × 발행주식수',
    formulaExplanation: '주가가 오르면 시가총액도 올라가고, 주가가 내리면 시가총액도 내려갑니다.',
    tip: '시가총액이 큰 기업을 대형주, 중간인 기업을 중형주, 작은 기업을 소형주라고 합니다.',
    category: '기초',
    relatedTerms: ['주가', '발행주식수', '대형주', '중형주', '소형주'],
    difficulty: 'basic',
    quiz: {
      question: '주가 5만원, 발행주식수 1억주인 회사의 시가총액은?',
      options: ['5천억원', '5조원', '50조원', '500억원'],
      answer: 1
    }
  },
  {
    term: '거래량',
    definition: '일정 기간 동안 거래된 주식의 수량입니다. 거래량이 많으면 해당 주식에 대한 관심이 높다는 것을 의미합니다.',
    example: '어떤 주식의 일일 거래량이 100만주라면, 하루 동안 100만주가 사고 팔렸다는 뜻입니다.',
    tip: '거래량이 급증하면 가격 변동의 신호일 수 있습니다. "거래량은 주가에 선행한다"는 말이 있습니다.',
    didYouKnow: '거래량이 너무 적은 주식은 사고 싶을 때 못 사고, 팔고 싶을 때 못 파는 "유동성 위험"이 있습니다.',
    category: '기초',
    relatedTerms: ['거래대금', '유동성', '매수', '매도', '호가'],
    difficulty: 'basic'
  },
  {
    term: '매수/매도',
    definition: '매수는 주식을 사는 것이고, 매도는 주식을 파는 것입니다. 투자의 가장 기본적인 행위입니다.',
    example: '삼성전자 주식을 7만원에 10주 매수하면 70만원이 필요하고, 나중에 8만원에 매도하면 80만원을 받습니다.',
    tip: '매수할 때는 왜 사는지, 매도할 때는 왜 파는지 항상 근거를 기록하세요.',
    category: '기초',
    relatedTerms: ['주문', '호가', '시장가', '지정가', '거래'],
    difficulty: 'basic'
  },
  // 투자 지표
  {
    term: 'PER (주가수익비율)',
    definition: '주가를 주당순이익(EPS)으로 나눈 값입니다. 기업이 벌어들이는 이익에 비해 주가가 얼마나 비싼지를 나타내는 대표적인 투자지표입니다.',
    example: 'PER 10이면 현재 이익 수준이 유지될 때 투자금을 회수하는 데 10년이 걸린다는 의미입니다.',
    formula: 'PER = 주가 ÷ EPS (주당순이익)',
    formulaExplanation: 'PER이 낮으면 이익 대비 주가가 저평가되었을 가능성이 있고, 높으면 고평가되었거나 미래 성장에 대한 기대가 반영된 것입니다.',
    tip: '동일 업종 내 기업들의 PER을 비교하면 상대적 가치를 파악할 수 있습니다.',
    didYouKnow: '코스피 평균 PER은 보통 10~15배 수준입니다. 미국 S&P500은 15~25배 정도입니다.',
    category: '투자지표',
    relatedTerms: ['EPS', 'PBR', '밸류에이션', '저평가', '고평가'],
    difficulty: 'intermediate',
    quiz: {
      question: '주가 10만원, EPS 1만원인 기업의 PER은?',
      options: ['1배', '5배', '10배', '100배'],
      answer: 2
    }
  },
  {
    term: 'PBR (주가순자산비율)',
    definition: '주가를 주당순자산가치(BPS)로 나눈 값입니다. 회사의 자산가치에 비해 주가가 얼마나 비싼지를 나타냅니다.',
    example: 'PBR 0.8이면 회사 자산 가치의 80% 가격에 주식을 살 수 있다는 뜻입니다.',
    formula: 'PBR = 주가 ÷ BPS (주당순자산)',
    formulaExplanation: 'PBR 1 미만이면 회사를 청산했을 때 받을 수 있는 금액보다 주가가 낮다는 의미입니다.',
    tip: 'PBR이 낮다고 무조건 좋은 것은 아닙니다. 자산 가치가 정확히 평가되었는지 확인이 필요합니다.',
    category: '투자지표',
    relatedTerms: ['BPS', 'PER', '자산가치', '청산가치', '순자산'],
    difficulty: 'intermediate',
    quiz: {
      question: 'PBR이 1 미만이라는 것의 의미는?',
      options: ['이익이 적자다', '주가가 자산가치보다 낮다', '부채가 많다', '성장성이 높다'],
      answer: 1
    }
  },
  {
    term: 'ROE (자기자본이익률)',
    definition: '자기자본 대비 얼마나 많은 이익을 창출했는지를 나타내는 지표입니다. 경영 효율성을 측정하는 핵심 지표입니다.',
    example: 'ROE 15%는 자기자본 100원으로 15원의 순이익을 창출했다는 뜻입니다.',
    formula: 'ROE = (순이익 ÷ 자기자본) × 100%',
    formulaExplanation: 'ROE가 높을수록 자본을 효율적으로 활용하여 이익을 내고 있다는 의미입니다.',
    tip: '워런 버핏은 ROE 15% 이상인 기업을 선호한다고 알려져 있습니다.',
    didYouKnow: 'ROE가 지속적으로 높은 기업은 복리 효과로 기업가치가 빠르게 성장합니다.',
    category: '투자지표',
    relatedTerms: ['자기자본', '순이익', 'ROA', '수익성', '경영효율'],
    difficulty: 'intermediate',
    quiz: {
      question: '자기자본 1000억, 순이익 150억인 기업의 ROE는?',
      options: ['1.5%', '15%', '150%', '6.67%'],
      answer: 1
    }
  },
  {
    term: 'EPS (주당순이익)',
    definition: '회사의 순이익을 발행주식수로 나눈 값입니다. 주식 1주가 벌어들이는 이익을 나타내며, PER 계산의 기초가 됩니다.',
    example: '순이익 1조원, 발행주식수 1억주라면 EPS는 10,000원입니다.',
    formula: 'EPS = 순이익 ÷ 발행주식수',
    formulaExplanation: 'EPS가 높을수록 주식 1주가 창출하는 이익이 크다는 의미입니다.',
    tip: 'EPS 성장률이 지속적으로 높은 기업이 좋은 투자 대상이 될 수 있습니다.',
    category: '투자지표',
    relatedTerms: ['순이익', 'PER', 'BPS', '발행주식수'],
    difficulty: 'intermediate'
  },
  {
    term: 'BPS (주당순자산)',
    definition: '회사의 순자산(자산-부채)을 발행주식수로 나눈 값입니다. 주식 1주가 가진 자산 가치를 나타냅니다.',
    example: '순자산 10조원, 발행주식수 1억주라면 BPS는 10만원입니다.',
    formula: 'BPS = 순자산(자기자본) ÷ 발행주식수',
    formulaExplanation: 'BPS는 회사가 청산될 경우 주주가 받을 수 있는 이론적 금액의 기준이 됩니다.',
    category: '투자지표',
    relatedTerms: ['순자산', 'PBR', '자기자본', '청산가치'],
    difficulty: 'intermediate'
  },
  {
    term: '배당수익률',
    definition: '주가 대비 배당금의 비율입니다. 주식 투자로 받을 수 있는 현금 수익의 비율을 나타냅니다.',
    example: '주가 5만원인 주식이 연간 2,500원의 배당금을 지급하면 배당수익률은 5%입니다.',
    formula: '배당수익률 = (주당배당금 ÷ 주가) × 100%',
    formulaExplanation: '배당수익률이 높을수록 투자금 대비 더 많은 배당을 받을 수 있습니다.',
    tip: '배당수익률이 은행 예금 금리보다 높으면 배당 매력이 있다고 볼 수 있습니다.',
    category: '투자지표',
    relatedTerms: ['배당금', '배당성향', '고배당주', '배당투자'],
    difficulty: 'intermediate',
    quiz: {
      question: '주가 4만원, 연간 배당금 2,000원일 때 배당수익률은?',
      options: ['2%', '5%', '20%', '0.5%'],
      answer: 1
    }
  },
  // 경제 원리
  {
    term: '기회비용',
    definition: '어떤 선택을 했을 때 포기해야 하는 다른 대안 중 가장 가치 있는 것의 가치입니다. 모든 선택에는 기회비용이 존재합니다.',
    example: 'A주식에 100만원을 투자하면, 그 돈으로 B주식에 투자했을 때 얻을 수 있었던 수익이 기회비용입니다.',
    tip: '투자 결정 시 "이 돈으로 다른 곳에 투자하면 어떨까?"를 항상 생각해보세요.',
    didYouKnow: '기회비용 개념은 19세기 오스트리아 경제학자 프리드리히 비저가 처음 사용했습니다.',
    category: '경제원리',
    relatedTerms: ['합리적 선택', '매몰비용', '한계비용', '트레이드오프'],
    difficulty: 'basic',
    quiz: {
      question: '기회비용의 정의로 가장 적절한 것은?',
      options: ['지출한 금액', '포기한 최선의 대안 가치', '미래의 예상 수익', '현재의 시장 가격'],
      answer: 1
    }
  },
  {
    term: '분산투자',
    definition: '여러 종목이나 자산에 나누어 투자하여 위험을 줄이는 전략입니다. "계란을 한 바구니에 담지 마라"는 투자 격언과 같은 원리입니다.',
    example: 'IT, 금융, 제조업 등 다양한 업종에 분산 투자하면 특정 업종의 부진이 전체 포트폴리오에 미치는 영향을 줄일 수 있습니다.',
    tip: '효과적인 분산투자를 위해서는 서로 상관관계가 낮은 자산에 투자해야 합니다.',
    didYouKnow: '해리 마코위츠는 현대 포트폴리오 이론으로 1990년 노벨 경제학상을 받았습니다.',
    category: '경제원리',
    relatedTerms: ['포트폴리오', '위험', '상관관계', '자산배분'],
    difficulty: 'intermediate',
    quiz: {
      question: '분산투자의 주요 목적은?',
      options: ['수익 극대화', '위험 감소', '거래비용 절감', '세금 회피'],
      answer: 1
    }
  },
  {
    term: '포트폴리오',
    definition: '투자자가 보유한 주식, 채권, 현금 등 다양한 자산의 조합입니다. 포트폴리오 구성을 통해 위험과 수익의 균형을 맞출 수 있습니다.',
    example: '주식 60%, 채권 30%, 현금 10%로 구성된 포트폴리오는 적정한 위험을 감수하면서 수익을 추구하는 전략입니다.',
    tip: '나이가 젊을수록 위험자산(주식) 비중을 높이고, 나이가 들수록 안전자산(채권) 비중을 높이는 것이 일반적입니다.',
    category: '경제원리',
    relatedTerms: ['분산투자', '자산배분', '리밸런싱', '위험관리'],
    difficulty: 'intermediate'
  },
  {
    term: '수익률',
    definition: '투자한 금액 대비 얼마나 이익(또는 손실)을 얻었는지를 백분율로 나타낸 것입니다.',
    example: '100만원을 투자해서 120만원이 되었다면 수익률은 20%입니다.',
    formula: '수익률 = (현재가치 - 투자원금) ÷ 투자원금 × 100%',
    formulaExplanation: '양수면 이익, 음수면 손실을 의미합니다.',
    tip: '수익률을 비교할 때는 투자 기간을 고려해야 합니다. 연환산 수익률로 비교하는 것이 공정합니다.',
    category: '경제원리',
    relatedTerms: ['투자원금', '손익', '복리', '연환산수익률'],
    difficulty: 'basic',
    quiz: {
      question: '500만원을 투자해서 600만원이 되었을 때 수익률은?',
      options: ['10%', '20%', '100%', '120%'],
      answer: 1
    }
  },
  {
    term: '위험(리스크)',
    definition: '투자 결과가 예상과 다르게 나올 가능성입니다. 일반적으로 높은 수익을 기대하면 높은 위험을 감수해야 합니다.',
    example: '변동성이 큰 성장주는 높은 수익을 얻을 수 있지만, 큰 손실을 볼 위험도 높습니다.',
    tip: '자신이 감수할 수 있는 위험 수준을 파악하고, 그에 맞는 투자를 해야 합니다.',
    didYouKnow: '금융에서 "무위험 수익률"은 보통 국채 금리를 기준으로 합니다.',
    category: '경제원리',
    relatedTerms: ['변동성', '분산투자', '위험회피', '위험-수익 관계', '체계적 위험'],
    difficulty: 'intermediate'
  },
  {
    term: '상관관계',
    definition: '두 자산의 가격이 함께 움직이는 정도를 나타내는 지표입니다. -1에서 1 사이의 값을 가집니다.',
    example: '상관관계가 1이면 두 자산이 같은 방향으로, -1이면 반대 방향으로, 0이면 관계없이 움직입니다.',
    formula: '상관계수 범위: -1 ≤ ρ ≤ 1',
    formulaExplanation: '분산투자 효과를 극대화하려면 상관관계가 낮거나 음인 자산들을 조합해야 합니다.',
    tip: '같은 업종 주식들은 보통 양의 상관관계가 높아 분산 효과가 적습니다.',
    category: '경제원리',
    relatedTerms: ['분산투자', '포트폴리오', '베타', '공분산'],
    difficulty: 'advanced'
  },
  {
    term: '복리',
    definition: '이자에 이자가 붙는 것으로, 시간이 지날수록 자산이 기하급수적으로 증가하는 효과입니다.',
    example: '연 10% 수익률로 100만원을 투자하면, 7년 후에는 약 200만원이 됩니다 (72의 법칙).',
    formula: '미래가치 = 현재가치 × (1 + 이자율)^기간',
    formulaExplanation: '아인슈타인은 복리를 "세계 8번째 불가사의"라고 불렀다고 합니다.',
    tip: '72의 법칙: 72를 수익률로 나누면 원금이 2배가 되는 데 걸리는 시간을 알 수 있습니다.',
    didYouKnow: '연 7%로 30년 투자하면 복리 효과로 원금이 약 7.6배가 됩니다.',
    category: '경제원리',
    relatedTerms: ['단리', '투자기간', '72의 법칙', '장기투자'],
    difficulty: 'intermediate',
    quiz: {
      question: '72의 법칙에 따르면, 연 8% 수익률로 원금이 2배가 되는 기간은?',
      options: ['6년', '8년', '9년', '12년'],
      answer: 2
    }
  },
  // 투자 전략
  {
    term: '가치투자',
    definition: '기업의 내재 가치보다 낮은 가격에 거래되는 주식을 찾아 투자하는 전략입니다. 워런 버핏이 대표적인 가치투자자입니다.',
    example: 'PER, PBR이 낮고 재무상태가 건전한 기업을 찾아 장기 투자합니다.',
    tip: '"가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다" - 워런 버핏',
    didYouKnow: '가치투자의 창시자 벤저민 그레이엄은 워런 버핏의 스승이었습니다.',
    category: '투자전략',
    relatedTerms: ['내재가치', '저평가', 'PER', 'PBR', '장기투자'],
    difficulty: 'advanced'
  },
  {
    term: '성장투자',
    definition: '높은 성장 잠재력을 가진 기업에 투자하는 전략입니다. 현재 수익보다 미래 성장성에 초점을 맞춥니다.',
    example: '아직 이익은 적지만 매출이 빠르게 증가하는 IT 스타트업에 투자하는 것이 성장투자의 예입니다.',
    tip: '성장주는 PER이 높은 경우가 많으므로, 성장률을 함께 고려하는 PEG 지표를 활용하세요.',
    category: '투자전략',
    relatedTerms: ['성장주', '매출성장률', 'PEG', '신산업', '테마주'],
    difficulty: 'advanced'
  },
  {
    term: '배당투자',
    definition: '정기적으로 배당금을 지급하는 기업에 투자하여 안정적인 현금 흐름을 얻는 전략입니다.',
    example: '배당수익률 5%인 주식에 1000만원을 투자하면 연간 50만원의 배당금을 받을 수 있습니다.',
    tip: '배당을 오랜 기간 꾸준히 늘려온 기업을 "배당귀족"이라고 부릅니다.',
    didYouKnow: '미국에는 50년 이상 배당을 늘려온 "배당왕" 기업들도 있습니다.',
    category: '투자전략',
    relatedTerms: ['배당금', '배당수익률', '배당성향', '고배당주', '배당귀족'],
    difficulty: 'intermediate'
  },
  {
    term: '적립식 투자',
    definition: '일정 금액을 정기적으로 투자하는 방법입니다. 시장 타이밍을 맞추려 하지 않고 꾸준히 투자합니다.',
    example: '매월 50만원씩 인덱스 펀드에 자동 투자하는 것이 적립식 투자입니다.',
    tip: '적립식 투자는 평균 매입단가를 낮추는 "비용평균효과"가 있습니다.',
    didYouKnow: '영어로는 Dollar Cost Averaging(DCA)이라고 합니다.',
    category: '투자전략',
    relatedTerms: ['비용평균효과', '장기투자', '인덱스펀드', '자동투자'],
    difficulty: 'basic'
  },
  // 행동경제학
  {
    term: '손실회피',
    definition: '같은 크기의 이익보다 손실에 더 민감하게 반응하는 심리적 특성입니다. 손실의 고통이 이익의 기쁨보다 약 2배 크다고 알려져 있습니다.',
    example: '10만원을 잃었을 때의 고통이 10만원을 벌었을 때의 기쁨보다 더 크게 느껴집니다.',
    tip: '손실회피로 인해 손절매를 못하고 손실 종목을 계속 보유하는 경우가 많습니다.',
    didYouKnow: '대니얼 카너먼은 전망이론으로 2002년 노벨 경제학상을 받았습니다.',
    category: '행동경제학',
    relatedTerms: ['전망이론', '매몰비용', '손절매', '심리적 편향'],
    difficulty: 'advanced',
    quiz: {
      question: '손실회피 편향으로 인해 나타나기 쉬운 행동은?',
      options: ['손실 종목 빠른 매도', '손실 종목 계속 보유', '이익 종목 계속 보유', '분산투자 강화'],
      answer: 1
    }
  },
  {
    term: '확증편향',
    definition: '자신의 기존 생각이나 믿음을 확인해주는 정보만 선택적으로 받아들이는 경향입니다.',
    example: '이미 A주식에 투자했다면, A주식에 긍정적인 뉴스만 주목하고 부정적인 뉴스는 무시하는 경향이 있습니다.',
    tip: '자신의 투자에 반대되는 의견도 적극적으로 찾아보는 습관을 기르세요.',
    category: '행동경제학',
    relatedTerms: ['인지편향', '군중심리', '과신', '객관적 분석'],
    difficulty: 'advanced'
  },
  {
    term: '매몰비용 오류',
    definition: '이미 지출하여 회수할 수 없는 비용(매몰비용)에 영향을 받아 비합리적인 결정을 내리는 오류입니다.',
    example: '이미 50% 손실이 난 주식을 "본전은 찾아야지"라는 생각으로 계속 보유하는 것이 매몰비용 오류의 예입니다.',
    tip: '과거에 투자한 금액이 아니라, 현재 시점에서 가장 좋은 선택이 무엇인지 생각하세요.',
    category: '행동경제학',
    relatedTerms: ['손실회피', '손절매', '기회비용', '합리적 선택'],
    difficulty: 'advanced',
    quiz: {
      question: '매몰비용 오류를 피하기 위한 방법은?',
      options: ['과거 투자금액에 집중하기', '현재 시점의 최선 선택에 집중하기', '무조건 손절매하기', '투자를 피하기'],
      answer: 1
    }
  },
  {
    term: '군중심리 (허딩)',
    definition: '다수의 사람들이 하는 행동을 따라하려는 심리적 경향입니다. 투자에서는 비합리적인 과열이나 폭락을 유발할 수 있습니다.',
    example: '주변 사람들이 모두 특정 주식을 산다고 해서 분석 없이 따라 사는 것이 군중심리입니다.',
    tip: '"모두가 탐욕스러울 때 두려워하고, 모두가 두려워할 때 탐욕스러워하라" - 워런 버핏',
    category: '행동경제학',
    relatedTerms: ['과열', '폭락', '버블', '공포', '탐욕'],
    difficulty: 'advanced'
  },
  {
    term: '과신 편향',
    definition: '자신의 능력이나 판단을 실제보다 과대평가하는 경향입니다. 투자에서 과도한 거래나 위험 감수로 이어질 수 있습니다.',
    example: '몇 번 수익을 낸 후 "나는 투자 천재다"라고 생각하며 무리하게 투자하는 것이 과신 편향입니다.',
    tip: '투자 일지를 작성하여 자신의 예측과 실제 결과를 비교해보세요.',
    category: '행동경제학',
    relatedTerms: ['과잉거래', '위험관리', '자기평가', '투자일지'],
    difficulty: 'advanced'
  }
];

const categories = [
  { id: 'all', name: '전체', icon: BookOpen, color: 'bg-gray-100 text-gray-700' },
  { id: '기초', name: '기초 개념', icon: GraduationCap, color: 'bg-blue-100 text-blue-700' },
  { id: '투자지표', name: '투자 지표', icon: BarChart3, color: 'bg-green-100 text-green-700' },
  { id: '경제원리', name: '경제 원리', icon: Scale, color: 'bg-purple-100 text-purple-700' },
  { id: '투자전략', name: '투자 전략', icon: DollarSign, color: 'bg-yellow-100 text-yellow-700' },
  { id: '행동경제학', name: '행동경제학', icon: Brain, color: 'bg-red-100 text-red-700' }
];

const difficultyLabels = {
  basic: { label: '기초', color: 'bg-green-100 text-green-700', stars: 1 },
  intermediate: { label: '중급', color: 'bg-yellow-100 text-yellow-700', stars: 2 },
  advanced: { label: '심화', color: 'bg-red-100 text-red-700', stars: 3 }
};

export default function ConceptsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('term') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [expandedConcept, setExpandedConcept] = useState<string | null>(initialSearch || null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'category' | 'subject'>('category');
  const [quizMode, setQuizMode] = useState<{
    concept: string;
    selectedAnswer: number | null;
    showResult: boolean;
  } | null>(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`concept_bookmarks_${user?.id}`);
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  }, [user?.id]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem(`concept_bookmarks_${user?.id}`, JSON.stringify(bookmarks));
  }, [bookmarks, user?.id]);

  const toggleBookmark = (term: string) => {
    setBookmarks(prev =>
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
    toast.success(bookmarks.includes(term) ? '북마크 해제' : '북마크 추가');
  };

  const filteredConcepts = useMemo(() => {
    return concepts.filter(concept => {
      const matchesSearch = searchQuery === '' ||
        concept.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.relatedTerms.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || concept.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || concept.difficulty === selectedDifficulty;
      const matchesBookmark = !showBookmarksOnly || bookmarks.includes(concept.term);

      // Filter by curriculum subject
      let matchesSubject = true;
      if (selectedSubject !== 'all') {
        const linkedSubjects = getSubjectsByTerm(concept.term);
        matchesSubject = linkedSubjects.includes(selectedSubject as SubjectCode);
      }

      return matchesSearch && matchesCategory && matchesDifficulty && matchesBookmark && matchesSubject;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, showBookmarksOnly, bookmarks, selectedSubject]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const getRandomConcept = () => {
    const randomIndex = Math.floor(Math.random() * concepts.length);
    const concept = concepts[randomIndex];
    setExpandedConcept(concept.term);
    setSearchQuery('');
    setSelectedCategory('all');
    setShowBookmarksOnly(false);
  };

  const startQuiz = (term: string) => {
    const concept = concepts.find(c => c.term === term);
    if (concept?.quiz) {
      setQuizMode({ concept: term, selectedAnswer: null, showResult: false });
    }
  };

  const answerQuiz = (answerIndex: number) => {
    if (quizMode) {
      setQuizMode({ ...quizMode, selectedAnswer: answerIndex, showResult: true });
    }
  };

  const conceptsWithQuiz = filteredConcepts.filter(c => c.quiz);
  const stats = {
    total: concepts.length,
    basic: concepts.filter(c => c.difficulty === 'basic').length,
    intermediate: concepts.filter(c => c.difficulty === 'intermediate').length,
    advanced: concepts.filter(c => c.difficulty === 'advanced').length,
    bookmarked: bookmarks.length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">경제 개념 사전</h1>
              <p className="text-gray-600">투자에 필요한 핵심 경제 개념을 학습하세요</p>
            </div>
          </div>
          <button
            onClick={getRandomConcept}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            랜덤 개념
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 border shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">전체 개념</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.basic}</p>
            <p className="text-xs text-green-600">기초</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.intermediate}</p>
            <p className="text-xs text-yellow-600">중급</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.advanced}</p>
            <p className="text-xs text-red-600">심화</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.bookmarked}</p>
            <p className="text-xs text-purple-600">북마크</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="개념, 정의, 관련 용어 검색..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">보기:</span>
          <button
            onClick={() => { setViewMode('category'); setSelectedSubject('all'); }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              viewMode === 'category'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            카테고리별
          </button>
          <button
            onClick={() => { setViewMode('subject'); setSelectedCategory('all'); }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              viewMode === 'subject'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            교과별
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {viewMode === 'category' ? (
            /* Categories */
            <>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </>
          ) : (
            /* Curriculum Subjects */
            <>
              <button
                onClick={() => setSelectedSubject('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedSubject === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                전체 교과
              </button>
              {Object.values(CURRICULUM_SUBJECTS).map((subject) => (
                <button
                  key={subject.code}
                  onClick={() => setSelectedSubject(subject.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedSubject === subject.code
                      ? `${subject.bgColor} border-2 ${subject.borderColor}`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedSubject === subject.code ? { color: subject.color } : {}}
                >
                  <Award className="w-4 h-4" />
                  {subject.name}
                  <span className="text-xs opacity-70">({subject.grade})</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <div className="flex items-center gap-1 mr-2">
            <span className="text-sm text-gray-500">난이도:</span>
            {['all', 'basic', 'intermediate', 'advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {diff === 'all' ? '전체' : difficultyLabels[diff as keyof typeof difficultyLabels].label}
              </button>
            ))}
          </div>

          {/* Bookmark Filter */}
          <button
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showBookmarksOnly
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            북마크만
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        검색 결과: <span className="font-semibold text-blue-600">{filteredConcepts.length}</span>개 개념
        {conceptsWithQuiz.length > 0 && (
          <span className="ml-2 text-purple-600">
            ({conceptsWithQuiz.length}개 퀴즈 포함)
          </span>
        )}
      </div>

      {/* Concepts List */}
      <div className="space-y-3">
        {filteredConcepts.map((concept) => {
          const isExpanded = expandedConcept === concept.term;
          const difficulty = difficultyLabels[concept.difficulty];
          const isBookmarked = bookmarks.includes(concept.term);
          const categoryInfo = categories.find(c => c.id === concept.category);

          return (
            <div
              key={concept.term}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                isExpanded ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <button
                onClick={() => setExpandedConcept(isExpanded ? null : concept.term)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryInfo?.color || 'bg-gray-100'}`}>
                    {categoryInfo && <categoryInfo.icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{concept.term}</h3>
                      {concept.quiz && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          퀴즈
                        </span>
                      )}
                      {/* Subject badges */}
                      {getSubjectsByTerm(concept.term).slice(0, 2).map((subjectCode) => {
                        const subject = CURRICULUM_SUBJECTS[subjectCode];
                        return (
                          <span
                            key={subjectCode}
                            className={`px-1.5 py-0.5 text-xs rounded ${subject.bgColor}`}
                            style={{ color: subject.color }}
                          >
                            {subject.name}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{concept.definition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(concept.term);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isBookmarked ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isBookmarked ? <Bookmark className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(difficulty.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t bg-gradient-to-b from-gray-50 to-white">
                  <div className="pt-4 space-y-4">
                    {/* Definition */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        정의
                      </h4>
                      <p className="text-gray-800 leading-relaxed">{concept.definition}</p>
                    </div>

                    {/* Curriculum Connection */}
                    {(() => {
                      const linkedSubjects = getSubjectsByTerm(concept.term);
                      const linkedStandards = getStandardsByTerm(concept.term);
                      const mathFormula = getMathFormulaByTerm(concept.term);

                      if (linkedSubjects.length > 0) {
                        return (
                          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                            <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              2022 개정 교육과정 연계
                            </h4>

                            {/* Linked Subjects */}
                            <div className="mb-3">
                              <p className="text-xs text-gray-600 mb-2">연계 교과</p>
                              <div className="flex flex-wrap gap-2">
                                {linkedSubjects.map((subjectCode) => {
                                  const subject = CURRICULUM_SUBJECTS[subjectCode];
                                  return (
                                    <span
                                      key={subjectCode}
                                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${subject.bgColor} border ${subject.borderColor}`}
                                      style={{ color: subject.color }}
                                    >
                                      {subject.name} ({subject.grade})
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Achievement Standards */}
                            {linkedStandards.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-600 mb-2">관련 성취기준</p>
                                <ul className="space-y-1">
                                  {linkedStandards.map((standard) => (
                                    <li key={standard.code} className="text-sm text-indigo-700 flex items-start gap-2">
                                      <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-indigo-200 flex-shrink-0">
                                        {standard.code}
                                      </span>
                                      <span>{standard.description}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Math Formula from Curriculum */}
                            {mathFormula && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
                                <p className="text-xs text-gray-600 mb-1">수학적 표현</p>
                                <p className="font-mono text-sm text-indigo-900 font-bold">{mathFormula.formula}</p>
                                <p className="text-xs text-gray-500 mt-1">변수: {mathFormula.variables}</p>
                                <p className="text-xs text-indigo-600 mt-1">예) {mathFormula.example}</p>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Formula */}
                    {concept.formula && !(getMathFormulaByTerm(concept.term)) && (
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          공식
                        </h4>
                        <p className="font-mono text-lg text-indigo-900 mb-2">{concept.formula}</p>
                        {concept.formulaExplanation && (
                          <p className="text-sm text-indigo-700">{concept.formulaExplanation}</p>
                        )}
                      </div>
                    )}

                    {/* Example */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        예시
                      </h4>
                      <p className="text-blue-900">{concept.example}</p>
                    </div>

                    {/* Tip */}
                    {concept.tip && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          실전 팁
                        </h4>
                        <p className="text-green-900">{concept.tip}</p>
                      </div>
                    )}

                    {/* Did You Know */}
                    {concept.didYouKnow && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          알고 계셨나요?
                        </h4>
                        <p className="text-amber-900">{concept.didYouKnow}</p>
                      </div>
                    )}

                    {/* Quiz */}
                    {concept.quiz && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          개념 확인 퀴즈
                        </h4>
                        {quizMode?.concept === concept.term ? (
                          <div>
                            <p className="text-purple-900 font-medium mb-3">{concept.quiz.question}</p>
                            <div className="space-y-2">
                              {concept.quiz.options.map((option, idx) => {
                                const isSelected = quizMode.selectedAnswer === idx;
                                const isCorrect = idx === concept.quiz!.answer;
                                const showResult = quizMode.showResult;

                                let buttonClass = 'bg-white border border-purple-200 text-purple-900 hover:bg-purple-100';
                                if (showResult) {
                                  if (isCorrect) {
                                    buttonClass = 'bg-green-100 border border-green-300 text-green-900';
                                  } else if (isSelected && !isCorrect) {
                                    buttonClass = 'bg-red-100 border border-red-300 text-red-900';
                                  }
                                } else if (isSelected) {
                                  buttonClass = 'bg-purple-200 border border-purple-300 text-purple-900';
                                }

                                return (
                                  <button
                                    key={idx}
                                    onClick={() => !showResult && answerQuiz(idx)}
                                    disabled={showResult}
                                    className={`w-full p-3 text-left rounded-lg transition-colors flex items-center gap-2 ${buttonClass}`}
                                  >
                                    <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-sm">
                                      {idx + 1}
                                    </span>
                                    {option}
                                    {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />}
                                    {showResult && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600 ml-auto" />}
                                  </button>
                                );
                              })}
                            </div>
                            {quizMode.showResult && (
                              <button
                                onClick={() => setQuizMode(null)}
                                className="mt-3 text-sm text-purple-600 hover:underline"
                              >
                                닫기
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => startQuiz(concept.term)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            퀴즈 풀기
                          </button>
                        )}
                      </div>
                    )}

                    {/* Related Terms */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">관련 개념</h4>
                      <div className="flex flex-wrap gap-2">
                        {concept.relatedTerms.map((term) => {
                          const exists = concepts.some(c => c.term === term);
                          return (
                            <button
                              key={term}
                              onClick={() => {
                                if (exists) {
                                  setExpandedConcept(term);
                                  setSearchParams({ search: term });
                                }
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                                exists
                                  ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                  : 'bg-gray-100 text-gray-400 cursor-default'
                              }`}
                            >
                              {term}
                              {exists && <ArrowRight className="w-3 h-3" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="pt-4 border-t flex flex-wrap gap-3">
                      <Link
                        to="/learning"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm"
                      >
                        <GraduationCap className="w-4 h-4" />
                        학습 모듈에서 배우기
                      </Link>
                      <Link
                        to="/trading"
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                      >
                        <TrendingUp className="w-4 h-4" />
                        실전 적용하기
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSelectedSubject('all');
              setShowBookmarksOnly(false);
              setViewMode('category');
              setSearchParams({});
            }}
            className="text-blue-600 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
