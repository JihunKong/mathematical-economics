import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Plus, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAppSelector } from '../hooks/useRedux';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: string;
  sector: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  lastPriceUpdate: string | null;
}

interface MarketStats {
  totalStocks: number;
  trackedStocks: number;
  byMarket: Array<{
    market: string;
    count: number;
  }>;
}

const WatchlistSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('ALL');
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [canChange, setCanChange] = useState(true);

  // Check if user can change watchlist today
  useEffect(() => {
    const checkCanChange = async () => {
      try {
        const response = await fetch('/api/watchlist/can-change', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCanChange(data.data.canChange);
        }
      } catch (error) {
        console.error('Error checking watchlist permissions:', error);
      }
    };

    if (token) {
      checkCanChange();
    }
  }, [token]);

  // Load market statistics
  useEffect(() => {
    const loadMarketStats = async () => {
      try {
        const response = await fetch('/api/watchlist/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMarketStats(data.data);
        }
      } catch (error) {
        console.error('Error loading market stats:', error);
      }
    };

    if (token) {
      loadMarketStats();
    }
  }, [token]);

  // Load existing watchlist
  useEffect(() => {
    const loadExistingWatchlist = async () => {
      try {
        const response = await fetch('/api/watchlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const stocks = data.data.map((item: any) => item.stock);
          setSelectedStocks(stocks);
        }
      } catch (error) {
        console.error('Error loading existing watchlist:', error);
      }
    };

    if (token) {
      loadExistingWatchlist();
    }
  }, [token]);

  // Search stocks
  useEffect(() => {
    const searchStocks = async () => {
      if (!token) return;
      
      setSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedMarket !== 'ALL') params.append('market', selectedMarket);
        params.append('limit', '50');

        const response = await fetch(`/api/watchlist/stocks?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableStocks(data.data);
        } else {
          throw new Error('Failed to search stocks');
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
        toast.error('주식 검색에 실패했습니다');
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchStocks();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedMarket, token]);

  const handleAddStock = (stock: Stock) => {
    if (selectedStocks.length >= 10) {
      toast.error('최대 10개까지만 선택할 수 있습니다');
      return;
    }

    if (selectedStocks.find(s => s.id === stock.id)) {
      toast.error('이미 선택된 종목입니다');
      return;
    }

    setSelectedStocks([...selectedStocks, stock]);
    toast.success(`${stock.name} 추가됨`);
  };

  const handleRemoveStock = (stockId: string) => {
    setSelectedStocks(selectedStocks.filter(s => s.id !== stockId));
  };

  const handleSaveWatchlist = async () => {
    if (selectedStocks.length === 0) {
      toast.error('최소 1개 종목을 선택해주세요');
      return;
    }

    if (!canChange) {
      toast.error('하루에 한 번만 관심종목을 변경할 수 있습니다');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stockIds: selectedStocks.map(s => s.id)
        })
      });

      if (response.ok) {
        toast.success('관심종목이 저장되었습니다!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save watchlist');
      }
    } catch (error: any) {
      console.error('Error saving watchlist:', error);
      toast.error(error.message || '관심종목 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatChangePercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // 학생이 아닌 경우 대시보드로 리다이렉트
  if (user?.role !== 'STUDENT') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">관심종목 선택</h1>
        <p className="text-gray-600 mb-4">
          거래를 시작하기 전에 관심있는 종목을 최대 10개까지 선택해주세요.
          선택한 종목들의 가격이 실시간으로 업데이트됩니다.
        </p>
        {!canChange && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              오늘 이미 관심종목을 변경하셨습니다. 내일 다시 변경할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Market Statistics */}
      {marketStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{marketStats.totalStocks.toLocaleString()}</div>
            <div className="text-sm text-blue-800">전체 종목</div>
          </div>
          {marketStats.byMarket.map((market) => (
            <div key={market.market} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xl font-bold text-gray-700">{market.count.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{market.market}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Search */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">종목 검색</h2>
          
          {/* Search Controls */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="종목명 또는 심볼 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">전체 시장</option>
              <option value="KOSPI">KOSPI</option>
              <option value="KOSDAQ">KOSDAQ</option>
              <option value="KOSDAQ GLOBAL">KOSDAQ GLOBAL</option>
              <option value="KONEX">KONEX</option>
            </select>
          </div>

          {/* Available Stocks */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">검색 중...</p>
              </div>
            ) : (
              availableStocks.map((stock) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{stock.name}</h3>
                        <p className="text-sm text-gray-500">{stock.symbol} • {stock.market}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(stock.currentPrice)}원</div>
                        <div className={`text-sm flex items-center ${
                          stock.change >= 0 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {formatChangePercent(stock.changePercent)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddStock(stock)}
                    disabled={selectedStocks.find(s => s.id === stock.id) !== undefined || selectedStocks.length >= 10}
                    className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Watchlist */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">선택된 관심종목</h2>
            <span className="text-sm text-gray-500">{selectedStocks.length}/10</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedStocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                관심종목을 선택해주세요
              </div>
            ) : (
              selectedStocks.map((stock, index) => (
                <div key={stock.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{stock.name}</h3>
                      <p className="text-sm text-gray-500">{stock.symbol} • {stock.market}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <div className="font-medium">{formatPrice(stock.currentPrice)}원</div>
                      <div className={`text-sm ${
                        stock.change >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {formatChangePercent(stock.changePercent)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStock(stock.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveWatchlist}
            disabled={loading || selectedStocks.length === 0 || !canChange}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '저장 중...' : '관심종목 저장하고 시작하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatchlistSetupPage;