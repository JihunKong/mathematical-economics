import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateCash } from '@/store/portfolioSlice';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RealtimePriceCard from '@/components/stock/RealtimePriceCard';
import MiniChart from '@/components/stock/MiniChart';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface PortfolioSummary {
  cash: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
}

interface TopStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [needsWatchlist, setNeedsWatchlist] = useState(false);
  
  // Redirect teachers to their dashboard
  if (user && user.role === 'TEACHER') {
    return <Navigate to="/teacher" replace />;
  }
  
  // Redirect admins to their page
  if (user && user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, stocksRes] = await Promise.all([
          api.getPortfolio(),
          api.getStocks(),
        ]);

        setPortfolio(portfolioRes.data);
        // Redux store 업데이트로 사이드바 현금 표시 동기화
        dispatch(updateCash(portfolioRes.data.cash));
        setTopStocks(stocksRes.data.slice(0, 5));
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        
        // Check if it's a watchlist requirement error (403)
        if (error?.response?.status === 403 && error?.response?.data?.code === 'WATCHLIST_REQUIRED') {
          setNeedsWatchlist(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Handle watchlist requirement
  if (needsWatchlist) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">관심종목을 선택해주세요</h2>
          <p className="text-gray-600 mb-8">
            거래를 시작하기 전에 관심있는 종목을 선택해주세요.<br />
            선택한 종목들의 가격이 실시간으로 업데이트됩니다.
          </p>
          <button
            onClick={() => navigate('/watchlist-setup')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            관심종목 선택하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        안녕하세요, {user?.name}님!
      </h1>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">총 자산</p>
          <p className="text-2xl font-bold text-gray-900">
            {portfolio ? formatCurrency(portfolio.totalValue) : '₩0'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">보유 현금</p>
          <p className="text-2xl font-bold text-gray-900">
            {portfolio ? formatCurrency(portfolio.cash) : '₩0'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">총 수익률</p>
          <p
            className={clsx('text-2xl font-bold', {
              'text-success-600': portfolio && portfolio.totalProfitLossPercent >= 0,
              'text-danger-600': portfolio && portfolio.totalProfitLossPercent < 0,
            })}
          >
            {portfolio ? formatPercent(portfolio.totalProfitLossPercent) : '+0.00%'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">일일 변동</p>
          <p
            className={clsx('text-2xl font-bold', {
              'text-success-600': portfolio && portfolio.dailyChangePercent >= 0,
              'text-danger-600': portfolio && portfolio.dailyChangePercent < 0,
            })}
          >
            {portfolio ? formatPercent(portfolio.dailyChangePercent) : '+0.00%'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 실행</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/trading"
              className="btn btn-primary text-center"
            >
              주식 거래하기
            </Link>
            <Link
              to="/portfolio"
              className="btn btn-outline text-center"
            >
              포트폴리오 보기
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 종목</h2>
          <div className="space-y-2">
            {topStocks.map((stock) => (
              <Link
                key={stock.symbol}
                to={`/trading?symbol=${stock.symbol}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">{stock.name}</p>
                  <p className="text-sm text-gray-500">{stock.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(stock.price)}
                  </p>
                  <p
                    className={clsx('text-sm', {
                      'text-success-600': stock.changePercent >= 0,
                      'text-danger-600': stock.changePercent < 0,
                    })}
                  >
                    {formatPercent(stock.changePercent)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">오늘의 팁</h3>
        <p className="text-blue-700">
          경제 지표와 수학적 분석을 활용하여 투자 결정을 내리세요. 
          P/E 비율, 이동평균선, 볼린저 밴드 등의 지표를 참고하면 
          더 나은 투자 결정을 내릴 수 있습니다.
        </p>
      </div>
    </div>
  );
}