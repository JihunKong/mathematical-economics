import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Rocket,
  TrendingUp,
  PieChart,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle,
  Circle,
  ArrowRight,
  Play,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Clock,
  Users,
  BarChart3,
  FileText,
  HelpCircle,
  Sparkles,
  Zap,
  Brain,
  Award,
  AlertTriangle,
  DollarSign,
  Calculator,
  LineChart,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import { CURRICULUM_SUBJECTS, SubjectCode } from '../data/curriculumData';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'watchlist',
    title: '1단계: 관심 종목 설정',
    description: '투자하고 싶은 종목들을 관심 목록에 추가하세요. 다양한 업종의 기업들을 탐색해보세요.',
    icon: Star,
    link: '/watchlist-setup',
    color: 'yellow'
  },
  {
    id: 'learning',
    title: '2단계: 학습 모듈 시작',
    description: '주식시장의 기본 개념과 투자 원칙을 배워보세요. 4차시 커리큘럼이 준비되어 있습니다.',
    icon: BookOpen,
    link: '/learning',
    color: 'blue'
  },
  {
    id: 'concepts',
    title: '3단계: 경제 개념 탐색',
    description: 'PER, PBR, 분산투자 등 투자에 필요한 핵심 개념들을 익혀보세요.',
    icon: Lightbulb,
    link: '/concepts',
    color: 'amber'
  },
  {
    id: 'trading',
    title: '4단계: 첫 거래 시작',
    description: '1,000만원의 가상 자금으로 실제처럼 주식을 사고 팔아보세요.',
    icon: TrendingUp,
    link: '/trading',
    color: 'green'
  },
  {
    id: 'portfolio',
    title: '5단계: 포트폴리오 분석',
    description: '내 투자 현황과 수익률을 확인하고 분석해보세요.',
    icon: PieChart,
    link: '/portfolio',
    color: 'purple'
  },
  {
    id: 'reflection',
    title: '6단계: 성찰 일지 작성',
    description: '투자 결정에 대해 되돌아보고 AI 피드백을 받아보세요.',
    icon: FileText,
    link: '/reflection',
    color: 'indigo'
  }
];

const investmentBasics = [
  {
    title: '주식이란?',
    content: '주식은 회사의 소유권 일부를 의미합니다. 주식을 사면 그 회사의 주주(owner)가 되어 회사가 잘되면 함께 이익을 얻을 수 있습니다.',
    icon: Building2Icon
  },
  {
    title: '왜 투자를 배워야 할까?',
    content: '경제적 자립과 미래 준비를 위해 투자 지식은 필수입니다. 일찍 배울수록 복리의 마법을 더 오래 누릴 수 있어요.',
    icon: Target
  },
  {
    title: '분산투자란?',
    content: '"계란을 한 바구니에 담지 마라" - 여러 종목에 나누어 투자하면 한 종목이 떨어져도 전체 손실을 줄일 수 있습니다.',
    icon: PieChart
  },
  {
    title: '기회비용이란?',
    content: '어떤 선택을 했을 때 포기해야 하는 다른 선택의 가치입니다. 투자 결정을 할 때 항상 기회비용을 생각해보세요.',
    icon: Calculator
  }
];

// Simple Building icon since lucide doesn't have Building2
function Building2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  );
}

const safetyTips = [
  '실제 돈이 아닌 가상 자금으로 연습합니다',
  '손실이 나도 괜찮아요, 배움의 기회입니다',
  '거래할 때 반드시 이유를 적어야 합니다',
  '급하게 결정하지 말고 충분히 분석하세요',
  '다른 친구들의 투자를 무작정 따라하지 마세요'
];

