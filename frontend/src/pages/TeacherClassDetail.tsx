import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import UpdateCashModal from '@/components/teacher/UpdateCashModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { DollarSign } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatters';

interface Student {
  id: string;
  name: string;
  email: string;
  currentCash: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdingsCount: number;
}

interface AllowedStock {
  id: string;
  stock: {
    id: string;
    symbol: string;
    name: string;
    currentPrice: number;
  };
}

interface ClassDetail {
  id: string;
  name: string;
  code: string;
  students: Student[];
  allowedStocks: AllowedStock[];
}

interface AvailableStock {
  id: string;
  symbol: string;
  name: string;
  market: string;
  sector?: string;
  currentPrice: number;
}

export default function TeacherClassDetail() {
  const { classId } = useParams<{ classId: string }>();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [availableStocks, setAvailableStocks] = useState<AvailableStock[]>([]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'students' | 'stocks' | 'stats'>('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCashModal, setShowCashModal] = useState(false);
  
  // Stock modal search states
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [stockModalPage, setStockModalPage] = useState(1);
  const [selectedMarket, setSelectedMarket] = useState<'all' | 'KOSPI' | 'KOSDAQ'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const stocksPerPage = 50;
  
  const SECTORS = [
    '전기전자', '화학', '의약품', '자동차', '금융업', '서비스업', 
    '기계', '철강금속', '건설업', '유통업', '운수창고업', '통신업',
    '전기가스업', '음식료품', '섬유의복', '종이목재', '비금속광물', '기타'
  ];

  useEffect(() => {
    if (classId) {
      fetchClassData();
      fetchStatistics();
    }
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const response = await api.get(`/teacher/classes/${classId}`);
      setClassData(response.data.data);
      setSelectedStocks(response.data.data.allowedStocks.map((as: AllowedStock) => as.stock.id));
    } catch (error) {
      toast.error('클래스 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get(`/teacher/classes/${classId}/statistics`);
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchAvailableStocks = async (searchQuery: string = '') => {
    try {
      setIsLoadingStocks(true);
      const response = await api.get('/stock-management/search', {
        params: { 
          query: searchQuery,
          limit: 3000
        }
      });
      setAvailableStocks(response.data.data || []);
      setStockModalPage(1); // Reset to first page on new search
    } catch (error) {
      toast.error('주식 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const updateAllowedStocks = async () => {
    try {
      await api.put(`/teacher/classes/${classId}/stocks`, { stockIds: selectedStocks });
      toast.success('허용 종목이 업데이트되었습니다.');
      setShowStockModal(false);
      fetchClassData();
    } catch (error) {
      toast.error('종목 업데이트에 실패했습니다.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  if (!classData) {
    return <div>클래스를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/teacher" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← 대시보드로 돌아가기
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
            <p className="text-gray-600">클래스 코드: <span className="font-mono font-bold">{classData.code}</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('students')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'students'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            학생 목록
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'stocks'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            허용 종목
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={clsx(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            통계
          </button>
        </nav>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보유 현금
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수익률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보유 종목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classData.students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(student.currentCash)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(student.totalValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'text-sm font-medium',
                      student.totalProfitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {formatPercent(student.totalProfitLossPercent)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.holdingsCount}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowCashModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="현금 설정"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/teacher/student/${student.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        상세보기
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stocks Tab */}
      {activeTab === 'stocks' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">허용된 종목</h3>
            <button
              onClick={() => {
                setShowStockModal(true);
                setStockSearchQuery('');
                setSelectedMarket('all');
                setSelectedSector('all');
                setStockModalPage(1);
                fetchAvailableStocks('');
              }}
              className="btn btn-primary btn-sm"
            >
              종목 관리
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classData.allowedStocks.map((allowedStock) => (
              <div key={allowedStock.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{allowedStock.stock.name}</h4>
                    <p className="text-sm text-gray-500">{allowedStock.stock.symbol}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(allowedStock.stock.currentPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">전체 학생 수</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}명</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">활동 학생 수</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.activeStudents}명</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">평균 수익률</h3>
            <p className={clsx(
              'text-2xl font-bold',
              statistics.avgReturn >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatPercent(statistics.avgReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">최고 수익률</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatPercent(statistics.bestReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">최저 수익률</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatPercent(statistics.worstReturn)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">인기 종목</h3>
            <div className="space-y-1">
              {statistics.mostTradedStocks.map((stock: any, index: number) => (
                <p key={index} className="text-sm text-gray-900">
                  {stock.name} ({stock.tradeCount}회)
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stock Selection Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">허용 종목 관리</h2>
              <p className="text-sm text-gray-600 mt-1">학생들이 거래할 수 있는 종목을 선택하세요 (최대 50개)</p>
            </div>
            
            {/* Search Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <form onSubmit={(e) => {
                e.preventDefault();
                fetchAvailableStocks(stockSearchQuery);
              }} className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="종목명 또는 종목코드로 검색..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoadingStocks}
                >
                  검색
                </button>
              </form>
              
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value as any)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">전체 시장</option>
                    <option value="KOSPI">KOSPI</option>
                    <option value="KOSDAQ">KOSDAQ</option>
                  </select>
                  
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">전체 섹터</option>
                    {SECTORS.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className={clsx(
                    "text-sm",
                    selectedStocks.length >= 50 ? "text-red-600 font-medium" :
                    selectedStocks.length >= 40 ? "text-orange-600" :
                    "text-gray-600"
                  )}>
                    {(() => {
                      const filteredCount = availableStocks.filter(stock => 
                        (selectedMarket === 'all' || stock.market === selectedMarket) &&
                        (selectedSector === 'all' || stock.sector === selectedSector)
                      ).length;
                      return `검색된 ${filteredCount}개 종목 중 ${selectedStocks.length}/50개 선택됨`;
                    })()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const filteredIds = availableStocks
                          .filter(stock => 
                            (selectedMarket === 'all' || stock.market === selectedMarket) &&
                            (selectedSector === 'all' || stock.sector === selectedSector)
                          )
                          .map(s => s.id);
                        
                        // Calculate how many can be added before hitting 50 limit
                        const currentCount = selectedStocks.length;
                        const availableSlots = 50 - currentCount;
                        
                        if (availableSlots <= 0) {
                          toast.error('이미 최대 50개 종목을 선택했습니다.');
                          return;
                        }
                        
                        // Only add stocks that aren't already selected, up to the limit
                        const newStocks = filteredIds.filter(id => !selectedStocks.includes(id));
                        const stocksToAdd = newStocks.slice(0, availableSlots);
                        
                        if (stocksToAdd.length < newStocks.length) {
                          toast(`50개 제한으로 인해 ${stocksToAdd.length}개만 추가되었습니다.`, {
                            icon: '⚠️',
                          });
                        }
                        
                        setSelectedStocks(prev => [...prev, ...stocksToAdd]);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      현재 필터 전체 선택
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={() => setSelectedStocks([])}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      전체 해제
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stock List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoadingStocks ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  {/* Filtered and paginated stocks */}
                  {(() => {
                    // Apply filters
                    const filteredStocks = availableStocks.filter(stock => 
                      (selectedMarket === 'all' || stock.market === selectedMarket) &&
                      (selectedSector === 'all' || stock.sector === selectedSector)
                    );
                    
                    const startIndex = (stockModalPage - 1) * stocksPerPage;
                    const endIndex = stockModalPage * stocksPerPage;
                    const paginatedStocks = filteredStocks.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(filteredStocks.length / stocksPerPage);
                    
                    return (
                      <>
                        {filteredStocks.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-500">검색 조건에 맞는 종목이 없습니다.</p>
                            <button
                              onClick={() => {
                                setStockSearchQuery('');
                                setSelectedMarket('all');
                                setSelectedSector('all');
                                fetchAvailableStocks('');
                              }}
                              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                            >
                              필터 초기화
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {paginatedStocks.map((stock) => {
                              // 디버깅용 로그
                              // console.log('Stock:', stock.name, 'ID:', stock.id);
                              
                              return (
                                <div key={stock.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                                  <input
                                    type="checkbox"
                                    id={`stock-${stock.id}`}
                                    checked={selectedStocks.includes(stock.id)}
                                    disabled={selectedStocks.length >= 50 && !selectedStocks.includes(stock.id)}
                                    onChange={(e) => {
                                      // console.log('Checkbox clicked for:', stock.name, 'ID:', stock.id, 'Checked:', e.target.checked);
                                      
                                      if (e.target.checked) {
                                        // Check if already at 50 items limit
                                        if (selectedStocks.length >= 50) {
                                          toast.error('최대 50개 종목까지만 선택할 수 있습니다.');
                                          e.preventDefault();
                                          return;
                                        }
                                        setSelectedStocks(prev => [...prev, stock.id]);
                                      } else {
                                        setSelectedStocks(prev => prev.filter(id => id !== stock.id));
                                      }
                                    }}
                                    className={clsx(
                                      "h-4 w-4 text-primary-600 rounded focus:ring-primary-500",
                                      selectedStocks.length >= 50 && !selectedStocks.includes(stock.id) 
                                        ? "cursor-not-allowed opacity-50" 
                                        : "cursor-pointer"
                                    )}
                                  />
                              <label 
                                htmlFor={`stock-${stock.id}`}
                                className="flex-1 grid grid-cols-3 gap-4 cursor-pointer"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">{stock.name}</span>
                                  <span className="text-gray-500 text-sm ml-2">({stock.symbol})</span>
                                </div>
                                <div className="text-center">
                                  <span className={clsx(
                                    'inline-flex px-2 py-1 text-xs font-medium rounded',
                                    stock.market === 'KOSPI' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                  )}>
                                    {stock.market}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium text-gray-900">{formatCurrency(stock.currentPrice || 0)}</span>
                                </div>
                              </label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                              onClick={() => setStockModalPage(Math.max(1, stockModalPage - 1))}
                              disabled={stockModalPage === 1}
                              className="px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              이전
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                              {stockModalPage} / {totalPages}
                            </span>
                            <button
                              onClick={() => setStockModalPage(Math.min(totalPages, stockModalPage + 1))}
                              disabled={stockModalPage === totalPages}
                              className="px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              다음
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setStockSearchQuery('');
                  setStockModalPage(1);
                }}
                className="btn btn-ghost"
              >
                취소
              </button>
              <button
                onClick={updateAllowedStocks}
                className="btn btn-primary"
                disabled={isLoadingStocks}
              >
                저장 ({selectedStocks.length}개)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Cash Modal */}
      {selectedStudent && (
        <UpdateCashModal
          isOpen={showCashModal}
          onClose={() => {
            setShowCashModal(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={fetchClassData}
        />
      )}
    </div>
  );
}