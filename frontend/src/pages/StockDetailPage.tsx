import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import api from '@/services/api';
import stockService, { StockPrice } from '@/services/stockService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StockChart from '@/components/stock/StockChart';
import { TrendingUp, TrendingDown, RefreshCw, ArrowLeft, Newspaper, DollarSign, Activity } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: string;
  currentPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  volume: string;
  per: number | null;
  eps: number | null;
  marketCap: string | null;
  updatedAt: string;
  sector?: string;
  description?: string;
}

interface OrderbookItem {
  price: number;
  volume: number;
}

interface Orderbook {
  asks: OrderbookItem[];
  bids: OrderbookItem[];
}

interface StockNews {
  title: string;
  date: string;
  source: string;
  link: string;
}

export default function StockDetailPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { symbol } = useParams<{ symbol: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [realtimePrice, setRealtimePrice] = useState<StockPrice | null>(null);
  const [orderbook, setOrderbook] = useState<Orderbook | null>(null);
  const [news, setNews] = useState<StockNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'orderbook' | 'news' | 'financial'>('chart');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Redirect admin users to admin page
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (symbol) {
      fetchStockData();
      fetchOrderbook();
      fetchNews();
    }
  }, [symbol]);

  // 실시간 가격 업데이트
  useEffect(() => {
    if (!symbol || !autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const price = await stockService.getRealtimePrice(symbol);
        setRealtimePrice(price);
      } catch (error) {
        console.error('Failed to fetch realtime price:', error);
      }
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }, [symbol, autoRefresh]);

  const fetchStockData = async () => {
    try {
      const [stockResponse, priceData] = await Promise.all([
        api.get(`/real-stocks/${symbol}/price`),
        stockService.getRealtimePrice(symbol!)
      ]);
      setStock(stockResponse.data.data);
      setRealtimePrice(priceData);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
      toast.error('주식 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderbook = async () => {
    try {
      const response = await api.get(`/real-stocks/${symbol}/orderbook`);
      setOrderbook(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await api.get(`/real-stocks/${symbol}/news`);
      setNews(response.data.data);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchStockData(),
        fetchOrderbook(),
        symbol ? stockService.getRealtimePrice(symbol).then(setRealtimePrice) : null
      ]);
      toast.success('가격 정보가 업데이트되었습니다');
    } catch (error) {
      toast.error('업데이트에 실패했습니다');
    } finally {
      setRefreshing(false);
    }
  }, [symbol]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume: string) => {
    const num = parseInt(volume);
    if (num >= 100000000) {
      return `${(num / 100000000).toFixed(2)}억`;
    } else if (num >= 10000) {
      return `${(num / 10000).toFixed(0)}만`;
    }
    return num.toLocaleString();
  };

  if (loading) return <LoadingSpinner />;
  if (!stock) return <div>주식 정보를 찾을 수 없습니다.</div>;

  // 실시간 가격이 있으면 사용, 없으면 기본 가격 사용
  const currentPrice = realtimePrice?.currentPrice || stock.currentPrice;
  const priceChange = currentPrice - stock.previousClose;
  const priceChangePercent = (priceChange / stock.previousClose) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/trading" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          거래 페이지로 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{stock.name}</h1>
              <p className="text-gray-500">{stock.symbol} · {stock.market}</p>
              {stock.sector && <p className="text-sm text-gray-500 mt-1">{stock.sector}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  autoRefresh ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 hover:bg-gray-200'
                )}
                title={autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'}
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={clsx(
                  'p-2 rounded-lg transition-colors',
                  refreshing ? 'bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                <RefreshCw className={clsx('w-5 h-5', refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-3xl font-bold">{formatCurrency(currentPrice)}</span>
                <div className={clsx(
                  'flex items-center gap-1',
                  priceChange >= 0 ? 'text-red-600' : 'text-blue-600'
                )}>
                  {priceChange >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {formatCurrency(Math.abs(priceChange))} ({formatPercent(priceChangePercent)})
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                마지막 업데이트: {new Date(stock.updatedAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">시가</p>
                <p className="font-medium">{formatCurrency(stock.dayOpen)}</p>
              </div>
              <div>
                <p className="text-gray-500">전일종가</p>
                <p className="font-medium">{formatCurrency(stock.previousClose)}</p>
              </div>
              <div>
                <p className="text-gray-500">고가</p>
                <p className="font-medium text-red-600">{formatCurrency(stock.dayHigh)}</p>
              </div>
              <div>
                <p className="text-gray-500">저가</p>
                <p className="font-medium text-blue-600">{formatCurrency(stock.dayLow)}</p>
              </div>
              <div>
                <p className="text-gray-500">거래량</p>
                <p className="font-medium">{formatVolume(stock.volume)}주</p>
              </div>
              <div>
                <p className="text-gray-500">PER</p>
                <p className="font-medium">{stock.per ? `${stock.per.toFixed(2)}` : '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('chart')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'chart'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              차트
            </button>
            <button
              onClick={() => setActiveTab('orderbook')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'orderbook'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              호가
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'news'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              뉴스
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'financial'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              재무
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'chart' && symbol && (
            <StockChart 
              symbol={symbol} 
              autoRefresh={autoRefresh}
              refreshInterval={10000}
              height={500}
            />
          )}

          {activeTab === 'orderbook' && orderbook && (
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">매도 호가</h3>
                <div className="space-y-2">
                  {orderbook.asks.reverse().map((ask, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="font-medium">{formatCurrency(ask.price)}</span>
                      <span className="text-gray-600">{ask.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600">매수 호가</h3>
                <div className="space-y-2">
                  {orderbook.bids.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="font-medium">{formatCurrency(bid.price)}</span>
                      <span className="text-gray-600">{bid.volume.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="space-y-4">
              {news.length === 0 ? (
                <p className="text-gray-500 text-center py-8">관련 뉴스가 없습니다.</p>
              ) : (
                news.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <Newspaper className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-medium hover:text-primary-600 transition-colors"
                        >
                          {item.title}
                        </a>
                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                          <span>{item.source}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'financial' && (
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