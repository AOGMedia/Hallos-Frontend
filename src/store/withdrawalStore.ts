import { create } from 'zustand';

interface WithdrawalState {
  // Form state
  amount: string;
  selectedAccountId: string;
  isDropdownOpen: boolean;
  
  // Fee calculation state
  fee: number | null;
  netAmount: number | null;
  isCalculatingFees: boolean;

  // Actions
  setAmount: (amount: string) => void;
  setSelectedAccountId: (accountId: string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  resetForm: () => void;
  canWithdraw: (availableBalance: number) => boolean;
  calculateFees: () => Promise<void>;
}

const initialState = {
  amount: '',
  selectedAccountId: '',
  isDropdownOpen: false,
  fee: null,
  netAmount: null,
  isCalculatingFees: false,
};

export const useWithdrawalStore = create<WithdrawalState>((set, get) => ({
  ...initialState,

  // Actions
  setAmount: (amount) => {
    // Only allow numbers and decimal point
    const sanitized = amount.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = sanitized.split('.');
    const formatted = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}` 
      : sanitized;
      
    // Reset fees when amount changes
    set({ amount: formatted, fee: null, netAmount: null });
  },

  setSelectedAccountId: (accountId) => set({ 
    selectedAccountId: accountId,
    isDropdownOpen: false, // Close dropdown when account is selected
  }),

  setIsDropdownOpen: (isOpen) => set({ isDropdownOpen: isOpen }),

  resetForm: () => set(initialState),

  canWithdraw: (availableBalance: number) => {
    const { amount, selectedAccountId } = get();
    const withdrawalAmount = parseFloat(amount);
    return !!(
      amount && 
      selectedAccountId && 
      !isNaN(withdrawalAmount) && 
      withdrawalAmount > 0 && 
      withdrawalAmount <= availableBalance
    );
  },

  calculateFees: async () => {
    const { amount } = get();
    const numericAmount = parseFloat(amount);
    
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      set({ fee: null, netAmount: null });
      return;
    }

    set({ isCalculatingFees: true });
    
    // Get active currency
    // Using import here to avoid circular dependencies if possible, or direct import if safe.
    // Ideally pass currency as arg, but store access is okay.
    const { activeCurrency } = await import('./walletBalanceStore').then(m => m.useWalletBalanceStore.getState());
    const { calculateCurrencyWithdrawalFees } = await import('@/lib/api/wallet');

    try {
      const { success, fees } = await calculateCurrencyWithdrawalFees(numericAmount, activeCurrency);
      if (success && fees) {
        set({ 
          fee: fees.totalFee || fees.platformFee, // Handle potential API variations
          netAmount: fees.netAmount,
          isCalculatingFees: false 
        });
      } else {
        set({ isCalculatingFees: false });
      }
    } catch (error) {
      console.error('Error calculating fees:', error);
      set({ isCalculatingFees: false });
    }
  },
}));