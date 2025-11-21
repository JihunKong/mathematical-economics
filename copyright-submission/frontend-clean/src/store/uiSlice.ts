import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Modal {
  isOpen: boolean;
  type: 'buy' | 'sell' | 'info' | null;
  data?: any;
}

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modal: Modal;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning'에러가 발생했습니다'light'에러가 발생했습니다'ui'에러가 발생했습니다'light' ? 'dark' : 'light';
    },
    openModal: (state, action: PayloadAction<{ type: 'buy' | 'sell' | 'info'에러가 발생했습니다'notifications'][0], 'id' | 'timestamp'>>) => {
      state.notifications.push({
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { 
  toggleSidebar, 
  setSidebarOpen, 
  toggleTheme, 
  openModal, 
  closeModal,
  addNotification,
  removeNotification
} = uiSlice.actions;
export default uiSlice.reducer;