import { useState, useEffect, useCallback, useRef } from 'react';
import stockService, { StockPrice } from '@/services/stockService';
import { debounce } from '@/utils/debounce';

interface UseStockPricesOptions {
  symbols: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
}

interface UseStockPricesResult {
  prices: Map<string, StockPrice>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStockPrices({
  symbols,
  autoRefresh = false,
  refreshInterval = 30000,
  onError
}: UseStockPricesOptions): UseStockPricesResult {
  const [prices, setPrices] = useState<Map<string, StockPrice>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Debounced refresh function to prevent rapid successive calls
  const debouncedRefresh = useRef(
    debounce(async (symbolsToFetch: string[]) => {
      if (!isMountedRef.current) return;
      
      try {
        setLoading(true);
        setError(null);

        const fetchedPrices = await stockService.getBatchPrices(symbolsToFetch);
        
        if (!isMountedRef.current) return;

        const newPrices = new Map(prices);
        fetchedPrices.forEach(price => {
          newPrices.set(price.symbol, price);
        });
        setPrices(newPrices);
      } catch (err) {
        if (!isMountedRef.current) return;
        
        const error = err as Error;
        setError(error);
        if (onError) {
          onError(error);
        }
        console.error('Failed to fetch stock prices:', error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }, 300)
  ).current;

  const refresh = useCallback(async () => {
    if (symbols.length === 0) return;
    debouncedRefresh(symbols);
  }, [symbols, debouncedRefresh]);

  // Initial fetch and when symbols change
  useEffect(() => {
    refresh();
  }, [symbols.join(',')]); // Only refresh when symbols actually change

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || symbols.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    prices,
    loading,
    error,
    refresh
  };
}

// Hook for single stock price
export function useStockPrice(
  symbol: string, 
  options?: Omit<UseStockPricesOptions, 'symbols'>
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