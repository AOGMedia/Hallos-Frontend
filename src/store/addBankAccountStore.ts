import { create } from 'zustand';
import { getBanks, resolveAccount } from '@/lib/api/wallet';
import type { Bank } from '@/components/wallet/types';

interface AddBankAccountState {
  // Data state
  banks: Bank[];
  isLoadingBanks: boolean;
  
  // Form state
  selectedBank: Bank | null;
  accountNumber: string;
  accountName: string | null;
  isVerifying: boolean;
  isBankDropdownOpen: boolean;
  bankSearchQuery: string;

  // Actions
  fetchBanks: (currency?: string) => Promise<void>;
  setSelectedBank: (bank: Bank | null) => void;
  setAccountNumber: (number: string) => void;
  setAccountName: (name: string | null) => void;
  setIsVerifying: (isVerifying: boolean) => void;
  setIsBankDropdownOpen: (isOpen: boolean) => void;
  setBankSearchQuery: (query: string) => void;
  verifyAccount: () => Promise<void>;
  resetForm: () => void;
  canAddAccount: () => boolean;
}

const initialState = {
  banks: [],
  isLoadingBanks: false,
  selectedBank: null,
  accountNumber: '',
  accountName: null,
  isVerifying: false,
  isBankDropdownOpen: false,
  bankSearchQuery: '',
};

export const useAddBankAccountStore = create<AddBankAccountState>((set, get) => ({
  ...initialState,

  // Actions
  fetchBanks: async (currency?: string) => {
    // Return cached banks if available and not forced, AND currency matches (if we tracked it)
    // For simplicity, if currency changes, we should probably force fetch or cache by currency.
    // Let's just always fetch if currency is provided to be safe, or check if banks are empty.
    
    set({ isLoadingBanks: true });
    try {
      const { success, banks } = await getBanks(currency);
      if (success && banks) {
        // Ensure banks is an array (handle cases where API might return an object)
        const banksArray = Array.isArray(banks) ? banks : (typeof banks === 'object' ? Object.values(banks) : []);
        
        // Convert API bank objects to match UI type (id number -> string)
        const formattedBanks: Bank[] = banksArray.map((item: unknown, index: number) => {
          const bank = item as { id?: string | number; code?: string; name?: string };
          return {
            id: bank.id ? String(bank.id) : `bank-${bank.code || index}-${Date.now()}`,
            name: bank.name || '',
            code: bank.code || '',
          };
        });
        set({ banks: formattedBanks, isLoadingBanks: false });
      } else {
        set({ isLoadingBanks: false });
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      set({ isLoadingBanks: false });
    }
  },

  setSelectedBank: (bank) => set({ 
    selectedBank: bank,
    accountNumber: '', // Reset account number when bank changes
    accountName: null,
  }),

  setAccountNumber: (number) => {
    // Only allow digits and max 10 characters
    const sanitized = number.replace(/\D/g, '').slice(0, 10);
    set({ accountNumber: sanitized, accountName: null });
  },

  setAccountName: (name) => set({ accountName: name }),

  setIsVerifying: (isVerifying) => set({ isVerifying }),

  setIsBankDropdownOpen: (isOpen) => set({ 
    isBankDropdownOpen: isOpen,
    // Clear search when closing
    bankSearchQuery: isOpen ? get().bankSearchQuery : '',
  }),

  setBankSearchQuery: (query) => set({ bankSearchQuery: query }),

  verifyAccount: async () => {
    const { selectedBank, accountNumber } = get();
    
    if (!selectedBank || accountNumber.length !== 10) {
      set({ accountName: null });
      return;
    }

    set({ isVerifying: true, accountName: null });

    try {
      const { success, data } = await resolveAccount(accountNumber, selectedBank.code);
      if (success && data?.accountName) {
        set({ accountName: data.accountName, isVerifying: false });
      } else {
        set({ accountName: null, isVerifying: false });
      }
    } catch (error) {
      console.error('Error verifying account:', error);
      set({ accountName: null, isVerifying: false });
    }
  },

  resetForm: () => set(initialState),

  canAddAccount: () => {
    const { selectedBank, accountNumber, accountName } = get();
    return !!(selectedBank && accountNumber.length === 10 && accountName);
  },
}));