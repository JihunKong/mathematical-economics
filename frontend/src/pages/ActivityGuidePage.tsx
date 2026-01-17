import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  User,
  Users,
  Sparkles,
  Clock,
  Download,
  Play,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  GraduationCap,
  Star,
  Filter,
  Search,
  Award,
  FileText,
  CheckCircle
} from 'lucide-react';
import {
  ACTIVITIES,
  CURRICULUM_SUBJECTS,
  ACHIEVEMENT_STANDARDS,
  Activity,
  ActivityType,
  SubjectCode
} from '../data/curriculumData';

const activityTypeInfo: Record<ActivityType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  individual: { label: '개인 활동', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  group: { label: '모둠 활동', icon: Users, color: 'text-green-600', bgColor: 'bg-green-100' },
  club: { label: '동아리 활동', icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  autonomous: { label: '자율 시간', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' }
};

const difficultyInfo = {
  basic: { label: '기초', color: 'text-green-600', bgColor: 'bg-green-100', stars: 1 },
  intermediate: { label: '중급', color: 'text-yellow-600', bgColor: 'bg-yellow-100', stars: 2 },
  advanced: { label: '심화', color: 'text-red-600', bgColor: 'bg-red-100', stars: 3 }
};

export default function ActivityGuidePage() {
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = useMemo(() => {
    return ACTIVITIES.filter(activity => {
      const matchesType = selectedType === 'all' || activity.type === selectedType;
      const matchesSubject = selectedSubject === 'all' || activity.subjects.includes(selectedSubject);
      const matchesDifficulty = selectedDifficulty === 'all' || activity.difficulty === selectedDifficulty;
      const matchesSearch = searchQuery === '' ||
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesSubject && matchesDifficulty && matchesSearch;
    });
  }, [selectedType, selectedSubject, selectedDifficulty, searchQuery]);

  const activityCounts = {
    all: ACTIVITIES.length,
    individual: ACTIVITIES.filter(a => a.type === 'individual').length,
    group: ACTIVITIES.filter(a => a.type === 'group').length,
    club: ACTIVITIES.filter(a => a.type === 'club').length,
    autonomous: ACTIVITIES.filter(a => a.type === 'autonomous').length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">활동 가이드</h1>
            <p className="text-gray-600">학교 자율시간, 동아리에서 활용 가능한 교육과정 연계 활동</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 border shadow-sm text-center">
            <p className="text-2xl font-bold text-gray-900">{activityCounts.all}</p>
            <p className="text-xs text-gray-500">전체 활동</p>
          </div>
          {Object.entries(activityTypeInfo).map(([type, info]) => {
            const Icon = info.icon;
            const count = activityCounts[type as ActivityType];
            return (
              <div key={type} className={`rounded-lg p-3 border text-center ${info.bgColor}`}>
                <div className="flex items-center justify-center gap-1.5">
                  <Icon className={`w-4 h-4 ${info.color}`} />
                  <p className={`text-2xl font-bold ${info.color}`}>{count}</p>
                </div>
                <p className={`text-xs ${info.color}`}>{info.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="활동 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Type Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedType('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            selectedType === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          전체 ({activityCounts.all})
        </button>
        {Object.entries(activityTypeInfo).map(([type, info]) => {
          const Icon = info.icon;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type as ActivityType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedType === type
                  ? `${info.bgColor} ${info.color} ring-2 ring-offset-1`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {info.label}
            </button>
          );
        })}
      </div>

      {/* Subject and Difficulty Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">교과:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as SubjectCode | 'all')}
            className="px-3 py-1.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="all">전체 교과</option>
            {Object.values(CURRICULUM_SUBJECTS).map(subject => (
              <option key={subject.code} value={subject.code}>
                {subject.name} ({subject.grade})
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">난이도:</span>
          {['all', 'basic', 'intermediate', 'advanced'].map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-100'
              }`}
            >
              {diff === 'all' ? '전체' : difficultyInfo[diff as keyof typeof difficultyInfo].label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-600">
        검색 결과: <span className="font-semibold text-green-600">{filteredActivities.length}</span>개 활동
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const isExpanded = expandedActivity === activity.id;
          const typeInfo = activityTypeInfo[activity.type];
          const diffInfo = difficultyInfo[activity.difficulty];
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={activity.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                isExpanded ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {/* Activity Header */}
              <button
                onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.bgColor}`}>
                    <TypeIcon className={`w-6 h-6 ${typeInfo.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${typeInfo.bgColor} ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        {[...Array(diffInfo.stars)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 fill-current ${diffInfo.color}`} />
                        ))}
                        <span className={diffInfo.color}>{diffInfo.label}</span>
                      </span>
                    </div>
                    {/* Subject Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activity.subjects.map(subjectCode => {
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Activity Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t bg-gradient-to-b from-gray-50 to-white">
                  <div className="pt-4 space-y-4">
                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        활동 설명
                      </h4>
                      <p className="text-gray-700">{activity.description}</p>
                    </div>

                    {/* Linked Standards */}
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        연계 성취기준
                      </h4>
                      <div className="space-y-2">
                        {activity.standards.map(code => {
                          const standard = ACHIEVEMENT_STANDARDS[code];
                          if (!standard) return null;
                          const subject = CURRICULUM_SUBJECTS[standard.subject];
                          return (
                            <div key={code} className="flex items-start gap-2 text-sm">
                              <span
                                className={`px-1.5 py-0.5 text-xs rounded font-mono ${subject.bgColor}`}
                                style={{ color: subject.color }}
                              >
                                {code}
                              </span>
                              <span className="text-indigo-700">{standard.description}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Materials */}
                    {activity.materials && activity.materials.length > 0 && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          준비물
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.materials.map((material, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white text-amber-700 text-sm rounded border border-amber-200">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Steps */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        활동 단계
                      </h4>
                      <ol className="space-y-2">
                        {activity.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-green-800">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Assessment */}
                    {activity.assessment && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          평가 기준
                        </h4>
                        <p className="text-purple-700">{activity.assessment}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        활동지 다운로드
                      </button>
                      <Link
                        to="/trading"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        앱에서 실습하기
                      </Link>
                      <Link
                        to="/learning"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        관련 학습 모듈
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedSubject('all');
              setSelectedDifficulty('all');
              setSearchQuery('');
            }}
            className="text-green-600 hover:underline"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          활동 활용 팁
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800">자율시간 활용</p>
              <p className="text-sm text-gray-600">30-45분 분량의 개인/모둠 활동을 선택하세요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800">동아리 시간 활용</p>
              <p className="text-sm text-gray-600">모의 투자 대회나 장기 프로젝트를 추천합니다</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800">수업 연계</p>
              <p className="text-sm text-gray-600">성취기준을 확인하여 정규 수업과 연계하세요</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-800">난이도 조절</p>
              <p className="text-sm text-gray-600">학생 수준에 맞게 기초→중급→심화 순으로 진행하세요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
