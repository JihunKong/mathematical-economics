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
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
  }>;
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    openModal: (state, action: PayloadAction<{ type: 'buy' | 'sell' | 'info'; data?: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      };
    },
    addNotification: (state, action: PayloadAction<Omit<UiState['notifications'][0], 'id' | 'timestamp'>>) => {
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