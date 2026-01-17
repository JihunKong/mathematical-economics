import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Play,
  FileText,
  ChevronRight,
  ChevronDown,
  Target,
  Clock,
  Award,
  Brain,
  TrendingUp,
  Users,
  Star,
  CircleCheck,
  Circle,
  ExternalLink,
  Video,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import toast from 'react-hot-toast';

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LearningResource {
  title: string;
  type: 'video' | 'article' | 'interactive';
  url?: string;
  description: string;
}

interface LessonContent {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  objectives: string[];
  concepts: { term: string; brief: string }[];
  activities: { title: string; description: string; type: 'individual' | 'group' | 'practice' }[];
  appFeature: string;
  appLink: string;
  quiz: Quiz[];
  resources: LearningResource[];
  teacherNotes?: string[];
}

const lessons: LessonContent[] = [
  {
    id: 'lesson-1',
    title: '1차시: 주식시장의 이해와 정보 탐색',
    subtitle: '투자의 첫 걸음, 시장을 이해하다',
    duration: '50분',
    description: '주식시장의 기본 원리를 이해하고, 합리적인 투자 결정을 위한 정보 탐색 방법을 학습합니다. 실제 기업 데이터를 활용하여 투자 대상을 선정하는 과정을 경험합니다.',
    objectives: [
      '주식시장의 기능과 역할을 설명할 수 있다.',
      '기업 정보를 탐색하고 분석하는 방법을 익힌다.',
      '투자 대상 기업을 선정하고 워치리스트를 구성할 수 있다.',
      '정보의 신뢰성을 평가하는 기준을 적용할 수 있다.'
    ],
    concepts: [
      { term: '주식', brief: '기업의 소유권을 나타내는 증권' },
      { term: '주식시장', brief: '주식이 거래되는 조직화된 시장' },
      { term: '코스피/코스닥', brief: '한국의 대표적인 주식시장' },
      { term: '시가총액', brief: '주가 × 발행주식 수' },
      { term: '거래량', brief: '일정 기간 거래된 주식 수량' }
    ],
    activities: [
      {
        title: '주식시장 역할 토론',
        description: '주식시장이 경제에서 어떤 역할을 하는지 모둠별로 토론하고 발표합니다.',
        type: 'group'
      },
      {
        title: '관심 기업 탐색',
        description: '관심 있는 분야의 기업 3~5개를 선정하고 기본 정보를 조사합니다.',
        type: 'individual'
      },
      {
        title: '워치리스트 구성',
        description: '앱의 워치리스트 기능을 활용하여 선정 기업을 등록하고 선정 이유를 기록합니다.',
        type: 'practice'
      }
    ],
    appFeature: '워치리스트 설정',
    appLink: '/watchlist-setup',
    quiz: [
      {
        question: '주식시장의 주요 기능이 아닌 것은?',
        options: ['자금 조달 기능', '가격 발견 기능', '통화 발행 기능', '유동성 제공 기능'],
        correctAnswer: 2,
        explanation: '통화 발행은 중앙은행의 기능입니다. 주식시장은 기업의 자금 조달, 적정 가격 형성, 투자자에게 유동성 제공 등의 기능을 합니다.'
      },
      {
        question: '시가총액이 가장 큰 기업은 일반적으로 어디에 속하나요?',
        options: ['코스닥', '코스피', 'K-OTC', '코넥스'],
        correctAnswer: 1,
        explanation: '코스피는 대형 우량 기업이 상장된 시장으로, 시가총액 상위 기업들이 주로 속해 있습니다.'
      },
      {
        question: '투자 정보를 탐색할 때 가장 신뢰할 수 있는 정보원은?',
        options: ['SNS 투자 추천', '공식 기업 공시', '인터넷 커뮤니티', '지인의 조언'],
        correctAnswer: 1,
        explanation: '기업의 공식 공시 자료(DART 등)는 법적 의무에 따라 제출되므로 가장 신뢰할 수 있는 정보원입니다.'
      }
    ],
    resources: [
      { title: '주식시장의 이해', type: 'video', description: '주식시장의 기본 개념을 설명하는 교육 영상' },
      { title: 'DART 전자공시 활용법', type: 'article', description: '기업 공시 정보 조회 방법 안내' },
      { title: '기업 정보 탐색 실습', type: 'interactive', description: '실제 기업 데이터로 정보 탐색 연습' }
    ],
    teacherNotes: [
      '학생들이 관심 있는 분야의 기업을 선택하도록 유도하세요.',
      '투자 권유가 아닌 교육 목적임을 명확히 안내하세요.',
      '정보의 신뢰성 평가 기준을 충분히 설명해주세요.'
    ]
  },
  {
    id: 'lesson-2',
    title: '2차시: 투자 의사결정과 기회비용',
    subtitle: '합리적 선택의 경제학',
    duration: '50분',
    description: '경제학의 핵심 개념인 기회비용을 투자 상황에 적용하고, 합리적인 의사결정 과정을 체험합니다. 실제 매수를 통해 이론과 실천을 연결합니다.',
    objectives: [
      '기회비용의 개념을 투자 상황에 적용할 수 있다.',
      '투자 의사결정 시 고려해야 할 요소를 분석할 수 있다.',
      '투자 근거를 논리적으로 작성할 수 있다.',
      'PER, PBR 등 기본 투자지표를 해석할 수 있다.'
    ],
    concepts: [
      { term: '기회비용', brief: '선택으로 인해 포기한 것의 가치' },
      { term: '매수/매도', brief: '주식을 사고파는 행위' },
      { term: 'PER', brief: '주가 ÷ 주당순이익' },
      { term: 'PBR', brief: '주가 ÷ 주당순자산' },
      { term: '합리적 선택', brief: '비용-편익을 고려한 최선의 결정' }
    ],
    activities: [
      {
        title: '기회비용 사례 분석',
        description: '일상생활과 투자에서의 기회비용 사례를 찾아 분석합니다.',
        type: 'group'
      },
      {
        title: '투자 체크리스트 작성',
        description: '합리적인 투자 결정을 위한 나만의 체크리스트를 작성합니다.',
        type: 'individual'
      },
      {
        title: '첫 매수 실행',
        description: '앱에서 종목을 매수하고, 투자 근거를 상세히 기록합니다.',
        type: 'practice'
      }
    ],
    appFeature: '주식 매수하기',
    appLink: '/trading',
    quiz: [
      {
        question: 'A 주식에 100만원을 투자하면, 그 100만원으로 살 수 있었던 B 주식의 수익은 무엇인가요?',
        options: ['명시적 비용', '기회비용', '매몰비용', '고정비용'],
        correctAnswer: 1,
        explanation: '기회비용은 선택으로 인해 포기한 차선의 가치입니다. A 주식을 선택함으로써 B 주식에서 얻을 수 있었던 수익을 포기한 것이 기회비용입니다.'
      },
      {
        question: 'PER이 낮은 주식은 일반적으로 어떻게 해석되나요?',
        options: ['과대평가되었다', '저평가되었다', '위험하다', '성장성이 높다'],
        correctAnswer: 1,
        explanation: 'PER(주가수익비율)이 낮다는 것은 이익 대비 주가가 낮다는 의미로, 저평가 가능성을 나타냅니다. 단, 다른 요소도 함께 고려해야 합니다.'
      },
      {
        question: '투자 의사결정 시 가장 먼저 해야 할 것은?',
        options: ['주변 추천 종목 매수', '투자 목표와 기준 설정', '차트 분석', '대출 실행'],
        correctAnswer: 1,
        explanation: '합리적인 투자를 위해서는 먼저 자신의 투자 목표와 기준을 명확히 설정하고, 이에 맞는 종목을 선택해야 합니다.'
      }
    ],
    resources: [
      { title: '기회비용의 이해', type: 'video', description: '일상 속 기회비용 개념 설명' },
      { title: 'PER, PBR 완벽 가이드', type: 'article', description: '투자지표 해석 방법 안내' },
      { title: '투자 의사결정 시뮬레이션', type: 'interactive', description: '가상 시나리오로 의사결정 연습' }
    ],
    teacherNotes: [
      '기회비용 개념이 추상적일 수 있으므로 구체적인 예시를 충분히 들어주세요.',
      '투자 근거 작성의 중요성을 강조하세요.',
      '학생들이 서로의 투자 근거를 공유하고 피드백하도록 유도하세요.'
    ]
  },
  {
    id: 'lesson-3',
    title: '3차시: 포트폴리오와 위험 분산',
    subtitle: '달걀을 한 바구니에 담지 마라',
    duration: '50분',
    description: '현대 포트폴리오 이론의 기본 원리를 학습하고, 분산투자를 통한 위험 관리 전략을 실습합니다. 자신의 포트폴리오를 분석하고 개선합니다.',
    objectives: [
      '포트폴리오의 개념과 분산투자의 원리를 설명할 수 있다.',
      '위험과 수익의 관계를 이해하고 설명할 수 있다.',
      '자신의 포트폴리오를 분석하고 개선할 수 있다.',
      '상관관계를 고려한 자산 배분을 실행할 수 있다.'
    ],
    concepts: [
      { term: '포트폴리오', brief: '투자 자산의 조합' },
      { term: '분산투자', brief: '위험 감소를 위한 자산 분배' },
      { term: '위험(리스크)', brief: '예상과 다른 결과가 나올 가능성' },
      { term: '수익률', brief: '투자 대비 이익의 비율' },
      { term: '상관관계', brief: '두 자산 가격 움직임의 연관성' }
    ],
    activities: [
      {
        title: '분산투자 시뮬레이션',
        description: '동일 금액을 집중투자 vs 분산투자했을 때의 결과를 비교 분석합니다.',
        type: 'group'
      },
      {
        title: '업종별 분산 전략 토론',
        description: '효과적인 분산을 위한 업종/자산 조합 전략을 모둠별로 토론합니다.',
        type: 'group'
      },
      {
        title: '포트폴리오 재구성',
        description: '앱에서 자신의 포트폴리오를 분석하고 분산 전략에 따라 재구성합니다.',
        type: 'practice'
      }
    ],
    appFeature: '포트폴리오 분석',
    appLink: '/portfolio',
    quiz: [
      {
        question: '분산투자의 주요 목적은 무엇인가요?',
        options: ['수익 극대화', '위험 감소', '거래비용 절감', '세금 회피'],
        correctAnswer: 1,
        explanation: '분산투자의 핵심 목적은 여러 자산에 분산 투자하여 개별 자산의 위험을 줄이는 것입니다.'
      },
      {
        question: '상관관계가 -1인 두 자산을 조합하면 어떤 효과가 있나요?',
        options: ['위험이 2배가 된다', '위험이 완전히 제거된다', '수익이 2배가 된다', '효과가 없다'],
        correctAnswer: 1,
        explanation: '상관관계가 -1이면 두 자산이 정반대로 움직여 이론적으로 위험을 완전히 제거할 수 있습니다.'
      },
      {
        question: '효과적인 분산투자를 위해 고려해야 할 것은?',
        options: ['같은 업종 내 여러 종목', '상관관계가 낮은 다양한 자산', '가장 수익률이 높은 종목', '가장 유명한 기업들'],
        correctAnswer: 1,
        explanation: '효과적인 분산을 위해서는 상관관계가 낮은 다양한 자산에 투자해야 합니다. 같은 업종은 비슷하게 움직이는 경향이 있습니다.'
      }
    ],
    resources: [
      { title: '포트폴리오 이론 기초', type: 'video', description: '마코위츠 포트폴리오 이론 설명' },
      { title: '상관관계와 분산효과', type: 'article', description: '자산 간 상관관계의 중요성' },
      { title: '포트폴리오 분석 도구', type: 'interactive', description: '실제 포트폴리오 분산도 분석' }
    ],
    teacherNotes: [
      '분산투자가 위험을 줄이지만 완전히 제거하지는 못함을 설명하세요.',
      '실제 데이터를 활용한 시뮬레이션으로 개념을 체감하게 하세요.',
      '학생들의 포트폴리오를 익명으로 공유하고 피드백을 주고받게 하세요.'
    ]
  },
  {
    id: 'lesson-4',
    title: '4차시: 투자 성과 분석과 경제적 성찰',
    subtitle: '배움을 삶으로 연결하다',
    duration: '50분',
    description: '투자 성과를 정량적으로 분석하고, 의사결정 과정을 비판적으로 평가합니다. 학습한 경제적 사고를 일상생활에 적용하는 방안을 모색합니다.',
    objectives: [
      '투자 성과를 정량적으로 분석할 수 있다.',
      '자신의 투자 의사결정 과정을 비판적으로 평가할 수 있다.',
      '경제적 사고를 일상생활에 적용할 수 있다.',
      '학습 내용을 종합하여 발표할 수 있다.'
    ],
    concepts: [
      { term: '수익률 계산', brief: '(현재가치-투자금)/투자금 × 100' },
      { term: '벤치마크', brief: '성과 비교를 위한 기준 지표' },
      { term: '행동경제학', brief: '심리가 경제적 결정에 미치는 영향' },
      { term: '확증편향', brief: '자신의 믿음을 확인하려는 경향' },
      { term: '손실회피', brief: '이익보다 손실에 민감한 심리' }
    ],
    activities: [
      {
        title: '투자 성과 발표',
        description: '개인/모둠 투자 성과와 의사결정 과정을 발표합니다.',
        type: 'group'
      },
      {
        title: '의사결정 분석',
        description: '투자 일지를 기반으로 자신의 의사결정 패턴을 분석합니다.',
        type: 'individual'
      },
      {
        title: '일상 적용 토론',
        description: '경제적 사고를 일상의 의사결정에 적용하는 방안을 토론합니다.',
        type: 'group'
      }
    ],
    appFeature: '성과 분석 및 성찰',
    appLink: '/portfolio',
    quiz: [
      {
        question: '100만원을 투자하여 120만원이 되었을 때 수익률은?',
        options: ['12%', '20%', '120%', '1.2%'],
        correctAnswer: 1,
        explanation: '수익률 = (120-100)/100 × 100 = 20%입니다.'
      },
      {
        question: '투자에서 손실회피 편향이 나타나면 어떤 행동을 하기 쉬운가요?',
        options: ['손실 종목을 빨리 매도한다', '손실 종목을 계속 보유한다', '추가 매수한다', '분산투자한다'],
        correctAnswer: 1,
        explanation: '손실회피 편향으로 인해 손실을 확정하기 싫어서 손실 종목을 계속 보유하는 경향이 있습니다.'
      },
      {
        question: '합리적인 투자자가 되기 위해 가장 중요한 것은?',
        options: ['항상 수익을 내는 것', '자신의 편향을 인식하고 보완하는 것', '남들과 같은 투자를 하는 것', '최신 정보만 따르는 것'],
        correctAnswer: 1,
        explanation: '완벽한 투자는 불가능하지만, 자신의 심리적 편향을 인식하고 이를 보완하려는 노력이 합리적 투자의 핵심입니다.'
      }
    ],
    resources: [
      { title: '행동경제학 입문', type: 'video', description: '투자 심리와 편향 이해하기' },
      { title: '성과 분석 방법론', type: 'article', description: '투자 성과를 객관적으로 평가하는 방법' },
      { title: '투자 성찰 워크시트', type: 'interactive', description: '체계적인 투자 성찰을 위한 도구' }
    ],
    teacherNotes: [
      '수익률보다 의사결정 과정의 합리성을 평가하세요.',
      '손실을 본 학생도 배움의 기회로 긍정적으로 안내하세요.',
      '경제적 사고의 일상 적용에 대해 충분히 토론하게 하세요.'
    ]
  }
];

