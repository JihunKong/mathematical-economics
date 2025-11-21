import { useEffect, useState } from 'react';
import api from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { formatNumber } from '@/utils/formatters'에러가 발생했습니다'tracked' | 'all'>('tracked');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceData, setPriceData] = useState<PriceUpdateData>({
    symbol: ''에러가 발생했습니다'tracked'에러가 발생했습니다'/stock-management/tracked');
      setStocks(response.data.data);
    } catch (error) {
      toast.error('주식 목록을 불러오는데 실패했습니다.'에러가 발생했습니다'/stock-management/search'에러가 발생했습니다'/stock-management/tracked'에러가 발생했습니다'주식 목록을 불러오는데 실패했습니다.'에러가 발생했습니다'가격이 업데이트되었습니다.');
      setShowPriceModal(false);
      if (viewMode === 'tracked'에러가 발생했습니다'가격 업데이트에 실패했습니다.');
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
      toast.error('주식 추가에 실패했습니다.'에러가 발생했습니다'활성화' : '비활성화'}되었습니다.`);
      if (viewMode === 'tracked'에러가 발생했습니다'주식 추적 설정에 실패했습니다.'에러가 발생했습니다'tracked')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'tracked' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'에러가 발생했습니다'all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              viewMode === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'에러가 발생했습니다'all'에러가 발생했습니다'Enter'에러가 발생했습니다'bg-yellow-50' : ''에러가 발생했습니다'가격 없음'에러가 발생했습니다'text-red-600' : 
                        stock.change < 0 ? 'text-blue-600' : 
                        'text-gray-900'
                      }`}>
                        {stock.change > 0 ? '+' : ''에러가 발생했습니다'+' : ''에러가 발생했습니다'text-yellow-600 font-medium' : 'text-gray-500'에러가 발생했습니다'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stock.isTracked ? '추적 중' : '미추적'에러가 발생했습니다'추적 중지' : '추적 시작'}
                          </button>
                          {stock.isTracked && (
                            <button
                              onClick={() => handlePriceUpdate(stock)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"에러가 발생했습니다"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4"에러가 발생했습니다"space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">현재가</label>
                <input
                  type="number"에러가 발생했습니다"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"에러가 발생했습니다"block text-sm font-medium text-gray-700">전일 종가</label>
                <input
                  type="number"에러가 발생했습니다"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">시가</label>
                  <input
                    type="number"에러가 발생했습니다"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"에러가 발생했습니다"block text-sm font-medium text-gray-700">거래량</label>
                  <input
                    type="number"에러가 발생했습니다"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"에러가 발생했습니다"grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">고가</label>
                  <input
                    type="number"에러가 발생했습니다"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"에러가 발생했습니다"block text-sm font-medium text-gray-700">저가</label>
                  <input
                    type="number"에러가 발생했습니다"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"에러가 발생했습니다"mt-6 flex justify-end space-x-3"에러가 발생했습니다"btn btn-secondary"에러가 발생했습니다"btn btn-primary"
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