import { create } from 'zustand';
import { getWithdrawals } from '@/lib/api/wallet';
import type { WithdrawalRecord } from '@/lib/api/wallet';
import type { PendingTransaction, HistoryTransaction } from '@/components/wallet/types';
import { mockPendingTransactions } from '@/components/wallet/mockData';

interface WalletTransactionState {
  // Transactions
  pendingTransactions: PendingTransaction[];
  historyTransactions: HistoryTransaction[];
  isLoadingWithdrawals: boolean;
  
  // Actions
  addPendingTransaction: (transaction: Omit<PendingTransaction, 'id'>) => void;
  removePendingTransaction: (transactionId: string) => void;
  addHistoryTransaction: (transaction: Omit<HistoryTransaction, 'id'>) => void;
  clearPendingTransactions: () => void;
  clearHistoryTransactions: () => void;
  fetchHistoryWithdrawals: () => Promise<void>;
}

export const useWalletTransactionStore = create<WalletTransactionState>((set) => ({
  // Initial state with mock data
  pendingTransactions: mockPendingTransactions,
  historyTransactions: [],
  isLoadingWithdrawals: false,

  // Actions
  addPendingTransaction: (transaction) => set((state) => ({
    pendingTransactions: [
      ...state.pendingTransactions,
      {
        ...transaction,
        id: `pending-${Date.now()}`,
      },
    ],
  })),

  removePendingTransaction: (transactionId) => set((state) => ({
    pendingTransactions: state.pendingTransactions.filter((t) => t.id !== transactionId),
  })),

  addHistoryTransaction: (transaction) => set((state) => ({
    historyTransactions: [
      {
        ...transaction,
        id: `history-${Date.now()}`,
      },
      ...state.historyTransactions,
    ],
  })),

  clearPendingTransactions: () => set({
    pendingTransactions: [],
  }),

  clearHistoryTransactions: () => set({
    historyTransactions: [],
  }),

  fetchHistoryWithdrawals: async () => {
    set({ isLoadingWithdrawals: true });
    try {
      const { success, withdrawals } = await getWithdrawals();
      if (success && withdrawals) {
        // Map API withdrawals to HistoryTransaction
        const formattedHistory: HistoryTransaction[] = withdrawals.map((w: WithdrawalRecord, index: number) => ({
          id: w.id ? String(w.id) : `history-fallback-${index}-${Date.now()}`,
          description: `Withdrawal to ${w.bankName || 'Bank'}`,
          category: w.status.charAt(0).toUpperCase() + w.status.slice(1), // e.g. 'Pending', 'Success'
          date: new Date(w.createdAt).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
           amount: Number(w.amount),
          transactionId: w.reference || `WD-${w.id}`,
        }));
        
        set({ 
          historyTransactions: formattedHistory,
          isLoadingWithdrawals: false 
        });
      } else {
        set({ isLoadingWithdrawals: false });
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      set({ isLoadingWithdrawals: false });
    }
  },
}));
