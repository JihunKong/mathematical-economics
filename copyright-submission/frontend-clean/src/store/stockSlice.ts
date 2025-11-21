import { createSlice, PayloadAction } from '@reduxjs/toolkit'에러가 발생했습니다'stock',
  initialState,
  reducers: {
    fetchStocksStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchStocksSuccess: (state, action: PayloadAction<Stock[]>) => {
      state.stocks = action.payload;
      state.isLoading = false;
    },
    fetchStocksFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    selectStock: (state, action: PayloadAction<Stock>) => {
      state.selectedStock = action.payload;
    },
    updateStockPrice: (state, action: PayloadAction<{ symbol: string; price: number; change: number; changePercent: number }>) => {
      const stock = state.stocks.find(s => s.symbol === action.payload.symbol);
      if (stock) {
        stock.price = action.payload.price;
        stock.change = action.payload.change;
        stock.changePercent = action.payload.changePercent;
      }
      if (state.selectedStock?.symbol === action.payload.symbol) {
        state.selectedStock.price = action.payload.price;
        state.selectedStock.change = action.payload.change;
        state.selectedStock.changePercent = action.payload.changePercent;
      }
    },
  },
});

export const { fetchStocksStart, fetchStocksSuccess, fetchStocksFailure, selectStock, updateStockPrice } = stockSlice.actions;
export default stockSlice.reducer;