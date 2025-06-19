import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateCash } from '@/store/portfolioSlice';
import api from '@/services/api';
import stockService, { StockPrice } from '@/services/stockService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, TrendingUp, TrendingDown, Info, RefreshCw, Activity } from 'lucide-react';
import clsx from 'clsx';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

export default function TradingPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [realtimePrices, setRealtimePrices] = useState<Map<string, StockPrice>>(new Map());
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [currentCash, setCurrentCash] = useState(0);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<'all' | 'KOSPI' | 'KOSDAQ'>('all');

  // Redirect admin users to admin page
  if (user && user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  // 실시간 가격 업데이트
  useEffect(() => {
    if (!autoRefresh || stocks.length === 0) return;

    const updatePrices = async () => {
      try {
        // 현재 표시되는 주식들의 심볼만 추출
        const visibleSymbols = filteredStocks.slice(0, 20).map(s => s.symbol);
        const prices = await stockService.getBatchPrices(visibleSymbols);
        
        const priceMap = new Map<string, StockPrice>();
        prices.forEach(price => {
          priceMap.set(price.symbol, price);
        });
        setRealtimePrices(priceMap);
      } catch (error) {
        console.error('Failed to update prices:', error);
      }
    };

    updatePrices();
    const interval = setInterval(updatePrices, 10000); // 10초마다 업데이트

    return () => clearInterval(interval);
  }, [autoRefresh, stocks, searchQuery, selectedMarket]);

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [stocksRes, holdingsRes, portfolioRes] = await Promise.all([
        api.getStocks(),
        api.getHoldings(),
        api.getPortfolio()
      ]);
      
      setStocks(stocksRes.data);
      setHoldings(holdingsRes.data);
      setCurrentCash(portfolioRes.data.cash);
      
      // Redux store 업데이트
      dispatch(updateCash(portfolioRes.data.cash));

      // 초기 실시간 가격 로드
      if (stocksRes.data.length > 0) {
        const symbols = stocksRes.data.slice(0, 20).map((s: Stock) => s.symbol);
        const prices = await stockService.getBatchPrices(symbols);
        const priceMap = new Map<string, StockPrice>();
        prices.forEach(price => {
          priceMap.set(price.symbol, price);
        });
        setRealtimePrices(priceMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleTrade = async () => {
    if (!selectedStock || !quantity || parseInt(quantity) <= 0) {
      toast.error('올바른 수량을 입력해주세요');
      return;
    }

    if (!reason.trim()) {
      toast.error('투자 판단 근거를 입력해주세요');
      return;
    }

    const currentPrice = realtimePrices.get(selectedStock.symbol)?.currentPrice || selectedStock.currentPrice;
    if (!currentPrice || currentPrice === 0) {
      toast.error('현재 가격 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const qty = parseInt(quantity);
    
    try {
      if (tradeMode === 'buy') {
        await api.buyStock(selectedStock.symbol, qty, reason);
        toast.success('매수 주문이 완료되었습니다');
      } else {
        await api.sellStock(selectedStock.symbol, qty, reason);
        toast.success('매도 주문이 완료되었습니다');
      }
      
      setShowTradeModal(false);
      setQuantity('');
      setReason('');
      fetchData();
    } catch (error) {
      console.error('Trade failed:', error);
    }
  };

  const handleRefreshPrices = async () => {
    // Only teachers and admins can update prices
    if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
      toast.error('교사 또는 관리자만 가격을 업데이트할 수 있습니다');
      return;
    }
    
    setRefreshing(true);
    try {
      await api.post('/real-stocks/update-all-prices');
      toast.success('주식 가격이 업데이트되었습니다');
      fetchData();
    } catch (error) {
      console.error('Failed to refresh prices:', error);
      toast.error('가격 업데이트에 실패했습니다');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStocks = useMemo(() => {
    return stocks
      .filter(stock => 
        (selectedMarket === 'all' || stock.market === selectedMarket) &&
        (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
         stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [stocks, searchQuery, selectedMarket]);

  const getHoldingQuantity = (symbol: string) => {
    const holding = holdings.find(h => h.symbol === symbol);
    return holding?.quantity || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">주식 거래</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                autoRefresh ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              title={autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'}
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm">자동 갱신</span>
            </button>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors',
                refreshing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
              <span className="text-sm">새로고침</span>
            </button>
            {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
              <button
                onClick={handleRefreshPrices}
                disabled={refreshing}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
                  refreshing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
                {refreshing ? '업데이트 중...' : '실시간 가격 업데이트'}
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600">보유 현금: {formatCurrency(currentCash)}</p>
      </div>

      {/* Search Bar and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="종목명 또는 코드 검색..."
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMarket('all')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedMarket('KOSPI')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === 'KOSPI' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              코스피
            </button>
            <button
              onClick={() => setSelectedMarket('KOSDAQ')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === 'KOSDAQ' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              코스닥
            </button>
          </div>
        </div>
      </div>

      {/* Stock List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                종목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                현재가
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                변동률
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                보유수량
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                거래
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                      <div className="text-sm text-gray-500">{stock.symbol}</div>
                    </div>
                    <Link
                      to={`/stock/${stock.symbol}`}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title="상세정보"
                    >
                      <Info className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(() => {
                    const realtimePrice = realtimePrices.get(stock.symbol);
                    const displayPrice = realtimePrice?.currentPrice || stock.currentPrice;
                    return (
                      <div>
                        {displayPrice && displayPrice > 0 ? (
                          <>
                            <div className="font-medium">{formatCurrency(displayPrice)}</div>
                            {realtimePrice && realtimePrice.timestamp && (
                              <div className="text-xs text-gray-500">
                                {new Date(realtimePrice.timestamp).toLocaleTimeString('ko-KR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit', 
                                  second: '2-digit' 
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400 italic">가격 정보 없음</div>
                        )}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const realtimePrice = realtimePrices.get(stock.symbol);
                    const changePercent = realtimePrice?.changePercent ?? stock.changePercent;
                    const changeAmount = realtimePrice?.changeAmount ?? stock.change;
                    
                    return (
                      <div className={clsx(
                        'flex items-center text-sm font-medium',
                        changePercent >= 0 ? 'text-red-600' : 'text-blue-600'
                      )}>
                        {changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        <div>
                          <div>{Math.abs(changePercent).toFixed(2)}%</div>
                          <div className="text-xs">
                            {changeAmount >= 0 ? '+' : ''}{changeAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getHoldingQuantity(stock.symbol)}주
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const realtimePrice = realtimePrices.get(stock.symbol);
                        const currentPrice = realtimePrice?.currentPrice || stock.currentPrice;
                        if (!currentPrice || currentPrice === 0) {
                          toast.error('현재 가격 정보가 없습니다. 잠시 후 다시 시도해주세요.');
                          return;
                        }
                        setSelectedStock({
                          ...stock,
                          currentPrice: currentPrice
                        });
                        setTradeMode('buy');
                        setShowTradeModal(true);
                      }}
                      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!((realtimePrices.get(stock.symbol)?.currentPrice || stock.currentPrice) > 0)}
                    >
                      매수
                    </button>
                    {getHoldingQuantity(stock.symbol) > 0 && (
                      <button
                        onClick={() => {
                          const realtimePrice = realtimePrices.get(stock.symbol);
                          const currentPrice = realtimePrice?.currentPrice || stock.currentPrice;
                          if (!currentPrice || currentPrice === 0) {
                            toast.error('현재 가격 정보가 없습니다. 잠시 후 다시 시도해주세요.');
                            return;
                          }
                          setSelectedStock({
                            ...stock,
                            currentPrice: currentPrice
                          });
                          setTradeMode('sell');
                          setShowTradeModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!((realtimePrices.get(stock.symbol)?.currentPrice || stock.currentPrice) > 0)}
                      >
                        매도
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedStock.name} {tradeMode === 'buy' ? '매수' : '매도'}
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">현재가</p>
              <p className="text-lg font-semibold">{formatCurrency(realtimePrices.get(selectedStock.symbol)?.currentPrice || selectedStock.currentPrice)}</p>
            </div>

            {tradeMode === 'sell' && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">보유 수량</p>
                <p className="text-lg font-semibold">{getHoldingQuantity(selectedStock.symbol)}주</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수량
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input w-full"
                placeholder="0"
                min="1"
                max={tradeMode === 'sell' ? getHoldingQuantity(selectedStock.symbol) : undefined}
              />
              {quantity && parseInt(quantity) > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  예상 {tradeMode === 'buy' ? '매수' : '매도'} 금액: {formatCurrency((realtimePrices.get(selectedStock.symbol)?.currentPrice || selectedStock.currentPrice) * parseInt(quantity))}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                투자 판단 근거 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input w-full h-24"
                placeholder="투자 결정의 이유를 작성해주세요..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTradeModal(false);
                  setQuantity('');
                  setReason('');
                }}
                className="btn btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleTrade}
                className={clsx(
                  'btn flex-1',
                  tradeMode === 'buy' ? 'btn-primary bg-red-600 hover:bg-red-700' : 'btn-primary'
                )}
              >
                {tradeMode === 'buy' ? '매수' : '매도'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}