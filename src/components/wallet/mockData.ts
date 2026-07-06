import type {
  // WalletBalance,
  WalletBalanceStatic,
  PendingTransaction,

  //  HistoryTransaction, Bank,
  BankAccount,
} from "./types";

export const mockWalletData: {
  pending: WalletBalanceStatic;
  available: WalletBalanceStatic;
} = {
  pending: {
    status: "pending",
    description: "Balance from earnings pending with Learning247",
  },
  available: {
    status: "available",
    description: "This shows your top ups and credited earnings",
  },
};

export const mockPendingTransactions: PendingTransaction[] = [
  {
    id: "1",
    className: "Digital Marketing for Beginners",
    date: "10 Nov, 2025",
    totalRevenue: 300000.0,
    serviceCharge: -22500.0,
    totalEarned: 277000.0,
  },
  {
    id: "2",
    className: "Graphics Design PRO",
    date: "11 Nov, 2025",
    totalRevenue: 122000.0,
    serviceCharge: -9150.0,
    totalEarned: 112850.0,
  },
];

// Mock saved bank accounts
export const mockBankAccounts: BankAccount[] = [
  {
    id: "1",
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "John Doe",
  },
  {
    id: "2",
    bankName: "Access Bank",
    accountNumber: "0987654321",
    accountName: "John Doe",
  },
];
