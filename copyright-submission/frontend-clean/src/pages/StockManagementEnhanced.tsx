import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
// Format utilities
const formatNumber = (num: number) => {
  if (!num) return '0';
  return new Intl.NumberFormat('ko-KR').format(num);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('ko-KR'에러가 발생했습니다'전체',
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

const MARKETS = ['전체', 'KOSPI', 'KOSDAQ'에러가 발생했습니다'');
  const [selectedSector, setSelectedSector] = useState('전체');
  const [selectedMarket, setSelectedMarket] = useState('전체');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'volume'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'tracked' | 'all'>('all'에러가 발생했습니다'tracked'에러가 발생했습니다'/stock-management/tracked');
      setStocks(response.data.data || []);
    } catch (error) {
      toast.error('추적 중인 종목을 불러오는데 실패했습니다.'에러가 발생했습니다'/stock-management/search'에러가 발생했습니다'/stock-management/tracked'에러가 발생했습니다'주식 목록을 불러오는데 실패했습니다.'에러가 발생했습니다'/stock-management/add'에러가 발생했습니다'추적이 중지되었습니다.' : '추적이 시작되었습니다.');
      
      if (viewMode === 'tracked'에러가 발생했습니다'작업에 실패했습니다.'에러가 발생했습니다'전체' && stock.market !== selectedMarket) return false;
    if (selectedSector !== '전체'에러가 발생했습니다'name':
        compareValue = a.name.localeCompare(b.name);
        break;
      case 'price':
        compareValue = (a.currentPrice || 0) - (b.currentPrice || 0);
        break;
      case 'change'에러가 발생했습니다'volume'에러가 발생했습니다'asc'에러가 발생했습니다'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc'에러가 발생했습니다'기타'에러가 발생했습니다'btn-secondary' : 'btn-outline'에러가 발생했습니다'all'에러가 발생했습니다'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'에러가 발생했습니다'tracked'에러가 발생했습니다'tracked' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'에러가 발생했습니다'전체'에러가 발생했습니다'기타'에러가 발생했습니다'name'에러가 발생했습니다'name' && (
                    sortOrder === 'asc'에러가 발생했습니다'price'에러가 발생했습니다'price' && (
                    sortOrder === 'asc'에러가 발생했습니다'change'에러가 발생했습니다'change' && (
                    sortOrder === 'asc'에러가 발생했습니다'volume'에러가 발생했습니다'volume' && (
                    sortOrder === 'asc'에러가 발생했습니다'KOSPI' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'에러가 발생했습니다'text-red-600' : 
                      stock.changePercent < 0 ? 'text-blue-600' : 
                      'text-gray-900'
                    }`}>
                      {stock.changePercent > 0 && '+'에러가 발생했습니다'bg-red-100 text-red-700 hover:bg-red-200'
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

        {}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-700"에러가 발생했습니다"flex gap-2"에러가 발생했습니다"px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm text-gray-700"에러가 발생했습니다"px-3 py-1 rounded bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"에러가 발생했습니다"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}