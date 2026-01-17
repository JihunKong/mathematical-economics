import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { fetchPortfolioSuccess } from '@/store/portfolioSlice';
import api from '@/services/api';

export default function MainLayout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isStudent = user?.role === 'STUDENT';
  const shouldShowSidebar = isAuthenticated && isStudent;

  // 학생 사용자가 로그인하면 포트폴리오 데이터를 자동으로 로드하여 사이드바 현금 동기화
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (isAuthenticated && isStudent) {
        try {
          const response = await api.getPortfolio();
          const portfolioData = response.data;

          dispatch(fetchPortfolioSuccess({
            cash: portfolioData.cash,
            totalValue: portfolioData.totalValue,
            holdings: portfolioData.holdings || [],
            dailyChange: portfolioData.dailyChange || 0,
            dailyChangePercent: portfolioData.dailyChangePercent || 0,
          }));
        } catch (error) {
          // 관심종목 설정이 필요한 경우 등 무시 (해당 페이지에서 처리)
          console.log('Portfolio fetch skipped:', error);
        }
      }
    };

    fetchPortfolioData();
  }, [isAuthenticated, isStudent, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        {shouldShowSidebar && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}