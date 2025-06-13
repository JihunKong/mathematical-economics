import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ClassData {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  _count: {
    students: number;
    allowedStocks: number;
  };
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassData, setNewClassData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/teacher/classes');
      setClasses(response.data.data);
    } catch (error) {
      toast.error('클래스 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const createClass = async () => {
    try {
      const data = {
        ...newClassData,
        endDate: newClassData.endDate || undefined,
      };
      
      await api.post('/teacher/classes', data);
      toast.success('클래스가 생성되었습니다.');
      setShowCreateModal(false);
      setNewClassData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      fetchClasses();
    } catch (error) {
      toast.error('클래스 생성에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">교사 대시보드</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          새 클래스 만들기
        </button>
      </div>

      {/* Class List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Link
            key={classItem.id}
            to={`/teacher/class/${classItem.id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {classItem.name}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                classItem.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {classItem.isActive ? '진행중' : '종료'}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>클래스 코드: <span className="font-mono font-bold">{classItem.code}</span></p>
              <p>학생 수: <span className="font-semibold">{classItem._count.students}명</span></p>
              <p>허용 종목: <span className="font-semibold">{classItem._count.allowedStocks}개</span></p>
              <p>시작일: {new Date(classItem.startDate).toLocaleDateString('ko-KR')}</p>
              {classItem.endDate && (
                <p>종료일: {new Date(classItem.endDate).toLocaleDateString('ko-KR')}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(classItem.startDate), { 
                  addSuffix: true,
                  locale: ko 
                })} 시작됨
              </p>
            </div>
          </Link>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">아직 생성된 클래스가 없습니다.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            첫 클래스 만들기
          </button>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">새 클래스 만들기</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  클래스 이름
                </label>
                <input
                  type="text"
                  value={newClassData.name}
                  onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })}
                  className="input w-full"
                  placeholder="예: 경제수학 1반"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={newClassData.startDate}
                  onChange={(e) => setNewClassData({ ...newClassData, startDate: e.target.value })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 (선택사항)
                </label>
                <input
                  type="date"
                  value={newClassData.endDate}
                  onChange={(e) => setNewClassData({ ...newClassData, endDate: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost"
              >
                취소
              </button>
              <button
                onClick={createClass}
                disabled={!newClassData.name}
                className="btn btn-primary"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}