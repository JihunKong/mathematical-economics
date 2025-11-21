import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateCash } from '@/store/portfolioSlice';
import { useStockPrices } from '@/hooks/useStockPrices';
import api from '@/services/api';
import stockService, { StockPrice } from '@/services/stockService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, TrendingUp, TrendingDown, Info, RefreshCw, Activity } from 'lucide-react';
import clsx from 'clsx'에러가 발생했습니다''에러가 발생했습니다'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(''에러가 발생했습니다'all' | 'KOSPI' | 'KOSDAQ'>('all'에러가 발생했습니다'all'에러가 발생했습니다'ADMIN'에러가 발생했습니다'STUDENT' 
        ? api.get('/watchlist'에러가 발생했습니다's a watchlist requirement error (403)
      if (error?.response?.status === 403 && error?.response?.data?.code === 'WATCHLIST_REQUIRED') {
        setNeedsWatchlist(true);
      } else if (error?.response?.data?.message?.includes('24시간')) {
        toast.error(error.response.data.message);
        toast.info('💡 관심종목 선정 후 24시간이 지나야 거래가 가능합니다. 이 시간 동안 종목에 대해 충분히 조사해보세요!', {
          duration: 6000
        });
      } else {
        toast.error('데이터를 불러오는데 실패했습니다'에러가 발생했습니다'올바른 수량을 입력해주세요');
      return;
    }

    if (!reason.trim()) {
      toast.error('투자 판단 근거를 입력해주세요'에러가 발생했습니다'현재 가격 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'에러가 발생했습니다'accessToken');
      const endpoint = tradeMode === 'buy' ? '/api/trading/buy' : '/api/trading/sell';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization'에러가 발생했습니다'500px',
              whiteSpace: 'pre-line'에러가 발생했습니다'buy') {
        toast.success('매수 주문이 완료되었습니다');
      } else {
        toast.success('매도 주문이 완료되었습니다');
      }
      
      setShowTradeModal(false);
      setQuantity('');
      setReason(''에러가 발생했습니다'object'에러가 발생했습니다'500px',
              whiteSpace: 'pre-line'
            }
          });
        } else {
          toast.error('거래 권한이 없습니다. 관심종목을 먼저 설정해주세요.'에러가 발생했습니다'500px',
              whiteSpace: 'pre-line'
            }
          });
        } else {
          toast.error('가격 정보가 오래되어 거래할 수 없습니다.'에러가 발생했습니다'거래 처리 중 오류가 발생했습니다.'에러가 발생했습니다'TEACHER' && user?.role !== 'ADMIN') {
      toast.error('교사 또는 관리자만 가격을 업데이트할 수 있습니다');
      return;
    }
    
    setRefreshing(true);
    try {
      await api.post('/real-stocks/update-all-prices');
      toast.success('주식 가격이 업데이트되었습니다');
      fetchData();
    } catch (error) {
            toast.error('가격 업데이트에 실패했습니다'에러가 발생했습니다'ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  
  useEffect(() => {
    if (needsWatchlist && user?.role === 'STUDENT') {
      navigate('/watchlist-setup'에러가 발생했습니다'STUDENT' && '관심종목 선정 후 처음 접속하시면 데이터 준비에 시간이 걸릴 수 있습니다.'에러가 발생했습니다'STUDENT'에러가 발생했습니다'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                autoRefresh ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              title={autoRefresh ? '자동 새로고침 켜짐' : '자동 새로고침 꺼짐'에러가 발생했습니다'flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors',
                refreshing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin'에러가 발생했습니다'TEACHER' || user?.role === 'ADMIN'에러가 발생했습니다'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
                  refreshing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
                {refreshing ? '업데이트 중...' : '실시간 가격 업데이트'에러가 발생했습니다'all')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === 'all' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'에러가 발생했습니다'KOSPI')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === 'KOSPI' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'에러가 발생했습니다'KOSDAQ')}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                selectedMarket === 'KOSDAQ' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'에러가 발생했습니다'ko-KR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit', 
                                  second: '2-digit'에러가 발생했습니다'flex items-center text-sm font-medium',
                        changePercent >= 0 ? 'text-red-600' : 'text-blue-600'에러가 발생했습니다'+' : ''에러가 발생했습니다'현재 가격 정보가 없습니다. 잠시 후 다시 시도해주세요.'에러가 발생했습니다'buy'에러가 발생했습니다'현재 가격 정보가 없습니다. 잠시 후 다시 시도해주세요.'에러가 발생했습니다'sell'에러가 발생했습니다'buy' ? '매수' : '매도'에러가 발생했습니다'sell'에러가 발생했습니다'sell'에러가 발생했습니다'buy' ? '매수' : '매도'에러가 발생했습니다'');
                  setReason(''에러가 발생했습니다'btn flex-1',
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