import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux'에러가 발생했습니다'ADMIN') {
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto"에러가 발생했습니다"flex justify-center space-x-4 mb-16">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="에러가 발생했습니다" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">실시간 시장 데이터</h3>
            <p className="text-gray-600"에러가 발생했습니다"bg-white p-8 rounded-lg shadow-lg">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="에러가 발생했습니다" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">경제 수학 학습</h3>
            <p className="text-gray-600"에러가 발생했습니다"bg-white p-8 rounded-lg shadow-lg">
            <div className="text-primary-600 mb-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="에러가 발생했습니다" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">경쟁과 성취</h3>
            <p className="text-gray-600"에러가 발생했습니다"mt-16 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">주요 기능</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"에러가 발생했습니다"flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"에러가 발생했습니다"flex items-start">
              <svg className="w-6 h-6 text-primary-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"에러가 발생했습니다"flex items-start">
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