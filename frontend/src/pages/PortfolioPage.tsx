import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Portfolio {
  cash: number;
  totalValue: number;
  totalInvestedAmount: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
  cashWeight: number;
  holdings: Holding[];
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number;
}

interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  stockName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  reason: string;
  createdAt: string;
}

export default function PortfolioPage() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsWatchlist, setNeedsWatchlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings' | 'history'>('overview');

  // Redirect admin users to admin page
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        api.getPortfolio(),
        api.getTransactionHistory(50)
      ]);
      
      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data);
    } catch (error: any) {
      console.error('Failed to fetch portfolio:', error);
      
      // Check if it's a watchlist requirement error (403)
      if (error?.response?.status === 403 && error?.response?.data?.code === 'WATCHLIST_REQUIRED') {
        setNeedsWatchlist(true);
      } else {
        toast.error('포트폴리오를 불러오는데 실패했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatPercent = (percent: number | null | undefined) => {
    if (percent === null || percent === undefined) return '0.00%';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auto redirect to watchlist setup for students without watchlist
  useEffect(() => {
    if (needsWatchlist && user?.role === 'STUDENT') {
      navigate('/watchlist-setup');
    }
  }, [needsWatchlist, user, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!portfolio) return <div>포트폴리오 정보가 없습니다.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 포트폴리오</h1>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">총 자산</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">총 수익률</span>
            {portfolio.totalProfitLossPercent >= 0 ? (
              <TrendingUp className="w-5 h-5 text-red-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <p className={clsx(
            'text-2xl font-bold',
            portfolio.totalProfitLossPercent >= 0 ? 'text-red-600' : 'text-blue-600'
          )}>
            {formatPercent(portfolio.totalProfitLossPercent)}
          </p>
          <p className="text-sm text-gray-500">{formatCurrency(portfolio.totalProfitLoss)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">일일 변동</span>
            {portfolio.dailyChangePercent >= 0 ? (
              <TrendingUp className="w-5 h-5 text-red-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <p className={clsx(
            'text-2xl font-bold',
            portfolio.dailyChangePercent >= 0 ? 'text-red-600' : 'text-blue-600'
          )}>
            {formatPercent(portfolio.dailyChangePercent)}
          </p>
          <p className="text-sm text-gray-500">{formatCurrency(portfolio.dailyChange)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">보유 현금</span>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(portfolio.cash)}</p>
          <p className="text-sm text-gray-500">{portfolio.cashWeight.toFixed(1)}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              포트폴리오 구성
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'holdings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              보유 종목
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              거래 내역
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">자산 구성</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">현금</span>
                  <span className="text-sm text-gray-600">{portfolio.cashWeight.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full"
                    style={{ width: `${portfolio.cashWeight}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatCurrency(portfolio.cash)}</p>
              </div>

              {portfolio.holdings.map((holding) => (
                <div key={holding.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{holding.name}</span>
                    <span className="text-sm text-gray-600">{holding.weight.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${holding.weight}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatCurrency(holding.currentValue)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균단가</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재가</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{holding.name}</div>
                        <div className="text-sm text-gray-500">{holding.symbol}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {holding.quantity}주
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.averagePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={clsx(
                          'text-sm font-medium',
                          holding.profitLossPercent >= 0 ? 'text-red-600' : 'text-blue-600'
                        )}>
                          {formatPercent(holding.profitLossPercent)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(holding.profitLoss)}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일시</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">투자근거</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        transaction.type === 'BUY' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      )}>
                        {transaction.type === 'BUY' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.stockName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantity}주
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={transaction.reason}>
                      {transaction.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}