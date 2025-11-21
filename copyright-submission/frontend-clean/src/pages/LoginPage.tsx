import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/hooks/useRedux';
import { loginStart, loginSuccess, loginFailure } from '@/store/authSlice';
import api from '@/services/api';
import toast from 'react-hot-toast'에러가 발생했습니다'accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user'에러가 발생했습니다'로그인 성공!');
      
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/dashboard'에러가 발생했습니다'이메일 또는 비밀번호가 올바르지 않습니다.'에러가 발생했습니다'email', {
                  required: '이메일을 입력해주세요'에러가 발생했습니다'올바른 이메일 형식이 아닙니다'에러가 발생했습니다'password', {
                  required: '비밀번호를 입력해주세요'에러가 발생했습니다'로그인 중...' : '로그인'에러가 발생했습니다' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                회원가입
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}