const faqs: FAQ[] = [
  {
    question: '처음 받는 가상 자금은 얼마인가요?',
    answer: '모든 학생은 처음 가입 시 1,000만원의 가상 자금을 받습니다. 이 자금으로 자유롭게 주식 투자를 연습할 수 있어요.'
  },
  {
    question: '실제 돈을 잃을 수 있나요?',
    answer: '아니요! 이 앱은 100% 모의투자입니다. 가상 자금만 사용하므로 실제 돈을 잃을 걱정은 전혀 없습니다. 마음껏 연습하세요!'
  },
  {
    question: '거래 시간이 정해져 있나요?',
    answer: '실제 주식시장처럼 평일 오전 9시~오후 3시 30분에 거래가 가능합니다. 이 시간에 실시간 가격이 반영됩니다.'
  },
  {
    question: '하루에 몇 번까지 거래할 수 있나요?',
    answer: '종목당 하루 3회까지 거래할 수 있습니다. 이는 충동적인 거래를 방지하고 신중하게 결정하도록 돕기 위한 것입니다.'
  },
  {
    question: '리더보드는 어떻게 결정되나요?',
    answer: '수익률(%)을 기준으로 순위가 결정됩니다. 수익률이 같으면 거래 횟수가 적은 학생이 더 높은 순위를 받습니다.'
  },
  {
    question: '성찰 일지는 왜 써야 하나요?',
    answer: '투자 결정을 되돌아보면 같은 실수를 반복하지 않고, 좋은 판단력을 기를 수 있습니다. AI가 피드백도 제공해드려요!'
  },
  {
    question: '선생님이 내 투자 내역을 볼 수 있나요?',
    answer: '네, 선생님은 학생들의 투자 현황과 성찰 일지를 확인할 수 있습니다. 이는 학습 지도를 위한 것이니 걱정하지 마세요.'
  },
  {
    question: '잘 모르는 종목은 어떻게 공부하나요?',
    answer: '종목 상세 페이지에서 기업 정보와 뉴스를 확인할 수 있고, 경제 개념 사전에서 관련 지표들을 공부할 수 있습니다.'
  }
];

const quickTips = [
  { emoji: '📊', tip: '투자 전 해당 기업의 뉴스를 꼭 확인하세요' },
  { emoji: '📈', tip: '한 종목에 전 재산을 투자하지 마세요' },
  { emoji: '🎯', tip: '투자 목표와 기간을 미리 정해두세요' },
  { emoji: '📝', tip: '거래할 때 이유를 상세히 적으면 나중에 도움이 됩니다' },
  { emoji: '🧘', tip: '급등/급락에 흥분하지 말고 침착하게 분석하세요' },
  { emoji: '📚', tip: '모르는 용어가 나오면 경제 개념 사전을 활용하세요' }
];

