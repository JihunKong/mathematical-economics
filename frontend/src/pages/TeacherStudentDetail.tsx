import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx';

interface StudentActivity {
  student: {
    id: string;
    name: string;
    email: string;
    className: string;
    currentCash: number;
  };
  portfolio: {
    totalValue: number;
    totalCost: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
  };
  holdings: Array<{
    id: string;
    quantity: number;
    averagePrice: number;
    totalCost: number;
    currentValue: number;
    profitLoss: number;
    profitLossPercent: number;
    stock: {
      symbol: string;
      name: string;
      currentPrice: number;
    };
  }>;
  transactions: Array<{
    id: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    totalAmount: number;
    commission: number;
    reason?: string;
    createdAt: string;
    stock: {
      symbol: string;
      name: string;
    };
  }>;
}

export default function TeacherStudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const [activity, setActivity] = useState<StudentActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');

  useEffect(() => {
    if (studentId) {
      fetchStudentActivity();
    }
  }, [studentId]);

  const fetchStudentActivity = async () => {
    try {
      const response = await api.get(`/teacher/students/${studentId}/activity`);
      setActivity(response.data.data);
    } catch (error) {
      console.error('Failed to fetch student activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!activity) {
    return <div>학생 정보를 찾을 수 없습니다.</div>;
  }

  const totalValue = activity.student.currentCash + 
    activity.holdings.reduce((sum, h) => sum + h.currentValue, 0);

  return (
    <div>
      <div className="mb-6">
        <Link to="/teacher" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← 대시보드로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{activity.student.name} 학생 활동 상세</h1>
        <p className="text-gray-600">{activity.student.email} · {activity.student.className}</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">총 자산</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">보유 현금</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(activity.student.currentCash)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">총 수익</p>
          <p className={clsx(
            'text-xl font-bold',
            activity.portfolio?.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(activity.portfolio?.totalProfitLoss || 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-500 mb-1">수익률</p>
          <p className={clsx(
            'text-xl font-bold',
            activity.portfolio?.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatPercent(activity.portfolio?.totalProfitLossPercent || 0)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('holdings')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'holdings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            보유 종목
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            거래 내역
          </button>
        </nav>
      </div>

      {/* Holdings Tab */}
      {activeTab === 'holdings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activity.holdings.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    종목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 매수가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재가
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평가 금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수익률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activity.holdings.map((holding) => (
                  <tr key={holding.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{holding.stock.name}</div>
                        <div className="text-sm text-gray-500">{holding.stock.symbol}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {holding.quantity.toLocaleString()}주
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.averagePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.stock.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'text-sm font-medium',
                        holding.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatPercent(holding.profitLossPercent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              보유 종목이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {activity.transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded',
                      transaction.type === 'BUY' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    )}>
                      {transaction.type === 'BUY' ? '매수' : '매도'}
                    </span>
                    <span className="font-medium text-gray-900">
                      {transaction.stock.name} ({transaction.stock.symbol})
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {transaction.quantity}주 × {formatCurrency(transaction.price)} = {formatCurrency(transaction.totalAmount)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                  </p>
                </div>
              </div>
              
              {transaction.reason && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-1">투자 근거:</p>
                  <p className="text-sm text-gray-600">{transaction.reason}</p>
                </div>
              )}
            </div>
          ))}
          
          {activity.transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              거래 내역이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}