import { useEffect, useState } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatNumber } from '@/utils/formatters';

interface Stock {
  symbol: string;
  name: string;
  market: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  isTracked: boolean;
  isAdded?: boolean;
  updatedAt: string;
  sector?: string;
}

interface PriceUpdateData {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
}

export default function StockManagement() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [viewMode, setViewMode] = useState<'tracked' | 'all'>('tracked');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceData, setPriceData] = useState<PriceUpdateData>({
    symbol: '',
    currentPrice: 0,
    previousClose: 0,
    dayOpen: 0,
    dayHigh: 0,
    dayLow: 0,
    volume: 0,
  });

  useEffect(() => {
    if (viewMode === 'tracked') {
      fetchTrackedStocks();
    } else {
      fetchAllStocks();
    }
  }, [viewMode]);

  const fetchTrackedStocks = async () => {
    try {
      const response = await api.get('/stock-management/tracked');
      setStocks(response.data.data);
    } catch (error) {
      toast.error('주식 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllStocks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stock-management/search', {
        params: { query: searchQuery }
      });
      
      // Also fetch tracked stocks to get current prices
      const trackedResponse = await api.get('/stock-management/tracked');
      const trackedMap = new Map(
        trackedResponse.data.data.map((stock: Stock) => [stock.symbol, stock])
      );
      
      // Merge data
      const mergedStocks = response.data.data.map((stock: any) => {
        const trackedStock = trackedMap.get(stock.symbol);
        return {
          ...stock,
          currentPrice: trackedStock?.currentPrice || 0,
          previousClose: trackedStock?.previousClose || 0,
          change: trackedStock?.change || 0,
          changePercent: trackedStock?.changePercent || 0,
          updatedAt: trackedStock?.updatedAt || new Date().toISOString(),
        };
      });
      
      setStocks(mergedStocks);
    } catch (error) {
      toast.error('주식 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceUpdate = (stock: Stock) => {
    setSelectedStock(stock);
    setPriceData({
      symbol: stock.symbol,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      dayOpen: stock.currentPrice,
      dayHigh: stock.currentPrice,
      dayLow: stock.currentPrice,
      volume: 1000000,
    });
    setShowPriceModal(true);
  };

  const updatePrice = async () => {
    try {
      await api.put(`/stock-management/${priceData.symbol}/price`, priceData);
      toast.success('가격이 업데이트되었습니다.');
      setShowPriceModal(false);
      if (viewMode === 'tracked') {
        fetchTrackedStocks();
      } else {
        fetchAllStocks();
      }
    } catch (error) {
      toast.error('가격 업데이트에 실패했습니다.');
    }
  };

  const triggerCrawl = async () => {
    try {
      await api.post('/stock-management/crawl-prices');
      toast.success('주식 가격 크롤링을 시작했습니다.');
    } catch (error) {
      toast.error('크롤링 시작에 실패했습니다.');
    }
  };

  const addStock = async (symbol: string) => {
    try {
      await api.post('/stock-management/add', { symbol });
      toast.success('주식이 추가되었습니다.');
      if (viewMode === 'all') {
        fetchAllStocks();
      }
    } catch (error) {
      toast.error('주식 추가에 실패했습니다.');
    }
  };

  const toggleTracking = async (symbol: string, isTracked: boolean) => {
    try {
      await api.patch(`/stock-management/${symbol}/tracking`, { isTracked });
      toast.success(`주식 추적이 ${isTracked ? '활성화' : '비활성화'}되었습니다.`);
      if (viewMode === 'tracked') {
        fetchTrackedStocks();
      } else {
        fetchAllStocks();
      }
    } catch (error) {
      toast.error('주식 추적 설정에 실패했습니다.');
    }
  };

  const getTimeSinceUpdate = (updatedAt: string) => {
    const updateTime = new Date(updatedAt);
    const now = new Date();
    const hours = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
      return `${minutes}분 전`;
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}일 전`;
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">주식 가격 관리</h1>
        <div className="flex gap-4">
          <button
            onClick={triggerCrawl}
            className="btn btn-secondary"
          >
            가격 자동 업데이트 시도
          </button>
        </div>
      </div>

      {/* View Mode Toggle and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode('tracked')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'tracked' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            추적 중인 종목 ({stocks.filter(s => s.isTracked).length})
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체 종목 보기
          </button>
        </div>
        
        {viewMode === 'all' && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="종목명 또는 코드로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchAllStocks()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={fetchAllStocks}
              className="btn btn-primary"
            >
              검색
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                종목
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                현재가
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                전일대비
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                마지막 업데이트
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => {
              const isStale = stock.isAdded && new Date().getTime() - new Date(stock.updatedAt).getTime() > 1000 * 60 * 60; // 1시간
              return (
                <tr key={stock.symbol} className={isStale ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {stock.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stock.symbol} · {stock.market} {stock.sector && `· ${stock.sector}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {stock.currentPrice ? `₩${formatNumber(stock.currentPrice)}` : '가격 없음'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {stock.currentPrice > 0 && (
                      <div className={`text-sm font-medium ${
                        stock.change > 0 ? 'text-red-600' : 
                        stock.change < 0 ? 'text-blue-600' : 
                        'text-gray-900'
                      }`}>
                        {stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}
                        <span className="text-xs ml-1">
                          ({stock.change > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {stock.isAdded ? (
                      <div className={`text-sm ${isStale ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                        {getTimeSinceUpdate(stock.updatedAt)}
                        {isStale && <div className="text-xs">업데이트 필요</div>}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {stock.isAdded ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stock.isTracked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stock.isTracked ? '추적 중' : '미추적'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          미등록
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!stock.isAdded ? (
                        <button
                          onClick={() => addStock(stock.symbol)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          추가
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleTracking(stock.symbol, !stock.isTracked)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            {stock.isTracked ? '추적 중지' : '추적 시작'}
                          </button>
                          {stock.isTracked && (
                            <button
                              onClick={() => handlePriceUpdate(stock)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              가격 수정
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Price Update Modal */}
      {showPriceModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedStock.name} 가격 업데이트
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">현재가</label>
                <input
                  type="number"
                  value={priceData.currentPrice}
                  onChange={(e) => setPriceData({ ...priceData, currentPrice: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">전일 종가</label>
                <input
                  type="number"
                  value={priceData.previousClose}
                  onChange={(e) => setPriceData({ ...priceData, previousClose: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">시가</label>
                  <input
                    type="number"
                    value={priceData.dayOpen}
                    onChange={(e) => setPriceData({ ...priceData, dayOpen: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">거래량</label>
                  <input
                    type="number"
                    value={priceData.volume}
                    onChange={(e) => setPriceData({ ...priceData, volume: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">고가</label>
                  <input
                    type="number"
                    value={priceData.dayHigh}
                    onChange={(e) => setPriceData({ ...priceData, dayHigh: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">저가</label>
                  <input
                    type="number"
                    value={priceData.dayLow}
                    onChange={(e) => setPriceData({ ...priceData, dayLow: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="btn btn-secondary"
              >
                취소
              </button>
              <button
                onClick={updatePrice}
                className="btn btn-primary"
              >
                업데이트
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}