import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UpdateCashModal from '@/components/teacher/UpdateCashModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';

interface Student {
  id: string;
  name: string;
  email: string;
  currentCash: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdingsCount: number;
}


interface ClassDetail {
  id: string;
  name: string;
  code: string;
  students: Student[];
}


export default function TeacherClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'stats'>('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCashModal, setShowCashModal] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassData();
      fetchStatistics();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/teacher/classes/${classId}`);
      setClassData(response.data.data);
    } catch (error) {
      toast.error('클래스 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get(`/teacher/classes/${classId}/statistics`);
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };



  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!classData) {
    return <div>클래스를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/teacher" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← 대시보드로 돌아가기
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <p className="text-gray-600">클래스 코드: <span className="font-mono font-bold">{classData.code}</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('students')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'students'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            학생 목록
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            통계
          </button>
        </nav>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보유 현금
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수익률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보유 종목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classData.students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(student.currentCash)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(student.totalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'text-sm font-medium',
                      student.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {formatPercent(student.totalProfitLossPercent)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.holdingsCount}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowCashModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="현금 설정"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/teacher/student/${student.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        상세보기
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* Statistics Tab */}
      {activeTab === 'stats' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">전체 학생 수</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}명</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">활동 학생 수</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.activeStudents}명</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">평균 수익률</h3>
            <p className={clsx(
              'text-2xl font-bold',
              statistics.avgReturn >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatPercent(statistics.avgReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">최고 수익률</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatPercent(statistics.bestReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">최저 수익률</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatPercent(statistics.worstReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">인기 종목</h3>
            <div className="space-y-1">
              {statistics.mostTradedStocks.map((stock: any, index: number) => (
                <p key={index} className="text-sm text-gray-900">
                  {stock.name} ({stock.tradeCount}회)
                </p>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Update Cash Modal */}
      {selectedStudent && (
        <UpdateCashModal
          isOpen={showCashModal}
          onClose={() => {
            setShowCashModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={fetchClassData}
        />
      )}
    </div>
  );
}