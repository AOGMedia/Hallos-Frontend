// Wallet status types
export type WalletStatus = 'pending' | 'available';

// Tab types for wallet navigation
export type WalletTab = 'balance' | 'monetization';

// Wallet balance data
export interface WalletBalance {
  amount: number;
  status: WalletStatus;
  description: string;
  currency?: string;
}

// Partial wallet balance for mock data (static text only)
export interface WalletBalanceStatic {
  status: WalletStatus;
  description: string;
}

// Component props
export interface WalletCardProps {
  balance: WalletBalance;
  onViewDetails?: () => void;
  onWithdraw?: () => void;
  onTopUp?: () => void;
  onViewHistory?: () => void;
}

export interface WalletTabProps {
  activeTab: WalletTab;
  onTabChange: (tab: WalletTab) => void;
}

// Pending balance transaction data
export interface PendingTransaction {
  id: string;
  className: string;
  date: string;
  totalRevenue: number;
  serviceCharge: number;
  totalEarned: number;
}

// History transaction data
export interface HistoryTransaction {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  transactionId: string;
}

// Modal types
export type WalletModalType = 'pending' | 'history' | 'withdrawal' | 'add-bank';

export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: WalletModalType;
  pendingTransactions?: PendingTransaction[];
  historyTransactions?: HistoryTransaction[];
}

// Bank account types
export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

// Withdrawal types
export interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onAddAccount: () => void;
  onConfirm: (amount: number, accountId: string) => void;
}

export interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onAddAccount: (account: Omit<BankAccount, 'id'>) => void;
}

// Earnings statistics types
export type TimePeriod = 'this-year' | 'this-month' | 'last-month' | 'last-3-months';
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';
export type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

export interface EarningsStatsFilter {
  period: TimePeriod;
  currency: Currency;
  month: string;
  year: number;
}