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
  updatedAt: string;
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
    fetchTrackedStocks();
  }, []);

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
      fetchTrackedStocks();
    } catch (error) {
      toast.error('가격 업데이트에 실패했습니다.');
    }
  };

  const triggerCrawl = async () => {
    try {
      const response = await api.post('/stock-management/crawl-prices');
      toast.success('주식 가격 크롤링을 시작했습니다.');
    } catch (error) {
      toast.error('크롤링 시작에 실패했습니다.');
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
        <button
          onClick={triggerCrawl}
          className="btn btn-secondary"
        >
          가격 자동 업데이트 시도
        </button>
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
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => {
              const isStale = new Date().getTime() - new Date(stock.updatedAt).getTime() > 1000 * 60 * 60; // 1시간
              return (
                <tr key={stock.symbol} className={isStale ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {stock.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stock.symbol} · {stock.market}
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
                    <div className={`text-sm ${isStale ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                      {getTimeSinceUpdate(stock.updatedAt)}
                      {isStale && <div className="text-xs">업데이트 필요</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handlePriceUpdate(stock)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      수동 업데이트
                    </button>
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