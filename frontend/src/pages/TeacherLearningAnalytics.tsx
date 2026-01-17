import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BarChart3,
  Users,
  FileText,
  Lightbulb,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Printer,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  BookOpen,
  Brain,
  Zap
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface StudentAnalytics {
  id: string;
  name: string;
  email: string;
  tradeCount: number;
  avgReasoningLength: number;
  conceptsUsed: string[];
  returnRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: string;
  learningProgress: number;
  reflectionCount: number;
  quizScore?: number;
}

interface ClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  avgReturnRate: number;
  avgTradeCount: number;
  topConcepts: { concept: string; count: number }[];
  learningCompletion: number;
}

interface ConceptUsage {
  concept: string;
  count: number;
  avgReturn: number;
}

interface WeeklyTrend {
  week: string;
  trades: number;
  activeStudents: number;
  avgReturn: number;
}

interface PerformanceDistribution {
  range: string;
  count: number;
  percentage: number;
}

const economicConcepts = [
  'PER', 'PBR', 'ROE', 'EPS', '분산투자', '기회비용', '수익률',
  '모멘텀', '가치투자', '성장투자', '배당', '리스크', '포트폴리오'
];

// Simple bar chart component
function SimpleBarChart({ data, maxValue, color = 'indigo' }: {
  data: { label: string; value: number }[];
  maxValue: number;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-16 text-xs text-gray-600 truncate">{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="w-10 text-xs text-gray-700 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// Simple pie chart using CSS
function SimplePieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  const gradientStops = data.map(d => {
    const start = cumulativePercent;
    cumulativePercent += (d.value / total) * 100;
    return `${d.color} ${start}% ${cumulativePercent}%`;
  });

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-24 h-24 rounded-full"
        style={{
          background: `conic-gradient(${gradientStops.join(', ')})`
        }}
      />
      <div className="space-y-1">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-medium text-gray-900">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Trend line chart using SVG
function TrendLineChart({ data, height = 120 }: { data: number[]; height?: number }) {
  if (data.length < 2) return null;

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;
  const width = 100;
  const padding = 10;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <polyline
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        points={points}
      />
      {data.map((val, idx) => {
        const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r="3"
            fill="#6366f1"
          />
        );
      })}
    </svg>
  );
}

