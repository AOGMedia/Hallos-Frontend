import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { initiateWithdrawal } from '@/lib/api/wallet';
import { useWalletBalanceStore } from './walletBalanceStore';
import type { WalletTab, WalletModalType, BankAccount } from '@/components/wallet/types';

interface WalletState {
  // Tab state
  activeTab: WalletTab;
  
  // Modal states
  modalState: {
    isOpen: boolean;
    type: WalletModalType | null;
  };
  isWithdrawalModalOpen: boolean;
  isAddBankModalOpen: boolean;
  
  // Withdrawal state
  isWithdrawing: boolean;
  withdrawalError: string | null;
  
  // 2FA Withdrawal State
  withdrawal2FA: {
    isRequired: boolean;
    withdrawalId: string | null;
    otpSentTo: string | null;
    message: string | null;
  };

  // Bank accounts
  bankAccounts: BankAccount[];
  
  // New: Withdrawal Success State
  withdrawalSuccess: {
    isSuccess: boolean;
    amount?: number;
    currency?: string;
    accountName?: string;
    bankName?: string;
    estimatedCompletion?: string;
  };
  
  // Actions
  setActiveTab: (tab: WalletTab) => void;
  openModal: (type: WalletModalType) => void;
  closeModal: () => void;
  openWithdrawalModal: () => void;
  closeWithdrawalModal: () => void;
  openAddBankModal: () => void;
  closeAddBankModal: () => void;
  navigateToAddBank: () => void;
  navigateBackToWithdrawal: () => void;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  removeBankAccount: (accountId: string) => void;
  initiateWithdrawal: (amount: number, accountId: string, gateway?: string) => Promise<boolean>;
  verifyWithdrawalOtp: (code: string) => Promise<boolean>;
  resendWithdrawalOtp: () => Promise<void>;
  cancelWithdrawal: () => Promise<void>;
  resetWithdrawalSuccess: () => void;
}
  
const initialState = {
  activeTab: 'balance' as WalletTab,
  modalState: {
    isOpen: false,
    type: null as WalletModalType | null,
  },
  isWithdrawalModalOpen: false,
  isAddBankModalOpen: false,
  isWithdrawing: false,
  withdrawalError: null,
  withdrawal2FA: {
    isRequired: false,
    withdrawalId: null,
    otpSentTo: null,
    message: null,
  },
  bankAccounts: [],
  withdrawalSuccess: {
    isSuccess: false,
  },
};