// 2022 개정 교육과정 연계 정보 (6개 교과 확장)
const curriculumInfo = {
  subjects: [
    {
      code: 'ECON_MATH',
      name: '경제수학',
      grade: '고2-3',
      color: '#3B82F6',
      bgColor: 'bg-blue-100',
      standards: [
        { code: '12경수01-02', description: '경제 현상을 수학적으로 모델링하고 해석한다' },
        { code: '12경수02-01', description: '복리 계산과 현재가치를 이해하고 활용한다' },
        { code: '12경수02-02', description: '투자 수익률을 계산하고 비교 분석한다' },
        { code: '12경수03-02', description: '확률 개념을 활용하여 경제적 위험을 평가한다' }
      ]
    },
    {
      code: 'BASIC_MATH',
      name: '기초수학',
      grade: '고1',
      color: '#10B981',
      bgColor: 'bg-emerald-100',
      standards: [
        { code: '기수01-03', description: '비율과 백분율을 실생활에 적용한다' },
        { code: '기수02-01', description: '단순 이자와 복리를 계산한다' },
        { code: '기수02-02', description: '백분율 증가와 감소를 계산한다' }
      ]
    },
    {
      code: 'COMMON_SOC1',
      name: '공통사회1',
      grade: '고1',
      color: '#F59E0B',
      bgColor: 'bg-amber-100',
      standards: [
        { code: '10공사1-02', description: '경제생활과 합리적 선택을 이해한다' },
        { code: '10공사1-03', description: '시장경제의 원리를 설명한다' },
        { code: '10공사1-04', description: '금융의 역할과 합리적 금융생활을 이해한다' }
      ]
    },
    {
      code: 'COMMON_SOC2',
      name: '공통사회2',
      grade: '고1',
      color: '#EF4444',
      bgColor: 'bg-red-100',
      standards: [
        { code: '10공사2-04', description: '글로벌 경제의 특징과 영향을 분석한다' },
        { code: '10공사2-05', description: '국제 무역과 환율의 영향을 이해한다' }
      ]
    },
    {
      code: 'ECONOMICS',
      name: '경제',
      grade: '고2-3',
      color: '#8B5CF6',
      bgColor: 'bg-violet-100',
      standards: [
        { code: '12경제02-01', description: '시장 경제에서 가격이 결정되는 원리를 이해한다' },
        { code: '12경제02-03', description: '자산 관리의 원칙을 알고 이를 생애 주기에 적용한다' },
        { code: '12경제03-01', description: '금융 상품의 특성과 위험을 이해한다' }
      ]
    },
    {
      code: 'INTEGRATED_SOC',
      name: '통합사회',
      grade: '고1',
      color: '#EC4899',
      bgColor: 'bg-pink-100',
      standards: [
        { code: '10통사06-01', description: '시장경제의 기본 원리를 이해한다' },
        { code: '10통사06-02', description: '합리적 선택의 의미와 한계를 파악한다' },
        { code: '10통사06-03', description: '금융 생활의 중요성과 신용 관리를 이해한다' }
      ]
    }
  ],
  competencies: [
    '경제적 사고력', '정보 활용 능력', '합리적 의사결정 능력', '비판적 사고력', '수리 문해력', '데이터 분석력'
  ],
  // Legacy fields for compatibility
  subject: '경제수학 / 기초수학 / 공통사회 / 경제 / 통합사회',
  unit: '경제 모델링 / 금융 수학 / 시장경제 / 합리적 선택'
};

