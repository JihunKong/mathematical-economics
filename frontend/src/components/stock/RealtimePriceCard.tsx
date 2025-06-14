import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import stockService, { StockPrice } from '@/services/stockService';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import clsx from 'clsx';

interface RealtimePriceCardProps {
  symbol: string;
  name: string;
  className?: string;
  showChart?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function RealtimePriceCard({
  symbol,
  name,
  className = '',
  showChart = false,
  autoRefresh = true,
  refreshInterval = 30000 // 30초
}: RealtimePriceCardProps) {
  const [price, setPrice] = useState<StockPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPrice();
  }, [symbol]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, autoRefresh, refreshInterval]);

  const fetchPrice = async () => {
    try {
      const data = await stockService.getRealtimePrice(symbol);
      setPrice(data);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch price:', err);
      setError(true);
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

  if (loading && !price) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-4', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !price) {
    return (
      <div className={clsx('bg-white rounded-lg shadow p-4', className)}>
        <p className="text-gray-500 text-sm">가격 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  const isPositive = price.changePercent >= 0;

  return (
    <Link 
      to={`/stock/${symbol}`}
      className={clsx(
        'block bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow',
        className
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{symbol}</p>
        </div>
        {autoRefresh && (
          <Activity className="w-4 h-4 text-gray-400 animate-pulse" />
        )}
      </div>

      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(price.currentPrice)}
        </div>
        <div className={clsx(
          'flex items-center gap-1 text-sm font-medium',
          isPositive ? 'text-red-600' : 'text-blue-600'
        )}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {formatCurrency(Math.abs(price.changeAmount))} ({formatPercent(price.changePercent)})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">고가</span>
          <span className="ml-1 font-medium text-red-600">
            {formatCurrency(price.high)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">저가</span>
          <span className="ml-1 font-medium text-blue-600">
            {formatCurrency(price.low)}
          </span>
        </div>
      </div>

      {price.timestamp && (
        <div className="mt-2 text-xs text-gray-400">
          업데이트: {new Date(price.timestamp).toLocaleTimeString('ko-KR')}
        </div>
      )}
    </Link>
  );
}