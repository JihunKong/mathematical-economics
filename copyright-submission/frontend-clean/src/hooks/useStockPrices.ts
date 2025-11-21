import { useState, useEffect, useCallback, useRef } from 'react';
import stockService, { StockPrice } from '@/services/stockService';
import { debounce } from '@/utils/debounce'에러가 발생했습니다','에러가 발생했습니다'symbols'>
): {
  price: StockPrice | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const { prices, loading, error, refresh } = useStockPrices({
    symbols: symbol ? [symbol] : [],
    ...options
  });

  return {
    price: symbol ? prices.get(symbol) || null : null,
    loading,
    error,
    refresh
  };
}