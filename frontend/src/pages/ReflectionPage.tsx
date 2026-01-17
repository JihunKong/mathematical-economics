import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  PenSquare,
  Calendar,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Trash2,
  Plus,
  BookOpen,
  Brain,
  TrendingUp,
  Target,
  Award,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  LineChart,
  PieChart,
  RefreshCw,
  Zap,
  AlertCircle,
  ThumbsUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';
import toast from 'react-hot-toast';

interface ReflectionEntry {
  id: string;
  lessonId: string;
  date: string;
  questions: {
    whatLearned: string;
    whatDifficult: string;
    howApply: string;
    nextGoal: string;
  };
  investmentReflection?: {
    decision: string;
    reasoning: string;
    outcome: string;
    wouldChange: string;
  };
  rating: number;
  aiFeedback?: AIFeedback;
}

interface AIFeedback {
  strengths: string[];
  suggestions: string[];
  relatedConcepts: string[];
  encouragement: string;
  growthTip: string;
  score: {
    depth: number;
    application: number;
    selfAwareness: number;
  };
}

interface LearningInsight {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const lessonTitles: Record<string, string> = {
  'lesson-1': '1차시: 주식시장의 이해와 정보 탐색',
  'lesson-2': '2차시: 투자 의사결정과 기회비용',
  'lesson-3': '3차시: 포트폴리오와 위험 분산',
  'lesson-4': '4차시: 투자 성과 분석과 경제적 성찰',
  'general': '일반 성찰'
};

const reflectionPrompts = {
  whatLearned: '오늘 배운 가장 중요한 내용은 무엇인가요?',
  whatDifficult: '어려웠거나 더 알고 싶은 부분이 있나요?',
  howApply: '배운 내용을 어떻게 실제 투자에 적용할 수 있을까요?',
  nextGoal: '다음 학습에서 달성하고 싶은 목표는 무엇인가요?'
};

const investmentPrompts = {
  decision: '어떤 투자 결정을 내렸나요? (매수/매도/보유)',
  reasoning: '그 결정을 내린 이유는 무엇인가요?',
  outcome: '결과는 어땠나요? (또는 예상 결과)',
  wouldChange: '다시 결정한다면 무엇을 바꾸고 싶나요?'
};

// Keywords for AI analysis
const economicKeywords = {
  basic: ['주식', '가격', '매수', '매도', '투자', '수익', '손실', '거래'],
  intermediate: ['분산투자', '포트폴리오', '리스크', '수익률', '기회비용', 'PER', 'PBR', '배당'],
  advanced: ['변동성', '베타', '알파', '샤프비율', '헤지', '선물', '옵션', '레버리지'],
  emotional: ['불안', '흥분', '후회', '만족', '자신감', '두려움', '조급함', '인내'],
  analytical: ['분석', '예측', '비교', '평가', '검토', '연구', '데이터', '차트']
};

// AI Feedback Generator (rule-based simulation)
function generateAIFeedback(entry: ReflectionEntry): AIFeedback {
  const allText = `${entry.questions.whatLearned} ${entry.questions.whatDifficult} ${entry.questions.howApply} ${entry.questions.nextGoal} ${entry.investmentReflection?.decision || ''} ${entry.investmentReflection?.reasoning || ''}`.toLowerCase();

  const strengths: string[] = [];
  const suggestions: string[] = [];
  const relatedConcepts: string[] = [];

  // Analyze content depth
  const wordCount = allText.split(/\s+/).filter(w => w.length > 1).length;
  const depthScore = Math.min(100, Math.round((wordCount / 100) * 100));

  // Detect keywords and concepts
  let intermediateCount = 0;
  let advancedCount = 0;
  let analyticalCount = 0;
  let emotionalCount = 0;

  economicKeywords.intermediate.forEach(kw => {
    if (allText.includes(kw)) {
      intermediateCount++;
      relatedConcepts.push(kw);
    }
  });

  economicKeywords.advanced.forEach(kw => {
    if (allText.includes(kw)) {
      advancedCount++;
      relatedConcepts.push(kw);
    }
  });

  economicKeywords.analytical.forEach(kw => {
    if (allText.includes(kw)) analyticalCount++;
  });

  economicKeywords.emotional.forEach(kw => {
    if (allText.includes(kw)) emotionalCount++;
  });

  // Generate strengths
  if (wordCount > 50) strengths.push('성찰 내용이 풍부하고 상세합니다');
  if (intermediateCount > 2) strengths.push('중급 경제 개념을 잘 활용하고 있습니다');
  if (advancedCount > 0) strengths.push('고급 투자 개념에 대한 이해가 돋보입니다');
  if (analyticalCount > 1) strengths.push('분석적 사고력이 뛰어납니다');
  if (emotionalCount > 0) strengths.push('감정 인식과 자기 성찰이 훌륭합니다');
  if (entry.questions.howApply.length > 50) strengths.push('실제 적용 방안을 구체적으로 고민하고 있습니다');
  if (entry.questions.nextGoal.length > 30) strengths.push('명확한 학습 목표를 설정했습니다');
  if (entry.investmentReflection?.reasoning && entry.investmentReflection.reasoning.length > 30) {
    strengths.push('투자 결정에 대한 논리적 근거를 제시하고 있습니다');
  }

  if (strengths.length === 0) strengths.push('꾸준한 성찰 습관을 기르고 있습니다');

  // Generate suggestions
  if (wordCount < 30) suggestions.push('성찰 내용을 좀 더 구체적으로 작성해보세요');
  if (intermediateCount === 0) suggestions.push('학습한 경제 개념(예: 분산투자, 기회비용)을 활용해 설명해보세요');
  if (analyticalCount === 0) suggestions.push('데이터나 차트를 활용한 분석을 시도해보세요');
  if (entry.questions.howApply.length < 20) suggestions.push('배운 내용을 실제 투자에 어떻게 적용할지 더 고민해보세요');
  if (!entry.investmentReflection?.wouldChange) suggestions.push('개선점을 찾아보는 것도 중요한 학습입니다');
  if (emotionalCount === 0) suggestions.push('투자 시 느낀 감정도 기록해보면 좋습니다');

  if (suggestions.length === 0) suggestions.push('지금처럼 꾸준히 성찰을 이어가세요!');

  // Calculate scores
  const applicationScore = Math.min(100, Math.round(
    (entry.questions.howApply.length / 100) * 50 +
    (entry.questions.nextGoal.length / 50) * 30 +
    (entry.investmentReflection?.decision ? 20 : 0)
  ));

  const selfAwarenessScore = Math.min(100, Math.round(
    (emotionalCount * 20) +
    (entry.questions.whatDifficult.length / 50) * 30 +
    (entry.investmentReflection?.wouldChange?.length ? 30 : 0) +
    (entry.rating ? 20 : 0)
  ));

  // Encouragement messages based on lesson
  const encouragements: Record<string, string[]> = {
    'lesson-1': [
      '주식시장의 기본 개념을 탄탄히 다지고 있네요! 🎯',
      '정보 탐색 능력이 점점 향상되고 있습니다! 📊',
      '시장을 보는 눈이 점점 밝아지고 있어요! 👀'
    ],
    'lesson-2': [
      '의사결정 과정에 대한 이해가 깊어지고 있습니다! 🤔',
      '기회비용 개념을 잘 적용하고 있네요! 💡',
      '합리적 의사결정의 첫걸음을 내딛었습니다! 🚀'
    ],
    'lesson-3': [
      '위험 분산의 중요성을 체득하고 있네요! 🛡️',
      '포트폴리오 사고방식이 발전하고 있습니다! 📈',
      '현명한 투자자로 성장하고 있어요! 🌟'
    ],
    'lesson-4': [
      '깊이 있는 성과 분석을 하고 있습니다! 🏆',
      '투자 경험을 지혜로 바꾸고 있네요! 💎',
      '경제적 사고력이 크게 향상되었습니다! 🎓'
    ],
    'general': [
      '꾸준한 성찰이 실력을 만듭니다! 💪',
      '매일 조금씩 성장하고 있어요! 🌱',
      '훌륭한 투자 습관을 기르고 있습니다! ⭐'
    ]
  };

  const lessonEncouragements = encouragements[entry.lessonId] || encouragements['general'];
  const encouragement = lessonEncouragements[Math.floor(Math.random() * lessonEncouragements.length)];

  // Growth tips
  const growthTips = [
    '매일 경제 뉴스 한 개씩 읽어보세요',
    '투자 일지를 꾸준히 작성하면 패턴을 발견할 수 있어요',
    '다른 학생들의 투자 전략도 참고해보세요',
    '감정적 투자를 줄이려면 미리 규칙을 정해두세요',
    '손실도 배움의 기회입니다',
    '분산투자의 효과를 직접 실험해보세요',
    '장기 투자와 단기 투자의 차이를 경험해보세요'
  ];

  return {
    strengths: strengths.slice(0, 3),
    suggestions: suggestions.slice(0, 3),
    relatedConcepts: [...new Set(relatedConcepts)].slice(0, 5),
    encouragement,
    growthTip: growthTips[Math.floor(Math.random() * growthTips.length)],
    score: {
      depth: depthScore,
      application: applicationScore,
      selfAwareness: selfAwarenessScore
    }
  };
}

// Calculate streak
function calculateStreak(entries: ReflectionEntry[]): number {
  if (entries.length === 0) return 0;

  const sortedDates = entries
    .map(e => new Date(e.date).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (sortedDates[i] === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Generate learning insights
function generateInsights(entries: ReflectionEntry[]): LearningInsight[] {
  if (entries.length < 2) return [];

  const recentEntries = entries.slice(0, 5);
  const olderEntries = entries.slice(5, 10);

  const insights: LearningInsight[] = [];

  // Average word count trend
  const recentAvgWords = recentEntries.reduce((sum, e) =>
    sum + (e.questions.whatLearned + e.questions.howApply).split(/\s+/).length, 0
  ) / recentEntries.length;

  const olderAvgWords = olderEntries.length > 0
    ? olderEntries.reduce((sum, e) =>
        sum + (e.questions.whatLearned + e.questions.howApply).split(/\s+/).length, 0
      ) / olderEntries.length
    : recentAvgWords;

  insights.push({
    category: '성찰 깊이',
    count: Math.round(recentAvgWords),
    trend: recentAvgWords > olderAvgWords * 1.1 ? 'up' : recentAvgWords < olderAvgWords * 0.9 ? 'down' : 'stable',
    description: '평균 단어 수 기준'
  });

  // Rating trend
  const recentAvgRating = recentEntries.reduce((sum, e) => sum + e.rating, 0) / recentEntries.length;
  const olderAvgRating = olderEntries.length > 0
    ? olderEntries.reduce((sum, e) => sum + e.rating, 0) / olderEntries.length
    : recentAvgRating;

  insights.push({
    category: '학습 만족도',
    count: parseFloat(recentAvgRating.toFixed(1)),
    trend: recentAvgRating > olderAvgRating + 0.3 ? 'up' : recentAvgRating < olderAvgRating - 0.3 ? 'down' : 'stable',
    description: '최근 5회 평균'
  });

  // Investment reflection frequency
  const recentInvestmentCount = recentEntries.filter(e => e.investmentReflection?.decision).length;

  insights.push({
    category: '투자 성찰',
    count: recentInvestmentCount,
    trend: recentInvestmentCount >= 3 ? 'up' : 'stable',
    description: '최근 5회 중 작성 횟수'
  });

  return insights;
}

// Extract frequently mentioned keywords
function extractKeywords(entries: ReflectionEntry[]): { word: string; count: number }[] {
  const allText = entries.map(e =>
    `${e.questions.whatLearned} ${e.questions.howApply} ${e.investmentReflection?.reasoning || ''}`
  ).join(' ').toLowerCase();

  const allKeywords = [...economicKeywords.basic, ...economicKeywords.intermediate, ...economicKeywords.advanced];
  const keywordCounts: Record<string, number> = {};

  allKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = allText.match(regex);
    if (matches && matches.length > 0) {
      keywordCounts[keyword] = matches.length;
    }
  });

  return Object.entries(keywordCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export default function ReflectionPage() {
  const [searchParams] = useSearchParams();
  const lessonParam = searchParams.get('lesson') || 'general';
  const { user } = useAppSelector((state) => state.auth);

  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<ReflectionEntry>>({
    lessonId: lessonParam,
    questions: { whatLearned: '', whatDifficult: '', howApply: '', nextGoal: '' },
    investmentReflection: { decision: '', reasoning: '', outcome: '', wouldChange: '' },
    rating: 3
  });
  const [selectedLesson, setSelectedLesson] = useState(lessonParam);
  const [showInsights, setShowInsights] = useState(true);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'history' | 'insights'>('history');
  const [generatingFeedback, setGeneratingFeedback] = useState(false);

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem(`reflections_${user?.id}`);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, [user?.id]);

  // Calculate insights
  const insights = useMemo(() => generateInsights(entries), [entries]);
  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const keywords = useMemo(() => extractKeywords(entries), [entries]);

  // Save entries to localStorage
  const saveEntries = (newEntries: ReflectionEntry[]) => {
    localStorage.setItem(`reflections_${user?.id}`, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleSave = async () => {
    if (!currentEntry.questions?.whatLearned) {
      toast.error('배운 내용을 작성해주세요.');
      return;
    }

    setGeneratingFeedback(true);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newEntry: ReflectionEntry = {
      id: Date.now().toString(),
      lessonId: currentEntry.lessonId || 'general',
      date: new Date().toISOString(),
      questions: currentEntry.questions as ReflectionEntry['questions'],
      investmentReflection: currentEntry.investmentReflection,
      rating: currentEntry.rating || 3,
      aiFeedback: undefined
    };

    // Generate AI feedback
    newEntry.aiFeedback = generateAIFeedback(newEntry);

    saveEntries([newEntry, ...entries]);
    setGeneratingFeedback(false);
    setIsWriting(false);
    setActiveTab('history');
    setCurrentEntry({
      lessonId: lessonParam,
      questions: { whatLearned: '', whatDifficult: '', howApply: '', nextGoal: '' },
      investmentReflection: { decision: '', reasoning: '', outcome: '', wouldChange: '' },
      rating: 3
    });
    toast.success('성찰 일지가 저장되었습니다. AI 피드백을 확인해보세요!');
  };

  const handleDelete = (id: string) => {
    if (confirm('이 성찰 일지를 삭제하시겠습니까?')) {
      saveEntries(entries.filter(e => e.id !== id));
      toast.success('삭제되었습니다.');
    }
  };

  const regenerateFeedback = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      const newFeedback = generateAIFeedback(entry);
      const updatedEntries = entries.map(e =>
        e.id === entryId ? { ...e, aiFeedback: newFeedback } : e
      );
      saveEntries(updatedEntries);
      toast.success('새로운 피드백이 생성되었습니다!');
    }
  };

  const filteredEntries = selectedLesson === 'all'
    ? entries
    : entries.filter(e => e.lessonId === selectedLesson);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <span className="w-4 h-4 text-gray-400">−</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI 학습 성찰 일지</h1>
              <p className="text-gray-600">투자 경험을 되돌아보고 AI의 피드백을 받아보세요</p>
            </div>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-orange-600">{streak}일 연속 성찰</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('write'); setIsWriting(true); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'write'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PenSquare className="w-5 h-5" />
            새 성찰 작성
          </button>
          <button
            onClick={() => { setActiveTab('history'); setIsWriting(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            성찰 기록
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'insights'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Brain className="w-5 h-5" />
            학습 인사이트
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-sm text-gray-500">총 성찰</p>
            <p className="text-2xl font-bold text-gray-900">{entries.length}개</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-sm text-gray-500">이번 주</p>
            <p className="text-2xl font-bold text-purple-600">
              {entries.filter(e => {
                const date = new Date(e.date);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
              }).length}개
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-sm text-gray-500">평균 만족도</p>
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold text-yellow-600">
                {entries.length > 0
                  ? (entries.reduce((sum, e) => sum + e.rating, 0) / entries.length).toFixed(1)
                  : '-'}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-sm text-gray-500">완료 차시</p>
            <p className="text-2xl font-bold text-green-600">
              {new Set(entries.map(e => e.lessonId)).size}개
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-sm text-gray-500">연속 기록</p>
            <div className="flex items-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{streak}일</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Learning Trends */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-600" />
              학습 트렌드
            </h2>

            {insights.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{insight.category}</span>
                      {getTrendIcon(insight.trend)}
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{insight.count}</p>
                    <p className="text-xs text-gray-500">{insight.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>최소 2개 이상의 성찰 기록이 필요합니다</p>
              </div>
            )}
          </div>

          {/* Keyword Analysis */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              자주 언급한 경제 개념
            </h2>

            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${0.1 + (kw.count / (keywords[0]?.count || 1)) * 0.3})`,
                      color: `rgba(88, 28, 135, ${0.6 + (kw.count / (keywords[0]?.count || 1)) * 0.4})`
                    }}
                  >
                    {kw.word} ({kw.count})
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>성찰에서 경제 개념을 더 많이 활용해보세요</p>
              </div>
            )}
          </div>

          {/* Growth Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              성장 요약
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/80 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">💪 강점</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {entries.length >= 3 && <li>• 꾸준한 성찰 습관 형성</li>}
                  {entries.filter(e => e.investmentReflection?.decision).length > 2 && (
                    <li>• 투자 의사결정 성찰 활발</li>
                  )}
                  {entries.filter(e => e.rating >= 4).length > entries.length / 2 && (
                    <li>• 높은 학습 만족도 유지</li>
                  )}
                  {streak >= 3 && <li>• 연속 성찰 기록 달성</li>}
                </ul>
              </div>

              <div className="bg-white/80 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">🎯 개선 포인트</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {entries.length < 5 && <li>• 더 많은 성찰 기록 쌓기</li>}
                  {keywords.length < 5 && <li>• 경제 개념 활용 확대</li>}
                  {entries.filter(e => e.investmentReflection?.wouldChange).length < entries.length / 2 && (
                    <li>• 개선점 분석 습관화</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Writing Form */}
      {activeTab === 'write' && isWriting && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <PenSquare className="w-5 h-5 text-purple-600" />
            새 성찰 일지 작성
          </h2>

          {/* Lesson Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">관련 차시</label>
            <select
              value={currentEntry.lessonId}
              onChange={(e) => setCurrentEntry({ ...currentEntry, lessonId: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {Object.entries(lessonTitles).map(([id, title]) => (
                <option key={id} value={id}>{title}</option>
              ))}
            </select>
          </div>

          {/* Learning Reflection */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              학습 성찰
            </h3>
            {Object.entries(reflectionPrompts).map(([key, prompt]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{prompt}</label>
                <textarea
                  value={currentEntry.questions?.[key as keyof typeof reflectionPrompts] || ''}
                  onChange={(e) => setCurrentEntry({
                    ...currentEntry,
                    questions: {
                      ...currentEntry.questions as ReflectionEntry['questions'],
                      [key]: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="생각을 자유롭게 작성해주세요..."
                />
              </div>
            ))}
          </div>

          {/* Investment Reflection */}
          <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              투자 의사결정 성찰 (선택)
            </h3>
            {Object.entries(investmentPrompts).map(([key, prompt]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{prompt}</label>
                <textarea
                  value={currentEntry.investmentReflection?.[key as keyof typeof investmentPrompts] || ''}
                  onChange={(e) => setCurrentEntry({
                    ...currentEntry,
                    investmentReflection: {
                      decision: '',
                      reasoning: '',
                      outcome: '',
                      wouldChange: '',
                      ...currentEntry.investmentReflection,
                      [key]: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="투자 결정에 대해 되돌아봐주세요..."
                />
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">오늘 학습 만족도</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setCurrentEntry({ ...currentEntry, rating })}
                  className={`w-12 h-12 rounded-full text-lg font-bold transition-all ${
                    currentEntry.rating === rating
                      ? 'bg-purple-600 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* AI Preview */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">AI 피드백 미리보기</span>
            </div>
            <p className="text-sm text-purple-700">
              저장하면 AI가 성찰 내용을 분석하여 강점, 개선점, 관련 개념을 제안해드립니다.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={generatingFeedback}
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {generatingFeedback ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  저장 및 AI 피드백 받기
                </>
              )}
            </button>
            <button
              onClick={() => { setIsWriting(false); setActiveTab('history'); }}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLesson('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedLesson === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {Object.entries(lessonTitles).map(([id, title]) => (
                <button
                  key={id}
                  onClick={() => setSelectedLesson(id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedLesson === id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">아직 작성된 성찰 일지가 없습니다.</p>
                <button
                  onClick={() => { setActiveTab('write'); setIsWriting(true); }}
                  className="text-purple-600 hover:underline"
                >
                  첫 번째 성찰 일지 작성하기
                </button>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-5">
                    {/* Entry Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                          {lessonTitles[entry.lessonId]?.split(':')[0] || '일반'}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < entry.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Learning Reflection */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">💡 배운 내용</p>
                        <p className="text-gray-800">{entry.questions.whatLearned}</p>
                      </div>
                      {entry.questions.whatDifficult && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">🤔 어려웠던 점</p>
                          <p className="text-gray-800">{entry.questions.whatDifficult}</p>
                        </div>
                      )}
                      {entry.questions.howApply && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">📈 적용 방법</p>
                          <p className="text-gray-800">{entry.questions.howApply}</p>
                        </div>
                      )}
                      {entry.questions.nextGoal && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">🎯 다음 목표</p>
                          <p className="text-gray-800">{entry.questions.nextGoal}</p>
                        </div>
                      )}
                    </div>

                    {/* Investment Reflection */}
                    {entry.investmentReflection?.decision && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-blue-600 mb-2">📊 투자 의사결정 성찰</p>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-1">결정</p>
                            <p className="text-gray-800">{entry.investmentReflection.decision}</p>
                          </div>
                          {entry.investmentReflection.reasoning && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-500 mb-1">이유</p>
                              <p className="text-gray-800">{entry.investmentReflection.reasoning}</p>
                            </div>
                          )}
                          {entry.investmentReflection.outcome && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-500 mb-1">결과</p>
                              <p className="text-gray-800">{entry.investmentReflection.outcome}</p>
                            </div>
                          )}
                          {entry.investmentReflection.wouldChange && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-500 mb-1">개선점</p>
                              <p className="text-gray-800">{entry.investmentReflection.wouldChange}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Feedback Section */}
                    {entry.aiFeedback && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => setExpandedFeedback(expandedFeedback === entry.id ? null : entry.id)}
                          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-purple-900">AI 피드백</span>
                          </div>
                          {expandedFeedback === entry.id ? (
                            <ChevronUp className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-purple-600" />
                          )}
                        </button>

                        {expandedFeedback === entry.id && (
                          <div className="mt-3 space-y-4 animate-fadeIn">
                            {/* Encouragement */}
                            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                              <p className="text-green-800">{entry.aiFeedback.encouragement}</p>
                            </div>

                            {/* Scores */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">성찰 깊이</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(entry.aiFeedback.score.depth)}`}>
                                  {entry.aiFeedback.score.depth}점
                                </span>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">실천 적용</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(entry.aiFeedback.score.application)}`}>
                                  {entry.aiFeedback.score.application}점
                                </span>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">자기 인식</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-sm font-bold ${getScoreColor(entry.aiFeedback.score.selfAwareness)}`}>
                                  {entry.aiFeedback.score.selfAwareness}점
                                </span>
                              </div>
                            </div>

                            {/* Strengths & Suggestions */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                                  <ThumbsUp className="w-4 h-4" />
                                  강점
                                </p>
                                <ul className="space-y-1 text-sm text-blue-700">
                                  {entry.aiFeedback.strengths.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-3 bg-amber-50 rounded-lg">
                                <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  개선 제안
                                </p>
                                <ul className="space-y-1 text-sm text-amber-700">
                                  {entry.aiFeedback.suggestions.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Related Concepts */}
                            {entry.aiFeedback.relatedConcepts.length > 0 && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  언급된 경제 개념
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {entry.aiFeedback.relatedConcepts.map((concept, i) => (
                                    <Link
                                      key={i}
                                      to={`/concepts?search=${encodeURIComponent(concept)}`}
                                      className="px-2 py-1 bg-white rounded-full text-xs text-purple-700 border border-purple-200 hover:bg-purple-100"
                                    >
                                      {concept}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Growth Tip */}
                            <div className="p-3 bg-indigo-50 rounded-lg flex items-start gap-2">
                              <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-indigo-800">오늘의 성장 팁</p>
                                <p className="text-sm text-indigo-700">{entry.aiFeedback.growthTip}</p>
                              </div>
                            </div>

                            {/* Regenerate Button */}
                            <button
                              onClick={() => regenerateFeedback(entry.id)}
                              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                            >
                              <RefreshCw className="w-4 h-4" />
                              새로운 피드백 받기
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generate feedback for old entries without AI feedback */}
                    {!entry.aiFeedback && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => {
                            const feedback = generateAIFeedback(entry);
                            const updatedEntries = entries.map(e =>
                              e.id === entry.id ? { ...e, aiFeedback: feedback } : e
                            );
                            saveEntries(updatedEntries);
                            setExpandedFeedback(entry.id);
                            toast.success('AI 피드백이 생성되었습니다!');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Sparkles className="w-5 h-5" />
                          AI 피드백 생성하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Quick Links */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-4">함께 활용해보세요</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/learning"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-indigo-600" />
            학습 모듈
          </Link>
          <Link
            to="/concepts"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            경제 개념 사전
          </Link>
          <Link
            to="/portfolio"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-green-600" />
            포트폴리오 분석
          </Link>
          <Link
            to="/trading"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-blue-600" />
            모의 투자
          </Link>
        </div>
      </div>
    </div>
  );
}
