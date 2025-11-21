import { createSlice, PayloadAction } from '@reduxjs/toolkit'에러가 발생했습니다'portfolio'에러가 발생했습니다'isLoading'에러가 발생했습니다'buy' | 'sell'에러가 발생했습니다'buy') {
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

export const { fetchPortfolioStart, fetchPortfolioSuccess, updateCash, updateHoldingPrice, executeTrade } = portfolioSlice.actions;
export default portfolioSlice.reducer;