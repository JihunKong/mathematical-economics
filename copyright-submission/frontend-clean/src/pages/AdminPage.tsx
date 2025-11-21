import { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Navigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Key, Power, PowerOff, Trash2 } from 'lucide-react';
import clsx from 'clsx'에러가 발생했습니다'pending' | 'users' | 'createTeacher'>('pending'에러가 발생했습니다'', userName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [teacherForm, setTeacherForm] = useState({
    email: '',
    name: '',
    password: ''에러가 발생했습니다'ADMIN'에러가 발생했습니다'/admin/users/pending'),
        api.get('/admin/users'에러가 발생했습니다'데이터를 불러오는데 실패했습니다'에러가 발생했습니다'STUDENT' | 'TEACHER'에러가 발생했습니다'STUDENT' ? '학생' : '교사'}으로 승인했습니다`);
      fetchData();
    } catch (error) {
            toast.error('사용자 승인에 실패했습니다');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 거부하시겠습니까? 계정이 삭제됩니다.'에러가 발생했습니다'사용자를 거부하고 계정을 삭제했습니다');
      fetchData();
    } catch (error) {
            toast.error('사용자 거부에 실패했습니다'에러가 발생했습니다'비밀번호는 최소 6자 이상이어야 합니다'에러가 발생했습니다'비밀번호가 재설정되었습니다');
      setResetPasswordModal({ isOpen: false, userId: '', userName: '' });
      setNewPassword('');
    } catch (error) {
            toast.error('비밀번호 재설정에 실패했습니다'에러가 발생했습니다'활성화' : '비활성화'}했습니다`);
      fetchData();
    } catch (error) {
            toast.error('사용자 상태 변경에 실패했습니다'에러가 발생했습니다'사용자 이름이 일치하지 않습니다'에러가 발생했습니다'사용자 삭제에 실패했습니다'에러가 발생했습니다'모든 필드를 입력해주세요');
      return;
    }

    if (teacherForm.password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    if (!/\d/.test(teacherForm.password)) {
      toast.error('비밀번호는 숫자를 포함해야 합니다');
      return;
    }

    try {
      await api.post('/admin/users/create-teacher', teacherForm);
      toast.success('교사 계정이 생성되었습니다');
      setTeacherForm({ email: '', name: '', password: ''에러가 발생했습니다'교사 계정 생성에 실패했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'에러가 발생했습니다'GUEST': return '대기';
      case 'STUDENT': return '학생';
      case 'TEACHER': return '교사';
      case 'ADMIN': return '관리자'에러가 발생했습니다'pending')}
          className={clsx(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            activeTab === 'pending'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'에러가 발생했습니다'users')}
          className={clsx(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'에러가 발생했습니다'createTeacher')}
          className={clsx(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            activeTab === 'createTeacher'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'에러가 발생했습니다'pending'에러가 발생했습니다'STUDENT'에러가 발생했습니다'TEACHER'에러가 발생했습니다'users'에러가 발생했습니다'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        {
                          'bg-gray-100 text-gray-800': user.role === 'GUEST',
                          'bg-blue-100 text-blue-800': user.role === 'STUDENT',
                          'bg-green-100 text-green-800': user.role === 'TEACHER',
                          'bg-purple-100 text-purple-800': user.role === 'ADMIN'에러가 발생했습니다'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {user.isActive ? '활성' : '비활성'에러가 발생했습니다'-'에러가 발생했습니다'ADMIN'에러가 발생했습니다'inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white',
                                user.isActive
                                  ? 'bg-yellow-600 hover:bg-yellow-700'
                                  : 'bg-green-600 hover:bg-green-700'
                              )}
                              title={user.isActive ? '사용자 비활성화' : '사용자 활성화'에러가 발생했습니다'', userName: '' });
                  setNewPassword(''에러가 발생했습니다'createTeacher' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">교사 계정 생성</h2>
          
          <div className="max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"에러가 발생했습니다"input"
                  placeholder="teacher@school.ac.kr"에러가 발생했습니다"block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"에러가 발생했습니다"input"
                  placeholder="홍길동 선생님"에러가 발생했습니다"block text-sm font-medium text-gray-700 mb-1">
                  초기 비밀번호
                </label>
                <input
                  type="text"에러가 발생했습니다"input"
                  placeholder="초기 비밀번호 (교사에게 전달)"
                />
                <p className="text-xs text-gray-500 mt-1"에러가 발생했습니다"btn btn-primary w-full"에러가 발생했습니다"mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">안내사항</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 교사 계정은 관리자만 생성할 수 있습니다</li>
                <li>• 생성된 교사는 로그인 후 클래스를 만들어야 합니다</li>
                <li>• 학생은 교사가 생성한 클래스 코드로만 가입 가능합니다</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}