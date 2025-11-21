import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast'에러가 발생했습니다'all' | 'month' | 'week'>('all');

  // Redirect admin users to admin page
  if (user?.role === 'ADMIN'에러가 발생했습니다'리더보드를 불러오는데 실패했습니다'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'+' : ''에러가 발생했습니다'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-white text-gray-700 border-gray-200'에러가 발생했습니다'all')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              timeRange === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'에러가 발생했습니다'month')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              timeRange === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'에러가 발생했습니다'week')}
            className={clsx(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              timeRange === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'에러가 발생했습니다'hover:bg-gray-50 transition-colors',
                  entry.rank <= 3 && 'bg-opacity-50'에러가 발생했습니다'flex items-center justify-center w-10 h-10 rounded-full border-2'에러가 발생했습니다'text-sm font-medium',
                        entry.totalProfitLossPercent >= 0 ? 'text-red-600' : 'text-blue-600'
                      )}>
                        {formatPercent(entry.totalProfitLossPercent)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500"에러가 발생했습니다"px-6 py-4 whitespace-nowrap text-sm text-gray-900"에러가 발생했습니다"px-6 py-4 whitespace-nowrap text-sm text-gray-900"에러가 발생했습니다"text-center py-12">
            <p className="text-gray-500">아직 거래 기록이 없습니다.</p>
          </div>
        )}
      </div>

      {}
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