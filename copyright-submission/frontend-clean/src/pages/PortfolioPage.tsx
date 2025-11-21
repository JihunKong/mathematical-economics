import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast'에러가 발생했습니다'BUY' | 'SELL'에러가 발생했습니다'overview' | 'holdings' | 'history'>('overview');

  // Redirect admin users to admin page
  if (user?.role === 'ADMIN'에러가 발생했습니다's a watchlist requirement error (403)
      if (error?.response?.status === 403 && error?.response?.data?.code === 'WATCHLIST_REQUIRED') {
        setNeedsWatchlist(true);
      } else {
        toast.error('포트폴리오를 불러오는데 실패했습니다'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'0.00%';
    return `${percent >= 0 ? '+' : ''에러가 발생했습니다'ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  useEffect(() => {
    if (needsWatchlist && user?.role === 'STUDENT') {
      navigate('/watchlist-setup'에러가 발생했습니다'text-2xl font-bold',
            portfolio.totalProfitLossPercent >= 0 ? 'text-red-600' : 'text-blue-600'에러가 발생했습니다'text-2xl font-bold',
            portfolio.dailyChangePercent >= 0 ? 'text-red-600' : 'text-blue-600'에러가 발생했습니다'overview')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'holdings')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'holdings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'history')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'overview'에러가 발생했습니다'holdings'에러가 발생했습니다'text-sm font-medium',
                          holding.profitLossPercent >= 0 ? 'text-red-600' : 'text-blue-600'에러가 발생했습니다'history'에러가 발생했습니다'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        transaction.type === 'BUY' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      )}>
                        {transaction.type === 'BUY' ? '매수' : '매도'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"에러가 발생했습니다"px-6 py-4 whitespace-nowrap text-sm text-gray-900"에러가 발생했습니다"px-6 py-4 whitespace-nowrap text-sm text-gray-900"에러가 발생했습니다"px-6 py-4 whitespace-nowrap text-sm text-gray-900"에러가 발생했습니다"px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={transaction.reason}>
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