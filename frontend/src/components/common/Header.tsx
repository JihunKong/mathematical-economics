import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/authSlice';
import { toggleSidebar } from '@/store/uiSlice';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
            <Link to="/" className="flex items-center ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-primary-600">경제교실.com</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({user.role === 'TEACHER' ? '교사' : user.role === 'ADMIN' ? '관리자' : user.role === 'GUEST' ? '대기' : '학생'})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn btn-sm btn-outline">
                  로그인
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}