export default function LearningModulePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [expandedLesson, setExpandedLesson] = useState<string | null>('lesson-1');
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'resources'>('content');
  const [quizState, setQuizState] = useState<{
    lessonId: string;
    currentQuestion: number;
    answers: number[];
    showResult: boolean;
  } | null>(null);

  // Load progress from localStorage
  const [progress, setProgress] = useState<{
    completedLessons: string[];
    completedObjectives: Record<string, string[]>;
    quizScores: Record<string, number>;
  }>(() => {
    const saved = localStorage.getItem(`learning_progress_${user?.id}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      completedLessons: [],
      completedObjectives: {},
      quizScores: {}
    };
  });

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(`learning_progress_${user?.id}`, JSON.stringify(progress));
  }, [progress, user?.id]);

  const toggleObjective = (lessonId: string, objective: string) => {
    setProgress(prev => {
      const lessonObjectives = prev.completedObjectives[lessonId] || [];
      const newObjectives = lessonObjectives.includes(objective)
        ? lessonObjectives.filter(o => o !== objective)
        : [...lessonObjectives, objective];

      return {
        ...prev,
        completedObjectives: {
          ...prev.completedObjectives,
          [lessonId]: newObjectives
        }
      };
    });
  };

  const completeLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const completedObjectives = progress.completedObjectives[lessonId] || [];
    const quizScore = progress.quizScores[lessonId];

    if (completedObjectives.length < lesson.objectives.length) {
      toast.error('모든 학습 목표를 완료해주세요.');
      return;
    }

    if (quizScore === undefined || quizScore < 60) {
      toast.error('퀴즈를 통과해야 합니다. (60점 이상)');
      return;
    }

    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId]
    }));
    toast.success('차시 학습을 완료했습니다!');
  };

  const startQuiz = (lessonId: string) => {
    setQuizState({
      lessonId,
      currentQuestion: 0,
      answers: [],
      showResult: false
    });
    setActiveTab('quiz');
  };

  const answerQuiz = (answerIndex: number) => {
    if (!quizState) return;

    const lesson = lessons.find(l => l.id === quizState.lessonId);
    if (!lesson) return;

    const newAnswers = [...quizState.answers, answerIndex];

    if (newAnswers.length >= lesson.quiz.length) {
      // Calculate score
      const correctCount = newAnswers.filter((ans, idx) => ans === lesson.quiz[idx].correctAnswer).length;
      const score = Math.round((correctCount / lesson.quiz.length) * 100);

      setProgress(prev => ({
        ...prev,
        quizScores: {
          ...prev.quizScores,
          [quizState.lessonId]: Math.max(prev.quizScores[quizState.lessonId] || 0, score)
        }
      }));

      setQuizState({
        ...quizState,
        answers: newAnswers,
        showResult: true
      });
    } else {
      setQuizState({
        ...quizState,
        answers: newAnswers,
        currentQuestion: quizState.currentQuestion + 1
      });
    }
  };

  const overallProgress = (progress.completedLessons.length / lessons.length) * 100;
  const isTeacher = user?.role === 'TEACHER';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">학습 모듈</h1>
              <p className="text-gray-600">데이터로 배우는 합리적 투자 의사결정</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">전체 진행률</p>
              <p className="text-xl font-bold text-indigo-600">{Math.round(overallProgress)}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="#6366f1" strokeWidth="6"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 * (1 - overallProgress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <Award className={`w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${overallProgress === 100 ? 'text-yellow-500' : 'text-gray-300'}`} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{progress.completedLessons.length}/{lessons.length}</p>
                <p className="text-sm text-gray-500">완료 차시</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(progress.completedObjectives).flat().length}
                </p>
                <p className="text-sm text-gray-500">달성 목표</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(progress.quizScores).length}
                </p>
                <p className="text-sm text-gray-500">완료 퀴즈</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(progress.quizScores).length > 0
                    ? Math.round(Object.values(progress.quizScores).reduce((a, b) => a + b, 0) / Object.values(progress.quizScores).length)
                    : '-'}
                </p>
                <p className="text-sm text-gray-500">평균 점수</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Info - 6 subjects */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          2022 개정 교육과정 연계 (6개 교과)
        </h2>

        {/* Subject Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {curriculumInfo.subjects.map((subject) => (
            <div
              key={subject.code}
              className={`p-3 rounded-lg border-2 ${subject.bgColor} hover:shadow-md transition-shadow`}
              style={{ borderColor: subject.color }}
            >
              <p className="font-semibold text-sm" style={{ color: subject.color }}>
                {subject.name}
              </p>
              <p className="text-xs text-gray-500">{subject.grade}</p>
              <p className="text-xs text-gray-600 mt-1">
                {subject.standards.length}개 성취기준
              </p>
            </div>
          ))}
        </div>

        {/* Competencies */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">핵심 역량</p>
          <div className="flex flex-wrap gap-2">
            {curriculumInfo.competencies.map((comp, idx) => (
              <span key={idx} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border shadow-sm">
                {comp}
              </span>
            ))}
          </div>
        </div>

        {/* Achievement Standards by Subject - Collapsible */}
        <details className="mt-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-blue-600 flex items-center gap-2">
            <Target className="w-4 h-4" />
            전체 성취기준 보기 ({curriculumInfo.subjects.reduce((acc, s) => acc + s.standards.length, 0)}개)
          </summary>
          <div className="mt-3 space-y-4">
            {curriculumInfo.subjects.map((subject) => (
              <div key={subject.code} className="pl-4 border-l-2" style={{ borderColor: subject.color }}>
                <p className="text-sm font-medium mb-2" style={{ color: subject.color }}>
                  {subject.name} ({subject.grade})
                </p>
                <ul className="space-y-1">
                  {subject.standards.map((standard) => (
                    <li key={standard.code} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border flex-shrink-0">
                        {standard.code}
                      </span>
                      <span>{standard.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        {lessons.map((lesson, index) => {
          const isCompleted = progress.completedLessons.includes(lesson.id);
          const isExpanded = expandedLesson === lesson.id;
          const isLocked = index > 0 && !progress.completedLessons.includes(lessons[index - 1].id);
          const completedObjectivesCount = (progress.completedObjectives[lesson.id] || []).length;
          const quizScore = progress.quizScores[lesson.id];

          return (
            <div
              key={lesson.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                isLocked ? 'opacity-60' : ''
              }`}
            >
              {/* Lesson Header */}
              <button
                onClick={() => !isLocked && setExpandedLesson(isExpanded ? null : lesson.id)}
                className={`w-full p-6 flex items-center justify-between text-left ${
                  isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                }`}
                disabled={isLocked}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-green-600'
                      : isLocked
                        ? 'bg-gray-100'
                        : 'bg-gradient-to-br from-indigo-400 to-indigo-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : isLocked ? (
                      <span className="text-xl font-bold text-gray-400">{index + 1}</span>
                    ) : (
                      <span className="text-xl font-bold text-white">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-500">{lesson.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {lesson.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" /> {completedObjectivesCount}/{lesson.objectives.length} 목표
                      </span>
                      {quizScore !== undefined && (
                        <span className={`flex items-center gap-1 ${quizScore >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                          <Brain className="w-3 h-3" /> 퀴즈 {quizScore}점
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      완료
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Lesson Content */}
              {isExpanded && !isLocked && (
                <div className="border-t">
                  {/* Tabs */}
                  <div className="flex border-b bg-gray-50">
                    <button
                      onClick={() => setActiveTab('content')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'content'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      학습 내용
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'quiz'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Brain className="w-4 h-4 inline mr-2" />
                      퀴즈
                      {quizScore !== undefined && (
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                          quizScore >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {quizScore}점
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'resources'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      학습 자료
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === 'content' && (
                      <div className="space-y-6">
                        {/* Description */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700">{lesson.description}</p>
                        </div>

                        {/* Learning Objectives with Checkboxes */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-500" />
                            학습 목표 체크리스트
                          </h4>
                          <div className="space-y-2">
                            {lesson.objectives.map((obj, idx) => {
                              const isChecked = (progress.completedObjectives[lesson.id] || []).includes(obj);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => toggleObjective(lesson.id, obj)}
                                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                                    isChecked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CircleCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  )}
                                  <span className={`text-sm ${isChecked ? 'text-green-800' : 'text-gray-700'}`}>
                                    {obj}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Key Concepts */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            핵심 개념
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {lesson.concepts.map((concept, idx) => (
                              <Link
                                key={idx}
                                to={`/concepts?search=${encodeURIComponent(concept.term)}`}
                                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">{concept.term}</span>
                                  <p className="text-xs text-gray-500">{concept.brief}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Activities */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Play className="w-5 h-5 text-purple-500" />
                            학습 활동
                          </h4>
                          <div className="space-y-3">
                            {lesson.activities.map((activity, idx) => (
                              <div key={idx} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                                <span className="w-8 h-8 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900">{activity.title}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                      activity.type === 'individual' ? 'bg-blue-100 text-blue-700' :
                                      activity.type === 'group' ? 'bg-green-100 text-green-700' :
                                      'bg-orange-100 text-orange-700'
                                    }`}>
                                      {activity.type === 'individual' ? '개인' : activity.type === 'group' ? '모둠' : '실습'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Teacher Notes */}
                        {isTeacher && lesson.teacherNotes && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              교사 참고사항
                            </h4>
                            <ul className="space-y-1">
                              {lesson.teacherNotes.map((note, idx) => (
                                <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                                  <span>•</span>
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t">
                          <Link
                            to={lesson.appLink}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <TrendingUp className="w-5 h-5" />
                            {lesson.appFeature} 시작하기
                          </Link>
                          <Link
                            to={`/reflection?lesson=${lesson.id}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FileText className="w-5 h-5" />
                            학습 성찰 일지
                          </Link>
                          <button
                            onClick={() => startQuiz(lesson.id)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <Brain className="w-5 h-5" />
                            퀴즈 풀기
                          </button>
                          <button
                            onClick={() => completeLesson(lesson.id)}
                            disabled={isCompleted}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors ${
                              isCompleted
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            <CheckCircle className="w-5 h-5" />
                            {isCompleted ? '완료됨' : '학습 완료하기'}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div>
                        {quizState?.lessonId === lesson.id && !quizState.showResult ? (
                          // Quiz in progress
                          <div className="max-w-2xl mx-auto">
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                  문제 {quizState.currentQuestion + 1} / {lesson.quiz.length}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {Math.round(((quizState.currentQuestion) / lesson.quiz.length) * 100)}% 완료
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full transition-all"
                                  style={{ width: `${((quizState.currentQuestion) / lesson.quiz.length) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-xl">
                              <p className="text-lg font-medium text-gray-900 mb-6">
                                {lesson.quiz[quizState.currentQuestion].question}
                              </p>
                              <div className="space-y-3">
                                {lesson.quiz[quizState.currentQuestion].options.map((option, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => answerQuiz(idx)}
                                    className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                                  >
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full mr-3 text-sm">
                                      {idx + 1}
                                    </span>
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : quizState?.lessonId === lesson.id && quizState.showResult ? (
                          // Quiz result
                          <div className="max-w-2xl mx-auto">
                            <div className={`p-6 rounded-xl text-center mb-6 ${
                              progress.quizScores[lesson.id] >= 60
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                progress.quizScores[lesson.id] >= 60 ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {progress.quizScores[lesson.id] >= 60 ? (
                                  <Award className="w-10 h-10 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-10 h-10 text-red-600" />
                                )}
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {progress.quizScores[lesson.id]}점
                              </h3>
                              <p className={progress.quizScores[lesson.id] >= 60 ? 'text-green-700' : 'text-red-700'}>
                                {progress.quizScores[lesson.id] >= 60
                                  ? '축하합니다! 퀴즈를 통과했습니다.'
                                  : '아쉽네요. 60점 이상이어야 통과입니다.'}
                              </p>
                            </div>

                            {/* Review answers */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900">문제 풀이 확인</h4>
                              {lesson.quiz.map((q, idx) => {
                                const userAnswer = quizState.answers[idx];
                                const isCorrect = userAnswer === q.correctAnswer;
                                return (
                                  <div key={idx} className={`p-4 rounded-lg border ${
                                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                  }`}>
                                    <p className="font-medium text-gray-900 mb-2">{idx + 1}. {q.question}</p>
                                    <p className={`text-sm mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                      내 답: {q.options[userAnswer]}
                                      {!isCorrect && <span className="ml-2">→ 정답: {q.options[q.correctAnswer]}</span>}
                                    </p>
                                    <p className="text-sm text-gray-600 bg-white p-2 rounded">
                                      <HelpCircle className="w-4 h-4 inline mr-1" />
                                      {q.explanation}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => startQuiz(lesson.id)}
                              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              다시 풀기
                            </button>
                          </div>
                        ) : (
                          // Quiz start
                          <div className="text-center py-8">
                            <div className="w-20 h-20 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                              <Brain className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {lesson.title.split(':')[0]} 퀴즈
                            </h3>
                            <p className="text-gray-600 mb-6">
                              {lesson.quiz.length}개의 문제로 학습 내용을 확인합니다.
                              <br />
                              <span className="text-sm text-gray-500">60점 이상 통과 / 최고 점수 기록</span>
                            </p>
                            {quizScore !== undefined && (
                              <p className="mb-4 text-sm">
                                <span className={`px-3 py-1 rounded-full ${
                                  quizScore >= 60 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  현재 최고 점수: {quizScore}점
                                </span>
                              </p>
                            )}
                            <button
                              onClick={() => startQuiz(lesson.id)}
                              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              퀴즈 시작하기
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'resources' && (
                      <div className="space-y-4">
                        <p className="text-gray-600 mb-4">
                          이 차시와 관련된 추가 학습 자료입니다.
                        </p>
                        {lesson.resources.map((resource, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className={`p-2 rounded-lg ${
                              resource.type === 'video' ? 'bg-red-100' :
                              resource.type === 'article' ? 'bg-blue-100' :
                              'bg-green-100'
                            }`}>
                              {resource.type === 'video' ? (
                                <Video className={`w-5 h-5 text-red-600`} />
                              ) : resource.type === 'article' ? (
                                <FileText className={`w-5 h-5 text-blue-600`} />
                              ) : (
                                <Play className={`w-5 h-5 text-green-600`} />
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{resource.title}</h5>
                              <p className="text-sm text-gray-500">{resource.description}</p>
                              <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                                {resource.type === 'video' ? '동영상' :
                                 resource.type === 'article' ? '읽기 자료' : '인터랙티브'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Links to other pages */}
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-medium text-gray-900 mb-3">관련 앱 기능</h4>
                          <div className="flex flex-wrap gap-3">
                            <Link to="/concepts" className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
                              <Lightbulb className="w-4 h-4" />
                              개념 사전
                            </Link>
                            <Link to={lesson.appLink} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">
                              <BarChart3 className="w-4 h-4" />
                              {lesson.appFeature}
                            </Link>
                            <Link to="/reflection" className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                              <FileText className="w-4 h-4" />
                              성찰 일지
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Certificate */}
      {progress.completedLessons.length === lessons.length && (
        <div className="mt-8 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 rounded-xl p-8 border-2 border-yellow-200 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Award className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            축하합니다! 모든 학습을 완료했습니다.
          </h3>
          <p className="text-gray-600 mb-6">
            4차시의 학습을 모두 마쳤습니다. 배운 내용을 실제 투자에 적용해보세요.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/reflection"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors"
            >
              최종 성찰 작성하기
            </Link>
            <Link
              to="/portfolio"
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              투자 성과 확인하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
