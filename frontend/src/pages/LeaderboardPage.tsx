import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  classId: string;
  className: string;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdingsCount: number;
  transactionCount: number;
}

export default function LeaderboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  // Redirect admin users to admin page
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.getLeaderboard(timeRange);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('리더보드를 불러오는데 실패했습니다');
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

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-white text-gray-700 border-gray-200';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">리더보드</h1>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('all')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              timeRange === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            전체 기간
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              timeRange === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            이번 달
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              timeRange === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            이번 주
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  클래스
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수익률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보유 종목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래 횟수
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr key={entry.userId} className={clsx(
                  'hover:bg-gray-50 transition-colors',
                  entry.rank <= 3 && 'bg-opacity-50'
                )}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        'flex items-center justify-center w-10 h-10 rounded-full border-2',
                        getRankBadgeClass(entry.rank)
                      )}>
                        {getRankIcon(entry.rank) || (
                          <span className="text-sm font-bold">{entry.rank}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.userName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.className}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(entry.totalValue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {entry.totalProfitLossPercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-blue-500" />
                      )}
                      <span className={clsx(
                        'text-sm font-medium',
                        entry.totalProfitLossPercent >= 0 ? 'text-red-600' : 'text-blue-600'
                      )}>
                        {formatPercent(entry.totalProfitLossPercent)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(entry.totalProfitLoss)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.holdingsCount}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.transactionCount}회
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">아직 거래 기록이 없습니다.</p>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">투자 성과 향상 팁</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• 투자하기 전에 기업의 재무제표와 사업 모델을 분석하세요</li>
          <li>• 한 종목에 집중 투자하지 말고 여러 종목에 분산 투자하세요</li>
          <li>• 단기적인 가격 변동에 흔들리지 말고 장기적인 관점을 유지하세요</li>
          <li>• 투자 결정의 근거를 명확히 기록하고 나중에 검토하세요</li>
        </ul>
      </div>
    </div>
  );
}