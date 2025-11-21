import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import stockService, { StockPrice } from '@/services/stockService';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import clsx from 'clsx'에러가 발생했습니다''에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW'에러가 발생했습니다'+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading && !price) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-4'에러가 발생했습니다'bg-white rounded-lg shadow p-4'에러가 발생했습니다'block bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow'에러가 발생했습니다'flex items-center gap-1 text-sm font-medium',
          isPositive ? 'text-red-600' : 'text-blue-600'에러가 발생했습니다'ko-KR')}
        </div>
      )}
    </Link>
  );
}