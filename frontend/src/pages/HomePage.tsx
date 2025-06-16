import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';

export default function HomePage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  // Redirect authenticated users to their appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'TEACHER') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            경제수학 주식거래 시뮬레이터
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            실제 주식 시장 데이터를 활용하여 경제 수학 개념을 학습하고,
            모의 투자를 통해 실전 경험을 쌓아보세요.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="flex justify-center space-x-4 mb-16">
            <Link to="/register" className="btn btn-primary btn-lg">
              시작하기
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              로그인
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">실시간 시장 데이터</h3>
            <p className="text-gray-600">
              KOSPI, KOSDAQ의 실제 주식 데이터를 활용하여 현실적인 투자 경험을 제공합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">경제 수학 학습</h3>
            <p className="text-gray-600">
              수익률 계산, 위험 분석, 포트폴리오 이론 등 경제 수학 개념을 실습을 통해 학습합니다.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">경쟁과 성취</h3>
            <p className="text-gray-600">
              리더보드를 통해 다른 학생들과 경쟁하고, 투자 성과를 비교하며 학습 동기를 높입니다.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">주요 기능</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>1000만원의 가상 자금으로 시작하는 모의 투자</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>실시간 주가 차트와 기술적 분석 도구</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>포트폴리오 성과 분석 및 수익률 추적</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>교사용 대시보드로 학생 활동 모니터링</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}