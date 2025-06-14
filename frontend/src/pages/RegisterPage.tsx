import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  classCode?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;
      await api.register(registerData);
      toast.success('회원가입이 완료되었습니다! 승인 후 로그인이 가능합니다.');
      navigate('/login');
    } catch (error) {
      toast.error('회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            회원가입
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            경제수학 주식거래 시뮬레이터에 참여하세요
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              🚨 클래스 코드는 교사로부터 받아야 합니다
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                {...register('email', {
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '올바른 이메일 형식이 아닙니다',
                  },
                })}
                type="email"
                autoComplete="email"
                className="input mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                {...register('name', {
                  required: '이름을 입력해주세요',
                  minLength: {
                    value: 2,
                    message: '이름은 2자 이상이어야 합니다',
                  },
                })}
                type="text"
                autoComplete="name"
                className="input mt-1"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                {...register('password', {
                  required: '비밀번호를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 6자 이상이어야 합니다',
                  },
                  pattern: {
                    value: /\d/,
                    message: '비밀번호는 숫자를 포함해야 합니다',
                  },
                })}
                type="password"
                autoComplete="new-password"
                className="input mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                {...register('confirmPassword', {
                  required: '비밀번호를 다시 입력해주세요',
                  validate: (value) =>
                    value === password || '비밀번호가 일치하지 않습니다',
                })}
                type="password"
                autoComplete="new-password"
                className="input mt-1"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="classCode" className="block text-sm font-medium text-gray-700">
                클래스 코드 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('classCode', {
                  required: '클래스 코드를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '클래스 코드는 6자리입니다',
                  },
                  maxLength: {
                    value: 10,
                    message: '올바른 클래스 코드를 입력해주세요',
                  },
                })}
                type="text"
                className="input mt-1"
                placeholder="교사로부터 받은 클래스 코드"
              />
              {errors.classCode && (
                <p className="mt-1 text-sm text-red-600">{errors.classCode.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                교사로부터 받은 클래스 코드를 입력해주세요
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                로그인
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}