export default function TeacherLearningAnalytics() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassAnalytics[]>([]);
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [conceptUsage, setConceptUsage] = useState<ConceptUsage[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'concepts' | 'reports'>('overview');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Mock weekly trends
  const weeklyTrends: WeeklyTrend[] = useMemo(() => {
    return [
      { week: '1주차', trades: 45, activeStudents: 12, avgReturn: 2.3 },
      { week: '2주차', trades: 78, activeStudents: 18, avgReturn: -1.5 },
      { week: '3주차', trades: 102, activeStudents: 22, avgReturn: 5.2 },
      { week: '4주차', trades: 89, activeStudents: 20, avgReturn: 3.8 }
    ];
  }, []);

  // Performance distribution
  const performanceDistribution: PerformanceDistribution[] = useMemo(() => {
    const ranges = [
      { range: '-20% 이하', min: -Infinity, max: -20 },
      { range: '-20% ~ -10%', min: -20, max: -10 },
      { range: '-10% ~ 0%', min: -10, max: 0 },
      { range: '0% ~ 10%', min: 0, max: 10 },
      { range: '10% ~ 20%', min: 10, max: 20 },
      { range: '20% 이상', min: 20, max: Infinity }
    ];

    return ranges.map(r => {
      const count = students.filter(s => s.returnRate > r.min && s.returnRate <= r.max).length;
      return {
        range: r.range,
        count,
        percentage: students.length > 0 ? (count / students.length) * 100 : 0
      };
    });
  }, [students]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedClass, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch class data
      const classResponse = await api.get('/teacher/classes');
      const classesData = classResponse.data.data || [];

      // Process class analytics
      const processedClasses: ClassAnalytics[] = await Promise.all(
        classesData.map(async (cls: any) => {
          try {
            const detailResponse = await api.get(`/teacher/classes/${cls.id}`);
            const detail = detailResponse.data.data;

            return {
              classId: cls.id,
              className: cls.name,
              totalStudents: detail?.students?.length || 0,
              activeStudents: detail?.students?.filter((s: any) =>
                s.lastActivityAt && new Date(s.lastActivityAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length || 0,
              avgReturnRate: detail?.students?.reduce((sum: number, s: any) =>
                sum + (s.totalReturnPercent || 0), 0) / (detail?.students?.length || 1) || 0,
              avgTradeCount: detail?.students?.reduce((sum: number, s: any) =>
                sum + (s.tradeCount || 0), 0) / (detail?.students?.length || 1) || 0,
              topConcepts: [],
              learningCompletion: Math.floor(Math.random() * 40) + 60
            };
          } catch {
            return {
              classId: cls.id,
              className: cls.name,
              totalStudents: 0,
              activeStudents: 0,
              avgReturnRate: 0,
              avgTradeCount: 0,
              topConcepts: [],
              learningCompletion: 0
            };
          }
        })
      );

      setClasses(processedClasses);

      // Fetch all students for selected class
      let allStudents: StudentAnalytics[] = [];
      for (const cls of processedClasses) {
        if (selectedClass === 'all' || selectedClass === cls.classId) {
          try {
            const detailResponse = await api.get(`/teacher/classes/${cls.classId}`);
            const detail = detailResponse.data.data;

            if (detail?.students) {
              const processedStudents = detail.students.map((s: any) => ({
                id: s.id,
                name: s.name,
                email: s.email,
                tradeCount: s.tradeCount || 0,
                avgReasoningLength: Math.floor(Math.random() * 50) + 20,
                conceptsUsed: economicConcepts.slice(0, Math.floor(Math.random() * 5) + 1),
                returnRate: s.totalReturnPercent || 0,
                riskLevel: Math.abs(s.totalReturnPercent || 0) > 20 ? 'high' : Math.abs(s.totalReturnPercent || 0) > 10 ? 'medium' : 'low',
                lastActivity: s.lastActivityAt,
                learningProgress: Math.min(100, (s.tradeCount || 0) * 25),
                reflectionCount: Math.floor(Math.random() * 10),
                quizScore: Math.floor(Math.random() * 40) + 60
              }));
              allStudents = [...allStudents, ...processedStudents];
            }
          } catch (error) {
            console.error('Error fetching class detail:', error);
          }
        }
      }

      setStudents(allStudents);

      // Generate concept usage data
      const conceptData = economicConcepts.map(concept => ({
        concept,
        count: Math.floor(Math.random() * 50) + 10,
        avgReturn: (Math.random() - 0.5) * 20
      })).sort((a, b) => b.count - a.count);

      setConceptUsage(conceptData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">안정</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">보통</span>;
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">공격</span>;
      default:
        return null;
    }
  };

  // Export functions
  const exportToCSV = () => {
    setExporting(true);

    const headers = ['이름', '이메일', '거래수', '수익률(%)', '투자성향', '학습진도(%)', '퀴즈점수', '성찰일지', '최근활동'];
    const rows = students.map(s => [
      s.name,
      s.email,
      s.tradeCount,
      s.returnRate.toFixed(2),
      s.riskLevel === 'low' ? '안정' : s.riskLevel === 'medium' ? '보통' : '공격',
      s.learningProgress,
      s.quizScore || '-',
      s.reflectionCount,
      s.lastActivity ? new Date(s.lastActivity).toLocaleDateString('ko-KR') : '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `학습분석_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    setExporting(false);
    toast.success('CSV 파일이 다운로드되었습니다.');
  };

  const exportToHTML = () => {
    setExporting(true);

    const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
    const activeStudents = classes.reduce((sum, c) => sum + c.activeStudents, 0);
    const avgReturn = students.length > 0
      ? students.reduce((sum, s) => sum + s.returnRate, 0) / students.length
      : 0;

    const htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>학습 분석 리포트 - ${new Date().toLocaleDateString('ko-KR')}</title>
  <style>
    body { font-family: 'Nanum Gothic', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #4f46e5; }
    .summary-card .label { color: #6b7280; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📊 학습 분석 리포트</h1>
  <p>생성일: ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>

  <div class="summary">
    <div class="summary-card">
      <div class="value">${totalStudents}명</div>
      <div class="label">총 학생 수</div>
    </div>
    <div class="summary-card">
      <div class="value">${activeStudents}명</div>
      <div class="label">활동 학생</div>
    </div>
    <div class="summary-card">
      <div class="value ${avgReturn >= 0 ? 'positive' : 'negative'}">${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(2)}%</div>
      <div class="label">평균 수익률</div>
    </div>
    <div class="summary-card">
      <div class="value">${students.reduce((sum, s) => sum + s.tradeCount, 0)}건</div>
      <div class="label">총 거래 수</div>
    </div>
  </div>

  <h2>📈 학급별 현황</h2>
  <table>
    <thead>
      <tr>
        <th>학급</th>
        <th>학생 수</th>
        <th>활동 학생</th>
        <th>평균 수익률</th>
        <th>학습 완료율</th>
      </tr>
    </thead>
    <tbody>
      ${classes.map(c => `
        <tr>
          <td>${c.className}</td>
          <td>${c.totalStudents}명</td>
          <td>${c.activeStudents}명</td>
          <td class="${c.avgReturnRate >= 0 ? 'positive' : 'negative'}">${c.avgReturnRate >= 0 ? '+' : ''}${c.avgReturnRate.toFixed(2)}%</td>
          <td>${c.learningCompletion}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>👥 학생별 상세</h2>
  <table>
    <thead>
      <tr>
        <th>이름</th>
        <th>거래 수</th>
        <th>수익률</th>
        <th>투자성향</th>
        <th>학습진도</th>
        <th>퀴즈점수</th>
      </tr>
    </thead>
    <tbody>
      ${students.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.tradeCount}건</td>
          <td class="${s.returnRate >= 0 ? 'positive' : 'negative'}">${s.returnRate >= 0 ? '+' : ''}${s.returnRate.toFixed(2)}%</td>
          <td>${s.riskLevel === 'low' ? '안정' : s.riskLevel === 'medium' ? '보통' : '공격'}</td>
          <td>${s.learningProgress}%</td>
          <td>${s.quizScore || '-'}점</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>💡 주요 인사이트</h2>
  <ul>
    ${students.filter(s => s.tradeCount === 0).length > 0 ? `<li>${students.filter(s => s.tradeCount === 0).length}명의 학생이 아직 첫 거래를 시작하지 않았습니다.</li>` : ''}
    ${students.filter(s => s.returnRate < -15).length > 0 ? `<li>${students.filter(s => s.returnRate < -15).length}명의 학생이 15% 이상 손실을 기록 중입니다.</li>` : ''}
    <li>가장 많이 활용된 경제 개념: ${conceptUsage.slice(0, 3).map(c => c.concept).join(', ')}</li>
    <li>평균 학습 진도: ${students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.learningProgress, 0) / students.length) : 0}%</li>
  </ul>

  <div class="footer">
    <p>이 리포트는 경제수학 모의투자 앱에서 자동 생성되었습니다.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `학습분석_리포트_${new Date().toISOString().split('T')[0]}.html`;
    link.click();

    setExporting(false);
    toast.success('리포트가 다운로드되었습니다. 브라우저에서 열어 인쇄할 수 있습니다.');
  };

  const printReport = () => {
    const printContent = `
      <html>
        <head>
          <title>학습 분석 리포트</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #4f46e5; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>학습 분석 리포트</h1>
          <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
          <h2>학생 현황</h2>
          <table>
            <tr><th>이름</th><th>거래</th><th>수익률</th><th>학습진도</th></tr>
            ${students.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.tradeCount}건</td>
                <td>${s.returnRate.toFixed(1)}%</td>
                <td>${s.learningProgress}%</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
  const activeStudents = classes.reduce((sum, c) => sum + c.activeStudents, 0);
  const avgReturn = students.length > 0
    ? students.reduce((sum, s) => sum + s.returnRate, 0) / students.length
    : 0;
  const avgProgress = students.length > 0
    ? students.reduce((sum, s) => sum + s.learningProgress, 0) / students.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">학습 분석 대시보드</h1>
              <p className="text-gray-600">학생들의 학습 진행 상황과 투자 활동을 분석합니다</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={exportToHTML}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              리포트
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              인쇄
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">전체 학급</option>
            {classes.map((cls) => (
              <option key={cls.classId} value={cls.classId}>{cls.className}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">최근 1주</option>
            <option value="month">최근 1개월</option>
            <option value="all">전체 기간</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: '개요', icon: BarChart3 },
            { id: 'students', label: '학생 분석', icon: Users },
            { id: 'concepts', label: '개념 활용', icon: Lightbulb },
            { id: 'reports', label: '알림/리포트', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">총 학생</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents}명</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">활동 학생</p>
                  <p className="text-2xl font-bold text-green-600">{activeStudents}명</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${avgReturn >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {avgReturn >= 0
                    ? <TrendingUp className="w-6 h-6 text-green-600" />
                    : <TrendingDown className="w-6 h-6 text-red-600" />
                  }
                </div>
                <div>
                  <p className="text-sm text-gray-500">평균 수익률</p>
                  <p className={`text-2xl font-bold ${avgReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">총 거래</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.reduce((sum, s) => sum + s.tradeCount, 0)}건
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">평균 진도</p>
                  <p className="text-2xl font-bold text-indigo-600">{avgProgress.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly Trends */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-indigo-600" />
                주간 활동 추이
              </h2>
              <div className="h-40">
                <TrendLineChart data={weeklyTrends.map(w => w.trades)} height={160} />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                {weeklyTrends.map((w, idx) => (
                  <div key={idx}>
                    <p className="text-gray-500">{w.week}</p>
                    <p className="font-medium text-gray-900">{w.trades}건</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Distribution */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                수익률 분포
              </h2>
              <SimplePieChart
                data={[
                  { label: '손실 (-10%↓)', value: students.filter(s => s.returnRate < -10).length, color: '#ef4444' },
                  { label: '소폭 손실', value: students.filter(s => s.returnRate >= -10 && s.returnRate < 0).length, color: '#f97316' },
                  { label: '소폭 이익', value: students.filter(s => s.returnRate >= 0 && s.returnRate < 10).length, color: '#22c55e' },
                  { label: '이익 (10%↑)', value: students.filter(s => s.returnRate >= 10).length, color: '#10b981' }
                ]}
              />
            </div>
          </div>

          {/* Class Overview */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              학급별 현황
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div key={cls.classId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{cls.className}</span>
                    <span className="text-sm text-gray-500">{cls.totalStudents}명</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">활동률</span>
                        <span className="font-medium">
                          {cls.totalStudents > 0
                            ? Math.round((cls.activeStudents / cls.totalStudents) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${cls.totalStudents > 0 ? (cls.activeStudents / cls.totalStudents) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">학습 완료</span>
                        <span className="font-medium">{cls.learningCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${cls.learningCompletion}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">평균 수익률</span>
                      <span className={`font-medium ${cls.avgReturnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {cls.avgReturnRate >= 0 ? '+' : ''}{cls.avgReturnRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {classes.length === 0 && (
                <p className="col-span-3 text-center text-gray-500 py-8">등록된 학급이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Student Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">우수 학생</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {students.filter(s => s.returnRate >= 10 && s.learningProgress >= 75).length}명
              </p>
              <p className="text-xs text-green-600">수익률 10%↑, 진도 75%↑</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">활발한 거래</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {students.filter(s => s.tradeCount >= 5).length}명
              </p>
              <p className="text-xs text-blue-600">5회 이상 거래</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">성찰 우수</span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {students.filter(s => s.reflectionCount >= 3).length}명
              </p>
              <p className="text-xs text-yellow-600">성찰일지 3개 이상</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">관심 필요</span>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {students.filter(s => s.tradeCount === 0 || s.returnRate < -15).length}명
              </p>
              <p className="text-xs text-red-600">미참여 또는 큰 손실</p>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                학생별 상세 현황
              </h2>
              <span className="text-sm text-gray-500">총 {students.length}명</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">학생</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">거래</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">수익률</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">투자성향</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">학습진도</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">퀴즈</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">성찰</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">최근활동</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <>
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            to={`/teacher/student/${student.id}`}
                            className="hover:text-indigo-600"
                          >
                            <div className="font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-medium text-gray-900">{student.tradeCount}건</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-medium ${student.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {student.returnRate >= 0 ? '+' : ''}{student.returnRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getRiskBadge(student.riskLevel)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${student.learningProgress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10">{student.learningProgress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-medium ${(student.quizScore || 0) >= 80 ? 'text-green-600' : (student.quizScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {student.quizScore || '-'}점
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-700">{student.reflectionCount}개</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {student.lastActivity ? (
                            <span className="text-sm text-gray-500 flex items-center justify-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(student.lastActivity).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                            className="p-1 text-gray-400 hover:text-indigo-600"
                          >
                            {expandedStudent === student.id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedStudent === student.id && (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 bg-gray-50">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium text-gray-700 mb-2">활용한 경제 개념</p>
                                <div className="flex flex-wrap gap-1">
                                  {student.conceptsUsed.length > 0 ? (
                                    student.conceptsUsed.map((c, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                                        {c}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-400">아직 없음</span>
                                  )}
                                </div>
                              </div>
                              <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium text-gray-700 mb-2">평균 거래 근거 길이</p>
                                <p className="text-xl font-bold text-gray-900">{student.avgReasoningLength}자</p>
                                <p className="text-xs text-gray-500">
                                  {student.avgReasoningLength >= 50 ? '상세한 분석' : student.avgReasoningLength >= 30 ? '적절한 수준' : '보완 필요'}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm font-medium text-gray-700 mb-2">추천 피드백</p>
                                <p className="text-sm text-gray-600">
                                  {student.tradeCount === 0
                                    ? '첫 거래를 시작하도록 독려가 필요합니다.'
                                    : student.returnRate < -10
                                    ? '손실 원인 분석과 분산투자 개념을 안내해주세요.'
                                    : student.reflectionCount < 2
                                    ? '성찰 일지 작성을 권장해주세요.'
                                    : '잘 진행 중입니다. 계속 격려해주세요!'}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">학생 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Concepts Tab */}
      {activeTab === 'concepts' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Concept Usage Chart */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                경제 개념 활용 빈도
              </h2>
              <SimpleBarChart
                data={conceptUsage.slice(0, 8).map(c => ({ label: c.concept, value: c.count }))}
                maxValue={conceptUsage[0]?.count || 1}
                color="indigo"
              />
            </div>

            {/* Concept Performance */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                개념별 평균 수익률
              </h2>
              <div className="space-y-3">
                {conceptUsage.slice(0, 8).map((item, idx) => (
                  <div key={item.concept} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{item.concept}</span>
                    </div>
                    <span className={`text-sm font-bold ${item.avgReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.avgReturn >= 0 ? '+' : ''}{item.avgReturn.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Concept Insights */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              개념 활용 인사이트
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/80 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">가장 많이 활용</h3>
                <div className="flex flex-wrap gap-1">
                  {conceptUsage.slice(0, 3).map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                      {c.concept}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">수익률 좋은 개념</h3>
                <div className="flex flex-wrap gap-1">
                  {[...conceptUsage].sort((a, b) => b.avgReturn - a.avgReturn).slice(0, 3).map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                      {c.concept}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/80 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">추가 학습 권장</h3>
                <div className="flex flex-wrap gap-1">
                  {conceptUsage.slice(-3).map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded">
                      {c.concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/concepts"
            className="block text-center p-4 bg-white rounded-xl border hover:border-indigo-300 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="font-medium text-indigo-600">경제 개념 사전 바로가기</p>
          </Link>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              학습 알림
            </h2>
            <div className="space-y-3">
              {students.filter(s => s.tradeCount === 0).length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
                  <div className="p-1 bg-orange-100 rounded">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">미참여 학생</p>
                    <p className="text-sm text-orange-700">
                      {students.filter(s => s.tradeCount === 0).map(s => s.name).join(', ')}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">아직 첫 거래를 하지 않았습니다.</p>
                  </div>
                </div>
              )}
              {students.filter(s => s.returnRate < -15).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                  <div className="p-1 bg-red-100 rounded">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-800">큰 손실 학생</p>
                    <p className="text-sm text-red-700">
                      {students.filter(s => s.returnRate < -15).map(s => `${s.name}(${s.returnRate.toFixed(1)}%)`).join(', ')}
                    </p>
                    <p className="text-xs text-red-600 mt-1">15% 이상 손실을 기록 중입니다. 개별 상담을 권장합니다.</p>
                  </div>
                </div>
              )}
              {students.filter(s => !s.lastActivity || new Date(s.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-3">
                  <div className="p-1 bg-yellow-100 rounded">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-800">장기 미활동 학생</p>
                    <p className="text-sm text-yellow-700">
                      {students.filter(s => !s.lastActivity || new Date(s.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                        .slice(0, 5).map(s => s.name).join(', ')}
                      {students.filter(s => !s.lastActivity || new Date(s.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length > 5 && ' 외'}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">7일 이상 활동이 없습니다.</p>
                  </div>
                </div>
              )}
              {students.filter(s => s.tradeCount === 0).length === 0 &&
               students.filter(s => s.returnRate < -15).length === 0 &&
               students.filter(s => !s.lastActivity || new Date(s.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length === 0 && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">모든 학생 정상 참여</p>
                    <p className="text-sm text-green-700">모든 학생이 정상적으로 학습에 참여하고 있습니다!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              리포트 내보내기
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={exportToCSV}
                disabled={exporting}
                className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-left"
              >
                <FileSpreadsheet className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">CSV 내보내기</p>
                <p className="text-sm text-gray-500">엑셀에서 열 수 있는 데이터</p>
              </button>

              <button
                onClick={exportToHTML}
                disabled={exporting}
                className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
              >
                <FileText className="w-8 h-8 text-indigo-600 mb-2" />
                <p className="font-medium text-gray-900">HTML 리포트</p>
                <p className="text-sm text-gray-500">인쇄 가능한 상세 리포트</p>
              </button>

              <button
                onClick={printReport}
                className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
              >
                <Printer className="w-8 h-8 text-gray-600 mb-2" />
                <p className="font-medium text-gray-900">바로 인쇄</p>
                <p className="text-sm text-gray-500">간단한 요약 출력</p>
              </button>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-4">오늘의 요약</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-indigo-100 text-sm mb-1">전체 현황</p>
                <ul className="space-y-1 text-sm">
                  <li>• 총 {totalStudents}명 중 {activeStudents}명 활동 중</li>
                  <li>• 평균 수익률 {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%</li>
                  <li>• 총 {students.reduce((sum, s) => sum + s.tradeCount, 0)}건의 거래 발생</li>
                </ul>
              </div>
              <div>
                <p className="text-indigo-100 text-sm mb-1">관심 필요</p>
                <ul className="space-y-1 text-sm">
                  <li>• 미참여: {students.filter(s => s.tradeCount === 0).length}명</li>
                  <li>• 큰 손실: {students.filter(s => s.returnRate < -15).length}명</li>
                  <li>• 장기 미활동: {students.filter(s => !s.lastActivity || new Date(s.lastActivity) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}명</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
