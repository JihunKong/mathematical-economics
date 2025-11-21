import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Plus, X, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Sparkles, Shuffle, Trophy, Rocket } from 'lucide-react';
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

interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<Stock[]>;
}

const WatchlistSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('ALL');
  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [canChange, setCanChange] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStocks, setTotalStocks] = useState(0);
  const itemsPerPage = 20;

  // Preset templates
  const presetTemplates: PresetTemplate[] = [
    {
      id: 'top10',
      name: 'TOP 10 종목',
      description: '시가총액 상위 10개 종목',
      icon: <Trophy className="h-5 w-5" />,
      action: async () => {
        const response = await fetch('/api/watchlist/presets/top10', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return data.data;
      }
    },
    {
      id: 'random',
      name: '랜덤 종목',
      description: '무작위로 선택된 10개 종목',
      icon: <Shuffle className="h-5 w-5" />,
      action: async () => {
        const response = await fetch('/api/watchlist/presets/random', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return data.data;
      }
    },
    {
      id: 'kospi',
      name: 'KOSPI 대표',
      description: 'KOSPI 대표 종목 10개',
      icon: <Sparkles className="h-5 w-5" />,
      action: async () => {
        const response = await fetch('/api/watchlist/presets/kospi-leaders', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return data.data;
      }
    },
    {
      id: 'kosdaq',
      name: 'KOSDAQ 유망주',
      description: 'KOSDAQ 성장 유망 종목',
      icon: <Rocket className="h-5 w-5" />,
      action: async () => {
        const response = await fetch('/api/watchlist/presets/kosdaq-promising', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        return data.data;
      }
    }
  ];

  // Check if user can change watchlist today
  useEffect(() => {
    const checkCanChange = async () => {
      try {
        const response = await fetch('/api/watchlist/can-change', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
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

    if (accessToken) {
      checkCanChange();
    }
  }, [accessToken]);

  // Load market statistics
  useEffect(() => {
    const loadMarketStats = async () => {
      try {
        const response = await fetch('/api/watchlist/stats', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
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

    if (accessToken) {
      loadMarketStats();
    }
  }, [accessToken]);

  // Load existing watchlist
  useEffect(() => {
    const loadExistingWatchlist = async () => {
      try {
        const response = await fetch('/api/watchlist', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const stocks = data.data.map((item: any) => item.stock);
          setSelectedStocks(stocks);
          setSelectedIds(new Set(stocks.map((s: Stock) => s.id)));
        }
      } catch (error) {
        console.error('Error loading existing watchlist:', error);
      }
    };

    if (accessToken) {
      loadExistingWatchlist();
    }
  }, [accessToken]);

  // Search stocks with pagination
  useEffect(() => {
    const searchStocks = async () => {
      if (!accessToken) return;
      
      setSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedMarket !== 'ALL') params.append('market', selectedMarket);
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());

        const response = await fetch(`/api/watchlist/stocks?${params}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvailableStocks(data.data);
          setTotalStocks(data.total || 0);
          setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        } else {
          throw new Error('\uc8fc\uc2dd \uac80\uc0c9\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.');
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
  }, [searchTerm, selectedMarket, currentPage, accessToken]);

  const handleToggleStock = (stock: Stock) => {
    const newSelectedIds = new Set(selectedIds);
    
    if (newSelectedIds.has(stock.id)) {
      // Remove stock
      newSelectedIds.delete(stock.id);
      setSelectedStocks(selectedStocks.filter(s => s.id !== stock.id));
      toast.success(`${stock.name} 제거됨`);
    } else {
      // Add stock
      if (selectedStocks.length >= 10) {
        toast.error('최대 10개까지만 선택할 수 있습니다');
        return;
      }
      newSelectedIds.add(stock.id);
      setSelectedStocks([...selectedStocks, stock]);
      toast.success(`${stock.name} 추가됨`);
    }
    
    setSelectedIds(newSelectedIds);
  };

  const handlePresetSelect = async (preset: PresetTemplate) => {
    if (!canChange) {
      toast.error('하루에 한 번만 관심종목을 변경할 수 있습니다');
      return;
    }

    setLoading(true);
    try {
      const stocks = await preset.action();
      setSelectedStocks(stocks.slice(0, 10));
      setSelectedIds(new Set(stocks.slice(0, 10).map(s => s.id)));
      toast.success(`${preset.name} 종목이 선택되었습니다`);
    } catch (error) {
      console.error('Error loading preset:', error);
      toast.error('프리셋 종목을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
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
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          stockIds: selectedStocks.map(s => s.id)
        })
      });

      if (response.ok) {
        toast.success('관심종목이 저장되었습니다!');
        toast('💡 중요 안내: 관심종목 선정 후 24시간이 지나야 거래가 가능합니다. 이 시간 동안 선택한 종목들을 충분히 조사해보세요!', {
          duration: 8000,
          icon: '📅'
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '관심종목 저장에 실패했습니다');
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">관심종목 선택</h1>
        <p className="text-gray-600 mb-2">
          거래를 시작하기 전에 관심있는 종목을 최대 10개까지 선택해주세요.
          선택한 종목들의 가격이 실시간으로 업데이트됩니다.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-blue-900">중요 안내</p>
              <p className="text-blue-800 text-sm mt-1">
                관심종목 선정 후 <span className="font-bold">24시간이 지나야 거래가 가능</span>합니다.
                이 시간 동안 선택한 종목들에 대해 충분히 조사하고 투자 전략을 세워보세요!
              </p>
              <p className="text-blue-700 text-xs mt-2">
                ※ 관심종목은 하루에 한 번만 변경 가능합니다.
              </p>
            </div>
          </div>
        </div>
        {!canChange && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800">
              오늘 이미 관심종목을 변경하셨습니다. 내일 다시 변경할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* Preset Templates */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 시작</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {presetTemplates.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              disabled={loading || !canChange}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  {preset.icon}
                </div>
                <h3 className="font-medium text-gray-900">{preset.name}</h3>
                <p className="text-xs text-gray-500 text-center">{preset.description}</p>
              </div>
            </button>
          ))}
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stock Search - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">종목 검색</h2>
          
          {/* Search Controls */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="종목명 또는 심볼 검색..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedMarket}
              onChange={(e) => {
                setSelectedMarket(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">전체 시장</option>
              <option value="KOSPI">KOSPI</option>
              <option value="KOSDAQ">KOSDAQ</option>
              <option value="KOSDAQ GLOBAL">KOSDAQ GLOBAL</option>
              <option value="KONEX">KONEX</option>
            </select>
          </div>

          {/* Stock List with Checkboxes */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {searching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">검색 중...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선택</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">종목명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시장</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">현재가</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">변동률</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {availableStocks.map((stock) => (
                        <tr key={stock.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(stock.id)}
                              onChange={() => handleToggleStock(stock)}
                              disabled={!selectedIds.has(stock.id) && selectedStocks.length >= 10}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                              <div className="text-sm text-gray-500">{stock.symbol}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {stock.market}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium">
                            {formatPrice(stock.currentPrice)}원
                          </td>
                          <td className="px-6 py-4 text-sm text-right">
                            <div className={`flex items-center justify-end ${
                              stock.change >= 0 ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {formatChangePercent(stock.changePercent)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      {totalStocks > 0 && (
                        <span>
                          {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalStocks)} / 총 {totalStocks}개
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Selected Watchlist - 1/3 width */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">선택된 관심종목</h2>
            <span className="text-sm text-gray-500">{selectedStocks.length}/10</span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedStocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  관심종목을 선택해주세요
                </div>
              ) : (
                selectedStocks.map((stock, index) => (
                  <div key={stock.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stock.name}</div>
                        <div className="text-xs text-gray-500">{stock.symbol}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStock(stock)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveWatchlist}
              disabled={loading || selectedStocks.length === 0 || !canChange}
              className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '저장 중...' : '관심종목 저장하고 시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistSetupPage;