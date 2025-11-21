import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import api from '@/services/api';
import stockService, { StockPrice } from '@/services/stockService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StockChart from '@/components/stock/StockChart';
import { TrendingUp, TrendingDown, RefreshCw, ArrowLeft, Newspaper, DollarSign, Activity } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast'에러가 발생했습니다'chart' | 'orderbook' | 'news' | 'financial'>('chart'에러가 발생했습니다'ADMIN'에러가 발생했습니다'주식 정보를 불러오는데 실패했습니다'에러가 발생했습니다'가격 정보가 업데이트되었습니다');
    } catch (error) {
      toast.error('업데이트에 실패했습니다'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'+' : ''에러가 발생했습니다'p-2 rounded-lg transition-colors',
                  autoRefresh ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 hover:bg-gray-200'
                )}
                title={autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'에러가 발생했습니다'p-2 rounded-lg transition-colors',
                  refreshing ? 'bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                <RefreshCw className={clsx('w-5 h-5', refreshing && 'animate-spin'에러가 발생했습니다'flex items-center gap-1',
                  priceChange >= 0 ? 'text-red-600' : 'text-blue-600'에러가 발생했습니다'-'에러가 발생했습니다'chart')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'chart'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'orderbook')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'orderbook'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'news')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'news'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'financial')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'financial'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'에러가 발생했습니다'chart'에러가 발생했습니다'orderbook'에러가 발생했습니다'news'에러가 발생했습니다'financial' && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>재무 정보는 준비 중입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}