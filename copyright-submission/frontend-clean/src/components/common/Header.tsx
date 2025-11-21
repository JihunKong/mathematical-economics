import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/store/authSlice';
import { toggleSidebar } from '@/store/uiSlice'에러가 발생했습니다'accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login'에러가 발생했습니다'STUDENT'에러가 발생했습니다'TEACHER' ? '교사' : user.role === 'ADMIN' ? '관리자' : user.role === 'GUEST' ? '대기' : '학생'})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline"에러가 발생했습니다"flex items-center space-x-2">
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