export default function StudentGuidePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'guide' | 'basics' | 'tips' | 'faq'>('guide');

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`onboarding_${user?.id}`);
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, [user?.id]);

  const toggleStep = (stepId: string) => {
    const newSteps = completedSteps.includes(stepId)
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId];
    setCompletedSteps(newSteps);
    localStorage.setItem(`onboarding_${user?.id}`, JSON.stringify(newSteps));
  };

  const progress = (completedSteps.length / onboardingSteps.length) * 100;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Rocket className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">경제수학 모의투자 시작하기</h1>
            <p className="text-white/80 mt-1">
              {user?.name || '학생'}님, 투자의 세계에 오신 것을 환영합니다!
            </p>
          </div>
        </div>

        <p className="text-lg text-white/90 mb-6">
          이 앱에서 가상 자금으로 실제 주식시장을 경험하며 경제 원리와 투자 기법을 배워보세요.
          실패해도 괜찮아요, 모든 경험이 배움입니다!
        </p>

        {/* Progress */}
        <div className="bg-white/20 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">시작 가이드 진행률</span>
            <span className="font-bold">{completedSteps.length} / {onboardingSteps.length}</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && (
            <p className="mt-2 text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              축하합니다! 모든 시작 단계를 완료했어요!
            </p>
          )}
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'guide', label: '시작 가이드', icon: Rocket },
          { id: 'basics', label: '투자 기초', icon: BookOpen },
          { id: 'tips', label: '투자 팁', icon: Lightbulb },
          { id: 'faq', label: '자주 묻는 질문', icon: HelpCircle }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <section.icon className="w-5 h-5" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Guide Section */}
      {activeSection === 'guide' && (
        <div className="space-y-6">
          {/* Onboarding Steps */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              시작 체크리스트
            </h2>

            <div className="space-y-4">
              {onboardingSteps.map((step, idx) => {
                const colors = getColorClasses(step.color);
                const isCompleted = completedSteps.includes(step.id);

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCompleted ? 'bg-green-50 border-green-200' : `bg-gray-50 ${colors.border}`
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : `${colors.bg} ${colors.text}`
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="font-bold">{idx + 1}</span>
                        )}
                      </button>

                      <div className="flex-1">
                        <h3 className={`font-semibold ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm mt-1 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                          {step.description}
                        </p>
                      </div>

                      <Link
                        to={step.link}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : `${colors.bg} ${colors.text} hover:opacity-80`
                        }`}
                      >
                        {isCompleted ? '다시 보기' : '시작하기'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/dashboard"
              className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
            >
              <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900">내 대시보드</h3>
              <p className="text-sm text-gray-600 mt-1">투자 현황 한눈에 보기</p>
            </Link>

            <Link
              to="/leaderboard"
              className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow"
            >
              <Award className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-gray-900">리더보드</h3>
              <p className="text-sm text-gray-600 mt-1">친구들과 수익률 비교</p>
            </Link>

            <Link
              to="/trading"
              className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow"
            >
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900">거래하기</h3>
              <p className="text-sm text-gray-600 mt-1">주식 매수/매도 시작</p>
            </Link>
          </div>

          {/* Safety Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              안전한 투자 연습을 위한 안내
            </h3>
            <ul className="space-y-2">
              {safetyTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-amber-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Curriculum Connection - 2022 개정 교육과정 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              이 앱에서 배우는 교과 (2022 개정 교육과정)
            </h3>
            <p className="text-gray-600 mb-4">
              경제수학 모의투자 앱은 6개 교과의 학습 내용과 연계되어 있습니다.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {Object.values(CURRICULUM_SUBJECTS).map((subject) => (
                <div
                  key={subject.code}
                  className={`p-3 rounded-lg border-2 ${subject.bgColor} hover:shadow-md transition-shadow cursor-pointer`}
                  style={{ borderColor: subject.color }}
                >
                  <p className="font-semibold text-sm" style={{ color: subject.color }}>
                    {subject.name}
                  </p>
                  <p className="text-xs text-gray-500">{subject.grade}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {subject.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/learning"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                학습 모듈에서 교과 연계 확인
              </Link>
              <Link
                to="/activities"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                교과 연계 활동 보기
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Basics Section */}
      {activeSection === 'basics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              투자 기초 개념
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {investmentBasics.map((item, idx) => (
                <div key={idx} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Indicators */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LineChart className="w-6 h-6 text-green-600" />
              꼭 알아야 할 투자 지표
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">PER (주가수익비율)</h3>
                <p className="text-green-700 mb-2">주가 ÷ 주당순이익 = PER</p>
                <p className="text-sm text-green-600">
                  숫자가 낮을수록 저평가, 높을수록 고평가된 것으로 볼 수 있어요.
                  업종마다 적정 수준이 다르니 같은 업종끼리 비교하세요.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">PBR (주가순자산비율)</h3>
                <p className="text-blue-700 mb-2">주가 ÷ 주당순자산 = PBR</p>
                <p className="text-sm text-blue-600">
                  1보다 낮으면 회사 자산보다 주가가 낮다는 의미입니다.
                  하지만 낮다고 무조건 좋은 건 아니에요!
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="font-semibold text-purple-800 mb-2">수익률 계산법</h3>
                <p className="text-purple-700 mb-2">(현재가 - 매수가) ÷ 매수가 × 100 = 수익률(%)</p>
                <p className="text-sm text-purple-600">
                  예: 10,000원에 사서 12,000원이 되면 (12,000-10,000)÷10,000×100 = 20% 수익!
                </p>
              </div>
            </div>

            <Link
              to="/concepts"
              className="mt-6 flex items-center justify-center gap-2 p-4 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors"
            >
              <Brain className="w-5 h-5" />
              더 많은 경제 개념 배우기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Investment Principles */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-6 h-6 text-indigo-600" />
              워렌 버핏의 투자 원칙
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-white/80 rounded-lg">
                <p className="font-medium text-gray-800">"규칙 1: 절대 돈을 잃지 마라."</p>
                <p className="text-sm text-gray-600">"규칙 2: 규칙 1을 절대 잊지 마라."</p>
              </div>
              <p className="text-gray-600">
                손실을 피하는 것이 수익을 내는 것보다 중요합니다. 모의투자에서 이 원칙을 연습해보세요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {activeSection === 'tips' && (
        <div className="space-y-6">
          {/* Quick Tips */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              투자 꿀팁
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {quickTips.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
                  <span className="text-2xl">{item.emoji}</span>
                  <p className="text-gray-700">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Do's and Don'ts */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                이렇게 하세요
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>투자 전 기업에 대해 충분히 조사하기</span>
                </li>
                <li className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>여러 종목에 분산 투자하기</span>
                </li>
                <li className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>거래 이유를 상세히 기록하기</span>
                </li>
                <li className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>손실이 나면 원인 분석하기</span>
                </li>
                <li className="flex items-start gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>장기적 관점으로 투자하기</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                이건 피하세요
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>남이 산다고 따라 사기 (묻지마 투자)</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>한 종목에 전 재산 투자하기</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>급등주를 쫓아 높은 가격에 사기</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>손실이 나면 화가 나서 바로 팔기</span>
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>기업 분석 없이 감으로 투자하기</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Learning Path */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              추천 학습 순서
            </h2>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200" />

              <div className="space-y-6">
                {[
                  { week: '1주차', title: '주식시장 이해하기', tasks: ['주식이란 무엇인가', '시장 용어 익히기', '관심 종목 찾기'] },
                  { week: '2주차', title: '첫 투자 시작하기', tasks: ['기업 분석 방법 배우기', '첫 매수 경험하기', '거래 이유 기록하기'] },
                  { week: '3주차', title: '포트폴리오 관리', tasks: ['분산투자 실천하기', '수익률 분석하기', '리밸런싱 이해하기'] },
                  { week: '4주차', title: '투자 성찰하기', tasks: ['투자 결과 분석', '배운 점 정리', '다음 전략 수립'] }
                ].map((item, idx) => (
                  <div key={idx} className="relative pl-14">
                    <div className="absolute left-4 w-5 h-5 bg-indigo-600 rounded-full border-4 border-white shadow" />
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <span className="text-xs font-medium text-indigo-600">{item.week}</span>
                      <h3 className="font-semibold text-gray-900 mt-1">{item.title}</h3>
                      <ul className="mt-2 space-y-1">
                        {item.tasks.map((task, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <Circle className="w-2 h-2 text-gray-400" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {activeSection === 'faq' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-purple-600" />
              자주 묻는 질문
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4 text-gray-600 border-t bg-gray-50">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">더 궁금한 게 있나요?</h3>
                <p className="text-gray-600 mb-4">
                  질문이 있으면 선생님께 문의하거나, 학습 모듈의 각 차시 내용을 확인해보세요.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/learning"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <BookOpen className="w-4 h-4" />
                    학습 모듈 보기
                  </Link>
                  <Link
                    to="/concepts"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    개념 사전
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">준비되셨나요?</h3>
        <p className="text-green-100 mb-4">지금 바로 투자를 시작해보세요!</p>
        <Link
          to="/trading"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors"
        >
          <Play className="w-5 h-5" />
          거래 시작하기
        </Link>
      </div>
    </div>
  );
}
