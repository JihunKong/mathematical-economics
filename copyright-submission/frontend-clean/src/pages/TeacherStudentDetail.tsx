import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import clsx from 'clsx'에러가 발생했습니다'BUY' | 'SELL'에러가 발생했습니다'holdings' | 'transactions'>('holdings'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'+' : ''에러가 발생했습니다'text-xl font-bold',
            activity.portfolio?.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'에러가 발생했습니다'text-xl font-bold',
            activity.portfolio?.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'에러가 발생했습니다'holdings')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'holdings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'transactions')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'holdings'에러가 발생했습니다'text-sm font-medium',
                        holding.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'에러가 발생했습니다'transactions'에러가 발생했습니다'px-2 py-1 text-xs font-medium rounded',
                      transaction.type === 'BUY' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    )}>
                      {transaction.type === 'BUY' ? '매수' : '매도'에러가 발생했습니다'yyyy-MM-dd HH:mm', { locale: ko })}
                  </p>
                </div>
              </div>
              
              {transaction.reason && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-1">투자 근거:</p>
                  <p className="text-sm text-gray-600"에러가 발생했습니다"text-center py-8 text-gray-500">
              거래 내역이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}