import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface PortfolioState {
  cash: number;
  totalValue: number;
  holdings: Holding[];
  dailyChange: number;
  dailyChangePercent: number;
  isLoading: boolean;
}

const initialState: PortfolioState = {
  cash: 1000000, // Start with 1 million won
  totalValue: 1000000,
  holdings: [],
  dailyChange: 0,
  dailyChangePercent: 0,
  isLoading: false,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    fetchPortfolioStart: (state) => {
      state.isLoading = true;
    },
    fetchPortfolioSuccess: (_state, action: PayloadAction<Omit<PortfolioState, 'isLoading'>>) => {
      return { ...action.payload, isLoading: false };
    },
    updateHoldingPrice: (state, action: PayloadAction<{ symbol: string; currentPrice: number }>) => {
      const holding = state.holdings.find(h => h.symbol === action.payload.symbol);
      if (holding) {
        holding.currentPrice = action.payload.currentPrice;
        holding.totalValue = holding.quantity * holding.currentPrice;
        holding.profitLoss = holding.totalValue - (holding.quantity * holding.averagePrice);
        holding.profitLossPercent = (holding.profitLoss / (holding.quantity * holding.averagePrice)) * 100;
        
        // Recalculate total portfolio value
        const holdingsValue = state.holdings.reduce((sum, h) => sum + h.totalValue, 0);
        state.totalValue = state.cash + holdingsValue;
      }
    },
    executeTrade: (state, action: PayloadAction<{ type: 'buy' | 'sell'; symbol: string; quantity: number; price: number }>) => {
      const { type, symbol, quantity, price } = action.payload;
      const totalCost = quantity * price;

      if (type === 'buy') {
        state.cash -= totalCost;
        const existingHolding = state.holdings.find(h => h.symbol === symbol);
        
        if (existingHolding) {
          const newTotalQuantity = existingHolding.quantity + quantity;
          existingHolding.averagePrice = 
            ((existingHolding.quantity * existingHolding.averagePrice) + totalCost) / newTotalQuantity;
          existingHolding.quantity = newTotalQuantity;
        } else {
          state.holdings.push({
            id: Date.now().toString(),
            symbol,
            name: symbol, // This should be fetched from stock data
            quantity,
            averagePrice: price,
            currentPrice: price,
            totalValue: totalCost,
            profitLoss: 0,
            profitLossPercent: 0,
          });
        }
      } else {
        state.cash += totalCost;
        const holding = state.holdings.find(h => h.symbol === symbol);
        
        if (holding) {
          holding.quantity -= quantity;
          if (holding.quantity === 0) {
            state.holdings = state.holdings.filter(h => h.symbol !== symbol);
          }
        }
      }
      
      // Recalculate total portfolio value
      const holdingsValue = state.holdings.reduce((sum, h) => sum + h.totalValue, 0);
      state.totalValue = state.cash + holdingsValue;
    },
  },
});

export const { fetchPortfolioStart, fetchPortfolioSuccess, updateHoldingPrice, executeTrade } = portfolioSlice.actions;
export default portfolioSlice.reducer;