import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'에러가 발생했습니다'lucide-react';
import { useAppSelector } from '../hooks/useRedux'에러가 발생했습니다'');
  const [selectedMarket, setSelectedMarket] = useState('ALL'에러가 발생했습니다'top10',
      name: 'TOP 10 종목',
      description: '시가총액 상위 10개 종목'에러가 발생했습니다'/api/watchlist/presets/top10', {
          headers: { 'Authorization'에러가 발생했습니다'random',
      name: '랜덤 종목',
      description: '무작위로 선택된 10개 종목'에러가 발생했습니다'/api/watchlist/presets/random', {
          headers: { 'Authorization'에러가 발생했습니다'kospi',
      name: 'KOSPI 대표',
      description: 'KOSPI 대표 종목 10개'에러가 발생했습니다'/api/watchlist/presets/kospi-leaders', {
          headers: { 'Authorization'에러가 발생했습니다'kosdaq',
      name: 'KOSDAQ 유망주',
      description: 'KOSDAQ 성장 유망 종목'에러가 발생했습니다'/api/watchlist/presets/kosdaq-promising', {
          headers: { 'Authorization'에러가 발생했습니다'/api/watchlist/can-change', {
          headers: {
            'Authorization'에러가 발생했습니다'/api/watchlist/stats', {
          headers: {
            'Authorization'에러가 발생했습니다'/api/watchlist', {
          headers: {
            'Authorization'에러가 발생했습니다'search', searchTerm);
        if (selectedMarket !== 'ALL') params.append('market', selectedMarket);
        params.append('page', currentPage.toString());
        params.append('limit'에러가 발생했습니다'Authorization'에러가 발생했습니다'\uc8fc\uc2dd \uac80\uc0c9\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.');
        }
      } catch (error) {
                toast.error('주식 검색에 실패했습니다'에러가 발생했습니다'최대 10개까지만 선택할 수 있습니다'에러가 발생했습니다'하루에 한 번만 관심종목을 변경할 수 있습니다'에러가 발생했습니다'프리셋 종목을 불러오는데 실패했습니다'에러가 발생했습니다'최소 1개 종목을 선택해주세요');
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
          'Authorization'에러가 발생했습니다'관심종목이 저장되었습니다!');
        toast.info('💡 중요 안내: 관심종목 선정 후 24시간이 지나야 거래가 가능합니다. 이 시간 동안 선택한 종목들을 충분히 조사해보세요!', {
          duration: 8000,
          icon: '📅'
        });
        setTimeout(() => {
          navigate('/dashboard'에러가 발생했습니다'관심종목 저장에 실패했습니다');
      }
    } catch (error: any) {
            toast.error(error.message || '관심종목 저장에 실패했습니다'에러가 발생했습니다'ko-KR'에러가 발생했습니다'+' : ''}${percent.toFixed(2)}%`;
  };

  // 학생이 아닌 경우 대시보드로 리다이렉트
  if (user?.role !== 'STUDENT') {
    navigate('/dashboard'에러가 발생했습니다'text-red-600' : 'text-blue-600'에러가 발생했습니다'저장 중...' : '관심종목 저장하고 시작하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistSetupPage;