import { create } from 'zustand';

export interface StoreConfig {
  isShopOpen: boolean;
  isCooking: boolean;
  isHoliday: boolean;
  holidayMessage: string;
  isNoticeActive: boolean;
  noticeMessage: string;
  description: string;
  currentStatusMsg: string;
  menuFooterMessage?: string;
  ownerAvatarUrl?: string;
  cookingImageUrl?: string;
}

interface StoreConfigStore {
  config: StoreConfig | null;
  isConnected: boolean;
  error: string | null;

  // Actions
  setConfig: (config: StoreConfig) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  updateConfigField: (field: keyof StoreConfig, value: any) => void;
  reset: () => void;
}

const initialState = {
  config: null,
  isConnected: false,
  error: null,
};

export const useStoreConfigStore = create<StoreConfigStore>((set) => ({
  ...initialState,

  setConfig: (config) => set({ config, error: null }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error }),
  updateConfigField: (field, value) =>
    set((state) => ({
      config: state.config ? { ...state.config, [field]: value } : null,
    })),
  reset: () => set(initialState),
}));
