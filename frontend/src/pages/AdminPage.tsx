import { useState, useEffect } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Navigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Key, Power, PowerOff } from 'lucide-react';
import clsx from 'clsx';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  class?: {
    name: string;
    code: string;
  };
}

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'users'>('pending');
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: '', userName: '' });
  const [newPassword, setNewPassword] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes] = await Promise.all([
        api.get('/admin/users/pending'),
        api.get('/admin/users')
      ]);
      
      setPendingUsers(pendingRes.data.data);
      setAllUsers(usersRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, role: 'STUDENT' | 'TEACHER') => {
    try {
      await api.put(`/admin/users/${userId}/approve`, { role });
      toast.success(`사용자를 ${role === 'STUDENT' ? '학생' : '교사'}으로 승인했습니다`);
      fetchData();
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast.error('사용자 승인에 실패했습니다');
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 거부하시겠습니까? 계정이 삭제됩니다.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}/reject`);
      toast.success('사용자를 거부하고 계정을 삭제했습니다');
      fetchData();
    } catch (error) {
      console.error('Failed to reject user:', error);
      toast.error('사용자 거부에 실패했습니다');
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    try {
      await api.put(`/admin/users/${resetPasswordModal.userId}/reset-password`, {
        newPassword
      });
      toast.success('비밀번호가 재설정되었습니다');
      setResetPasswordModal({ isOpen: false, userId: '', userName: '' });
      setNewPassword('');
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('비밀번호 재설정에 실패했습니다');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      toast.success(`사용자를 ${!currentStatus ? '활성화' : '비활성화'}했습니다`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('사용자 상태 변경에 실패했습니다');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'GUEST': return '대기';
      case 'STUDENT': return '학생';
      case 'TEACHER': return '교사';
      case 'ADMIN': return '관리자';
      default: return role;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">관리자 페이지</h1>
        <p className="text-gray-600">사용자 계정 관리 및 권한 설정</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={clsx(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            activeTab === 'pending'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Users className="w-4 h-4 inline mr-2" />
          승인 대기 ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={clsx(
            'px-4 py-2 font-medium border-b-2 transition-colors',
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Users className="w-4 h-4 inline mr-2" />
          전체 사용자 ({allUsers.length})
        </button>
      </div>

      {/* Pending Users Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">승인 대기 중인 사용자</h2>
          </div>
          {pendingUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              승인 대기 중인 사용자가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveUser(user.id, 'STUDENT')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            학생 승인
                          </button>
                          <button
                            onClick={() => handleApproveUser(user.id, 'TEACHER')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            교사 승인
                          </button>
                          <button
                            onClick={() => handleRejectUser(user.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                          >
                            <UserX className="w-3 h-3 mr-1" />
                            거부
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">전체 사용자 관리</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    클래스
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        {
                          'bg-gray-100 text-gray-800': user.role === 'GUEST',
                          'bg-blue-100 text-blue-800': user.role === 'STUDENT',
                          'bg-green-100 text-green-800': user.role === 'TEACHER',
                          'bg-purple-100 text-purple-800': user.role === 'ADMIN',
                        }
                      )}>
                        {getRoleDisplay(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {user.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.class ? `${user.class.name} (${user.class.code})` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {user.role !== 'ADMIN' && (
                          <>
                            <button
                              onClick={() => setResetPasswordModal({
                                isOpen: true,
                                userId: user.id,
                                userName: user.name
                              })}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Key className="w-3 h-3 mr-1" />
                              비밀번호 재설정
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              className={clsx(
                                'inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white',
                                user.isActive
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-green-600 hover:bg-green-700'
                              )}
                            >
                              {user.isActive ? (
                                <>
                                  <PowerOff className="w-3 h-3 mr-1" />
                                  비활성화
                                </>
                              ) : (
                                <>
                                  <Power className="w-3 h-3 mr-1" />
                                  활성화
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              비밀번호 재설정 - {resetPasswordModal.userName}
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full"
                placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                minLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResetPasswordModal({ isOpen: false, userId: '', userName: '' });
                  setNewPassword('');
                }}
                className="btn btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleResetPassword}
                className="btn btn-primary flex-1"
              >
                재설정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}