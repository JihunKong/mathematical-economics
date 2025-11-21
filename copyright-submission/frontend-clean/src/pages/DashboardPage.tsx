import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateCash } from '@/store/portfolioSlice';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import RealtimePriceCard from '@/components/stock/RealtimePriceCard';
import MiniChart from '@/components/stock/MiniChart';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw } from 'lucide-react';
import clsx from 'clsx'에러가 발생했습니다'TEACHER'에러가 발생했습니다'ADMIN'에러가 발생했습니다's a watchlist requirement error (403)
        if (error?.response?.status === 403 && error?.response?.data?.code === 'WATCHLIST_REQUIRED'에러가 발생했습니다'STUDENT') {
      navigate('/watchlist-setup'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'+' : ''에러가 발생했습니다'₩0'에러가 발생했습니다'₩0'에러가 발생했습니다'text-2xl font-bold', {
              'text-success-600': portfolio && portfolio.totalProfitLossPercent >= 0,
              'text-danger-600'에러가 발생했습니다'+0.00%'에러가 발생했습니다'text-2xl font-bold', {
              'text-success-600': portfolio && portfolio.dailyChangePercent >= 0,
              'text-danger-600'에러가 발생했습니다'+0.00%'에러가 발생했습니다'text-sm', {
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

      {}
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