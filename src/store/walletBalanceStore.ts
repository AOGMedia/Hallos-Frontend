import { create } from 'zustand';
import { getWalletBalance, WalletBalance, initializeWallet } from '@/lib/api/wallet';

interface WalletBalanceState {
  // State
  balances: Record<string, WalletBalance>;
  activeCurrency: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveCurrency: (currency: string) => void;
  fetchBalance: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Helpers/Updaters (now require currency)
  deductFromAvailableBalance: (currency: string, amount: number) => void;
  addToAvailableBalance: (currency: string, amount: number) => void;
}

export const useWalletBalanceStore = create<WalletBalanceState>((set) => ({
  // Initial state
  balances: {},
  activeCurrency: 'NGN',
  isLoading: false,
  error: null,

  setActiveCurrency: (currency) => set({ activeCurrency: currency }),

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all balances
      const { success, balances } = await getWalletBalance();
      if (success && balances) {
        // Normalize balances to ensure consistency (handle pendingAmount vs pendingBalance)
        const normalizedBalances: Record<string, WalletBalance> = {};
        Object.entries(balances).forEach(([currency, balance]) => {
          normalizedBalances[currency] = {
            ...balance,
            // @ts-expect-error - Handle legacy API field if present
            pendingBalance: balance.pendingBalance ?? balance.pendingAmount ?? 0,
            availableBalance: balance.availableBalance ?? 0,
            totalBalance: balance.totalBalance ?? ((balance.availableBalance || 0) + (balance.pendingBalance || 0)),
          };
        });

        set({
          balances: normalizedBalances,
          isLoading: false,
        });
      } else {
        set({ isLoading: false }); // Graceful fail or partial success
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred fetching balance' 
      });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { success, wallets } = await initializeWallet();
      if (success && wallets) {
        set({ balances: wallets, isLoading: false });
      }
    } catch (error) {
       console.error('Error initializing wallet:', error);
       set({ isLoading: false });
    }
  },

  deductFromAvailableBalance: (currency, amount) => set((state) => {
    const balance = state.balances[currency];
    if (!balance) return state;

    return {
      balances: {
        ...state.balances,
        [currency]: {
          ...balance,
          availableBalance: Math.max(0, balance.availableBalance - amount),
        }
      }
    };
  }),

  addToAvailableBalance: (currency, amount) => set((state) => {
    const balance = state.balances[currency];
    // If balance doesn't exist yet for this currency, we might need to fetch or init, 
    // but for now let's assume it exists or ignore to avoid inconsistencies
    if (!balance) return state;

    return {
      balances: {
        ...state.balances,
        [currency]: {
          ...balance,
          availableBalance: balance.availableBalance + amount,
        }
      }
    };
  }),
}));