export const useWalletStore = create<WalletState>((set, get) => ({
  ...initialState,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (type) => set({
    modalState: { isOpen: true, type },
  }),

  closeModal: () => set({
    modalState: { isOpen: false, type: null },
  }),

  openWithdrawalModal: () => set({
    isWithdrawalModalOpen: true,
    withdrawalError: null,
  }),

  closeWithdrawalModal: () => set({
    isWithdrawalModalOpen: false,
    withdrawalError: null,
    withdrawalSuccess: { isSuccess: false },
    withdrawal2FA: { 
        isRequired: false, 
        withdrawalId: null, 
        otpSentTo: null,
        message: null
    },
  }),

  openAddBankModal: () => set({
    isAddBankModalOpen: true,
  }),

  closeAddBankModal: () => set({
    isAddBankModalOpen: false,
    // Don't close withdrawal modal - user might want to go back
  }),

  navigateToAddBank: () => set({
    isWithdrawalModalOpen: false,
    isAddBankModalOpen: true,
  }),

  navigateBackToWithdrawal: () => set({
    isAddBankModalOpen: false,
    isWithdrawalModalOpen: true,
  }),

  addBankAccount: (account) => set((state) => ({
    bankAccounts: [
      ...state.bankAccounts,
      {
        ...account,
        id: `account-${Date.now()}`,
      },
    ],
  })),

  removeBankAccount: (accountId) => set((state) => ({
    bankAccounts: state.bankAccounts.filter((acc) => acc.id !== accountId),
  })),

  initiateWithdrawal: async (amount, accountId, gateway = 'paystack') => {
    set({ isWithdrawing: true, withdrawalError: null });
    
    // Get active currency from balance store
    const { activeCurrency, deductFromAvailableBalance } = useWalletBalanceStore.getState();

    // Find the bank account details
    const account = get().bankAccounts.find(acc => acc.id === accountId);
    if (!account) {
      set({ isWithdrawing: false, withdrawalError: 'Bank account not found' });
      return false;
    }

    if (!account.bankCode) {
        set({ isWithdrawing: false, withdrawalError: 'Bank details incomplete: Missing bank code. Please remove and re-add this bank account.' });
        return false;
    }

    try {
      const idempotencyKey = uuidv4();
      const response = await initiateWithdrawal({
        amount,
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        bankCode: account.bankCode,
        gateway,
        currency: activeCurrency
      }, idempotencyKey);

        // Check CamelCase and snake_case API response
        const requires2FA = response.requires2FA || (response as { requires_2fa?: boolean }).requires_2fa || response.message?.toLowerCase().includes('verification code') || response.message?.toLowerCase().includes('otp');
        const withdrawalId = response.withdrawalId || (response as { id?: string }).id;

        if (response.success || requires2FA) {
          if (requires2FA && withdrawalId) {
            // 2FA Flow
            set({
                isWithdrawing: false,
                withdrawal2FA: {
                    isRequired: true,
                    withdrawalId: withdrawalId,
                    otpSentTo: response.otpSentTo || null,
                    message: response.message || 'Verification code sent to your email'
                }
            });
            return true;
          }

        // Direct Success
        deductFromAvailableBalance(activeCurrency, amount);
        
        // Refetch balance to be sure
        useWalletBalanceStore.getState().fetchBalance();

        set({ 
          isWithdrawing: false, 
          // isWithdrawalModalOpen: false, // Keep open to show success screen
          withdrawalSuccess: {
              isSuccess: true,
              amount: amount,
              currency: activeCurrency,
              accountName: account.accountName,
              bankName: account.bankName
          },
          withdrawal2FA: { // Reset 2FA state
              isRequired: false,
              withdrawalId: null,
              otpSentTo: null,
              message: null
          }
        });
        return true;
      } else {
        set({ isWithdrawing: false, withdrawalError: response.message || 'Withdrawal failed' });
        return false;
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      set({ 
        isWithdrawing: false, 
        withdrawalError: error instanceof Error ? error.message : 'An error occurred processing withdrawal' 
      });
      return false;
    }
  },

  verifyWithdrawalOtp: async (code: string) => {
      const { withdrawal2FA } = get();
      if (!withdrawal2FA.withdrawalId) return false;

      set({ isWithdrawing: true, withdrawalError: null });

      try {
          // Import here to avoid circular dependency issues if any, or just use the imported one
          const { verifyWithdrawal } = await import('@/lib/api/wallet');
          const response = await verifyWithdrawal(withdrawal2FA.withdrawalId, code);

          if (response.success) {
// Ideally refetch balance here to get updated balance after withdrawal
              
              set({
                  isWithdrawing: false,
                  withdrawalSuccess: {
                      ...get().withdrawalSuccess,
                      isSuccess: true,
                      estimatedCompletion: response.withdrawalData?.estimatedCompletion
                  },
                  withdrawal2FA: {
                      isRequired: false,
                      withdrawalId: null,
                      otpSentTo: null,
                      message: null
                  }
              });
              // Refetch balance here
              useWalletBalanceStore.getState().fetchBalance();
              return true;
          } else {
              set({ isWithdrawing: false, withdrawalError: response.message || 'Invalid OTP' });
              return false;
          }
      } catch {
          set({ isWithdrawing: false, withdrawalError: 'Verification failed' });
          return false;
      }
  },

  resendWithdrawalOtp: async () => {
      const { withdrawal2FA } = get();
      if (!withdrawal2FA.withdrawalId) return;

      try {
          const { resendWithdrawalOtp } = await import('@/lib/api/wallet');
          await resendWithdrawalOtp(withdrawal2FA.withdrawalId);
          // Optional: Show success toast
      } catch {
          console.error('Failed to resend OTP');
      }
  },

  cancelWithdrawal: async () => {
      const { withdrawal2FA } = get();
      if (withdrawal2FA.withdrawalId) {
          try {
             const { cancelWithdrawal } = await import('@/lib/api/wallet');
             await cancelWithdrawal(withdrawal2FA.withdrawalId);
          } catch (e) {
              console.error(e);
          }
      }
      // Always reset state even if API fails (UI Optimistic)
      set({ 
          isWithdrawing: false,
          withdrawal2FA: {
              isRequired: false,
              withdrawalId: null,
              otpSentTo: null,
              message: null
          },
          withdrawalError: null
      });
  },

  resetWithdrawalSuccess: () => set({ withdrawalSuccess: { isSuccess: false } }),
}));