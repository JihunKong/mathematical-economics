import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import stockReducer from './stockSlice';
import portfolioReducer from './portfolioSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stock: stockReducer,
    portfolio: portfolioReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;