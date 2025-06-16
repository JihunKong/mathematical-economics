import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import { formatNumber, formatDate } from '../utils/format';
import { MagnifyingGlassIcon, FunnelIcon, ArrowUpIcon, ArrowDownIcon, ChartBarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface Stock {
  symbol: string;
  name: string;
  market: string;
  sector: string | null;
  isAdded: boolean;
  isTracked: boolean;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  updatedAt: string;
  volume?: number;
}

const SECTORS = [
  '전체',
  '전기전자',
  '화학',
  '의약품',
  '자동차',
  '금융업',
  '서비스업',
  '기계',
  '철강금속',
  '건설업',
  '유통업',
  '운수창고업',
  '통신업',
  '전기가스업',
  '음식료품',
  '섬유의복',
  '종이목재',
  '비금속광물',
  '기타'
];

const MARKETS = ['전체', 'KOSPI', 'KOSDAQ'];

export default function StockManagementEnhanced() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('전체');
  const [selectedMarket, setSelectedMarket] = useState('전체');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'volume'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'tracked' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 50;

  useEffect(() => {
    if (viewMode === 'tracked') {
      fetchTrackedStocks();
    } else {
      fetchAllStocks();
    }
  }, [viewMode]);

  const fetchTrackedStocks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stock-management/tracked');
      setStocks(response.data.data || []);
    } catch (error) {
      toast.error('추적 중인 종목을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllStocks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/stock-management/search', {
        params: { 
          query: searchQuery,
          limit: 3000
        }
      });
      
      const trackedResponse = await api.get('/stock-management/tracked');
      const trackedMap = new Map<string, Stock>(
        trackedResponse.data.data.map((stock: Stock) => [stock.symbol, stock])
      );
      
      const mergedStocks = response.data.data.map((stock: any) => {
        const trackedStock = trackedMap.get(stock.symbol);
        return {
          ...stock,
          currentPrice: trackedStock?.currentPrice || stock.currentPrice || 0,
          previousClose: trackedStock?.previousClose || stock.previousClose || 0,
          change: trackedStock?.change || stock.change || 0,
          changePercent: trackedStock?.changePercent || stock.changePercent || 0,
          updatedAt: trackedStock?.updatedAt || stock.updatedAt || new Date().toISOString(),
          volume: trackedStock?.volume || stock.volume || 0
        };
      });
      
      setStocks(mergedStocks);
      setCurrentPage(1);
    } catch (error) {
      toast.error('주식 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAllStocks();
  };

  const toggleTracking = async (stock: Stock) => {
    try {
      if (!stock.isAdded) {
        await api.post('/stock-management/add', { symbol: stock.symbol });
      }
      
      await api.patch(`/stock-management/${stock.symbol}/tracking`, {
        isTracked: !stock.isTracked
      });
      
      toast.success(stock.isTracked ? '추적이 중지되었습니다.' : '추적이 시작되었습니다.');
      
      if (viewMode === 'tracked') {
        fetchTrackedStocks();
      } else {
        fetchAllStocks();
      }
    } catch (error) {
      toast.error('작업에 실패했습니다.');
    }
  };

  // 필터링된 주식 목록
  const filteredStocks = stocks.filter(stock => {
    if (selectedMarket !== '전체' && stock.market !== selectedMarket) return false;
    if (selectedSector !== '전체' && stock.sector !== selectedSector) return false;
    return true;
  });

  // 정렬된 주식 목록
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'price':
        compareValue = (a.currentPrice || 0) - (b.currentPrice || 0);
        break;
      case 'change':
        compareValue = (a.changePercent || 0) - (b.changePercent || 0);
        break;
      case 'volume':
        compareValue = (a.volume || 0) - (b.volume || 0);
        break;
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // 페이지네이션
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);
  const paginatedStocks = sortedStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // 섹터별 통계
  const sectorStats = stocks.reduce((acc, stock) => {
    const sector = stock.sector || '기타';
    if (!acc[sector]) {
      acc[sector] = { count: 0, tracked: 0 };
    }
    acc[sector].count++;
    if (stock.isTracked) acc[sector].tracked++;
    return acc;
  }, {} as Record<string, { count: number; tracked: number }>);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">주식 종목 관리</h1>
        <p className="text-gray-600">전체 {stocks.length.toLocaleString()}개 종목 중 {stocks.filter(s => s.isTracked).length}개 추적 중</p>
      </div>

      {/* 검색 및 필터 영역 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="종목명, 종목코드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              검색
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline'}`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              필터
            </button>
          </div>
        </form>

        {/* 필터 옵션 */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시장</label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MARKETS.map(market => (
                  <option key={market} value={market}>{market}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">섹터</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SECTORS.map(sector => (
                  <option key={sector} value={sector}>
                    {sector} {sectorStats[sector] && `(${sectorStats[sector].count}개)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">보기 모드</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('all')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setViewMode('tracked')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'tracked' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  추적 중
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 섹터별 요약 (선택사항) */}
      {showFilters && selectedSector === '전체' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {Object.entries(sectorStats)
            .filter(([sector]) => sector !== '기타')
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 12)
            .map(([sector, stats]) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className="bg-white rounded-lg p-3 text-left hover:shadow-md transition-shadow"
              >
                <div className="text-sm font-medium text-gray-900">{sector}</div>
                <div className="text-xs text-gray-500">
                  {stats.count}개 ({stats.tracked}개 추적)
                </div>
              </button>
            ))}
        </div>
      )}

      {/* 주식 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  종목명
                  {sortBy === 'name' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="ml-1 h-3 w-3" /> : <ArrowDownIcon className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                정보
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end">
                  현재가
                  {sortBy === 'price' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="ml-1 h-3 w-3" /> : <ArrowDownIcon className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('change')}
              >
                <div className="flex items-center justify-end">
                  전일대비
                  {sortBy === 'change' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="ml-1 h-3 w-3" /> : <ArrowDownIcon className="ml-1 h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('volume')}
              >
                <div className="flex items-center justify-end">
                  거래량
                  {sortBy === 'volume' && (
                    sortOrder === 'asc' ? <ArrowUpIcon className="ml-1 h-3 w-3" /> : <ArrowDownIcon className="ml-1 h-3 w-3" />
                  )}
                </div>
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
            {paginatedStocks.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{stock.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="font-mono">{stock.symbol}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      stock.market === 'KOSPI' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {stock.market}
                    </span>
                    {stock.sector && (
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        {stock.sector}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {stock.currentPrice > 0 ? (
                    <div className="font-medium text-gray-900">
                      ₩{formatNumber(stock.currentPrice)}
                    </div>
                  ) : (
                    <div className="text-gray-400">-</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {stock.currentPrice > 0 && (
                    <div className={`font-medium ${
                      stock.changePercent > 0 ? 'text-red-600' : 
                      stock.changePercent < 0 ? 'text-blue-600' : 
                      'text-gray-900'
                    }`}>
                      {stock.changePercent > 0 && '+'}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {stock.volume ? (
                    <div className="text-sm text-gray-900">
                      {formatNumber(stock.volume)}
                    </div>
                  ) : (
                    <div className="text-gray-400">-</div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {stock.isTracked ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-gray-300 mx-auto" />
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleTracking(stock)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      stock.isTracked
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {stock.isTracked ? '추적 중지' : '추적 시작'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            총 {filteredStocks.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredStocks.length)}개 표시
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}