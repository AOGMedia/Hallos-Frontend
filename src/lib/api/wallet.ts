import apiClient from './client';

export interface WalletBalance {
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  currency: string;
  requiredGateway?: string;
  id?: string;
}

export interface MultiCurrencyBalanceResponse {
  success: boolean;
  balance?: WalletBalance; // Single currency response
  balances?: Record<string, WalletBalance>; // All currencies response
}

export interface EarningsBreakdown {
  totalEarnings: Record<string, number>;
  byContentType: {
    video: Record<string, number>;
    live_class: Record<string, number>;
  };
  thisMonth: Record<string, number>;
  lastMonth: Record<string, number>;
}

export interface SaleRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  contentTitle: string;
  contentType: 'video' | 'live_class';
  amount: string;
  currency: string;
  creatorEarning: string;
  platformFee: string;
  purchaseDate: string;
}

export interface CreatorSalesResponse {
  success: boolean;
  sales: SaleRecord[];
}

export async function getWalletBalance(currency?: string): Promise<MultiCurrencyBalanceResponse> {
  const params = currency ? { currency } : {};
  const res = await apiClient.get<MultiCurrencyBalanceResponse>('/api/wallet/balance', { params });
  return res.data;
}

export async function getEarningsBreakdown(): Promise<{ success: boolean; earnings: EarningsBreakdown }> {
  const res = await apiClient.get('/api/wallet/earnings');
  return res.data;
}

export async function getCreatorSales(limit = 50, offset = 0, contentType?: 'video' | 'live_class'): Promise<CreatorSalesResponse> {
  const params: Record<string, string | number> = { limit, offset };
  if (contentType) params.contentType = contentType;
  
  const res = await apiClient.get<CreatorSalesResponse>('/api/wallet/sales', { params });
  return res.data;
}

export interface InitializeWalletResponse {
  success: boolean;
  message: string;
  wallets: Record<string, WalletBalance>;
}

export async function initializeWallet(): Promise<InitializeWalletResponse> {
  const res = await apiClient.post<InitializeWalletResponse>('/api/wallet/initialize');
  return res.data;
}

export interface CreditWalletPayload {
  currency: string;
  amount: number;
  reference: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function creditWallet(payload: CreditWalletPayload): Promise<{ success: boolean; message: string; wallet: WalletBalance }> {
  const res = await apiClient.post('/api/wallet/credit', payload);
  return res.data;
}

export interface TransferFundsPayload {
  toUserId: number;
  currency: string;
  amount: number;
  description: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  transfer: {
    reference: string;
    fromUserId: number;
    toUserId: number;
    currency: string;
    amount: string;
    status: string;
    timestamp: string;
  };
}

export async function transferFunds(payload: TransferFundsPayload): Promise<TransferResponse> {
  const res = await apiClient.post<TransferResponse>('/api/wallet/transfer', payload);
  return res.data;
}

export async function getBanks(currency?: string): Promise<{ success: boolean; banks: Array<{ id: number; name: string; code: string; slug: string }> }> {
  const url = currency ? `/api/wallet/supported-banks/${currency}` : '/api/wallet/banks';
  const res = await apiClient.get(url);
  return res.data;
}

export interface WithdrawalFees {
  totalFee?: number;
  platformFee?: number;
  netAmount: number;
}

export interface CalculateFeesResponse {
  success: boolean;
  fees?: WithdrawalFees;
}

export async function resolveAccount(accountNumber: string, bankCode: string): Promise<{ success: boolean; data?: { accountName: string; accountNumber: string; bankCode: string; bankName: string }; message?: string }> {
  const res = await apiClient.post('/api/wallet/resolve-account', { accountNumber, bankCode });
  return res.data;
}

export async function calculateWithdrawalFees(amount: number, gateway = 'paystack'): Promise<CalculateFeesResponse> {
  const res = await apiClient.post<CalculateFeesResponse>('/api/wallet/calculate-fees', { amount, gateway });
  return res.data;
}

export interface InitiateWithdrawalPayload {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  currency: string; // Added currency
  gateway?: 'paystack' | 'stripe' | string;
}

export interface InitiateWithdrawalResponse {
  success: boolean;
  message?: string;
  requires2FA?: boolean;
  withdrawalId?: string;
  otpSentTo?: string;
  expiresIn?: number;
  withdrawalData?: {
    id: string;
    amount: string;
    currency: string;
    status: string;
    estimatedCompletion?: string;
  };
  nextStep?: string;
}

export async function initiateWithdrawal(payload: InitiateWithdrawalPayload, idempotencyKey?: string): Promise<InitiateWithdrawalResponse> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  const res = await apiClient.post<InitiateWithdrawalResponse>('/api/wallet/withdraw', payload, { headers });
  return res.data;
}

export async function verifyWithdrawal(withdrawalId: string, code: string): Promise<InitiateWithdrawalResponse> {
  const res = await apiClient.post<InitiateWithdrawalResponse>('/api/wallet/verify-withdrawal', { withdrawalId, code });
  return res.data;
}

export async function resendWithdrawalOtp(withdrawalId: string): Promise<{ success: boolean; message: string; otpSentTo?: string; expiresIn?: number; canResendAfter?: number }> {
  const res = await apiClient.post('/api/wallet/resend-withdrawal-otp', { withdrawalId });
  return res.data;
}

export async function cancelWithdrawal(withdrawalId: string): Promise<{ success: boolean; message: string; refundedAmount?: string; currency?: string }> {
  const res = await apiClient.post('/api/wallet/cancel-withdrawal', { withdrawalId });
  return res.data;
}

export async function get2faConfig(): Promise<{ success: boolean; config: Record<string, unknown> }> {
  const res = await apiClient.get('/api/wallet/2fa-config');
  return res.data;
}

export async function getWithdrawalLimits(currency: string): Promise<{ success: boolean; limits: Record<string, unknown>; fees: Record<string, unknown> }> {
  const res = await apiClient.get(`/api/wallet/withdrawal-limits/${currency}`);
  return res.data;
}

export async function calculateCurrencyWithdrawalFees(amount: number, currency: string): Promise<CalculateFeesResponse> {
  const res = await apiClient.post<CalculateFeesResponse>('/api/wallet/calculate-withdrawal-fees', { amount, currency });
  return res.data;
}

export interface WithdrawalRecord {
  id: string | number;
  bankName?: string;
  status: string;
  createdAt: string;
  amount: string | number;
  reference?: string;
  currency?: string; // Likely needed
}

export interface GetWithdrawalsResponse {
  success: boolean;
  withdrawals: WithdrawalRecord[];
}

export async function getWithdrawals(limit = 10, offset = 0): Promise<GetWithdrawalsResponse> {
  const res = await apiClient.get<GetWithdrawalsResponse>('/api/wallet/withdrawals', { params: { limit, offset } });
  return res.data;
}

export interface TransactionRecord {
  id: string | number;
  [key: string]: unknown;
}

export interface GetTransactionsResponse {
  success: boolean;
  transactions: TransactionRecord[];
}

export async function getTransactions(limit = 10, offset = 0): Promise<GetTransactionsResponse> {
  const res = await apiClient.get<GetTransactionsResponse>('/api/wallet/transactions', { params: { limit, offset } });
  return res.data;
}

export interface TransactionStats {
  totalTransactions: number;
  totalPurchases: number;
  totalPayouts: number;
  totalFees: number;
  purchaseAmount: number;
  payoutAmount: number;
  feeAmount: number;
}

export interface GetTransactionStatsResponse {
  success: boolean;
  stats: TransactionStats;
}

export async function getTransactionStats(): Promise<GetTransactionStatsResponse> {
  const res = await apiClient.get<GetTransactionStatsResponse>('/api/wallet/transaction-stats');
  return res.data;
}

/** Exports transactions CSV - returns blob */
export async function exportTransactionsCsv(): Promise<Blob> {
  const res = await apiClient.get('/api/wallet/export-transactions', { responseType: 'blob' });
  return res.data;
}

// ── Top-Up ────────────────────────────────────────────────────────────────────

export interface TopUpInitializePayload {
  currency: 'NGN' | 'USD';
  amount: number;
}

export interface TopUpInitializeResponse {
  success: boolean;
  gateway: 'paystack' | 'stripe';
  authorizationUrl: string;
  accessCode?: string;
  sessionId?: string;
  reference: string;
  amount: number;
  currency: string;
}

export interface TopUpVerifyPayload {
  reference: string;
  gateway: 'paystack' | 'stripe';
  sessionId?: string;
}

export interface TopUpVerifyResponse {
  success: boolean;
  message: string;
  wallet: WalletBalance;
  transaction: {
    reference: string;
    amount: number;
    currency: string;
    gateway: string;
  };
}

export async function initializeTopUp(payload: TopUpInitializePayload): Promise<TopUpInitializeResponse> {
  const res = await apiClient.post<TopUpInitializeResponse>('/api/wallet/topup/initialize', payload);
  return res.data;
}

export async function verifyTopUp(payload: TopUpVerifyPayload): Promise<TopUpVerifyResponse> {
  const res = await apiClient.post<TopUpVerifyResponse>('/api/wallet/topup/verify', payload);
  return res.data;
}

// ── Top-Up History ────────────────────────────────────────────────────────────

export interface TopUpHistoryRecord {
  id: string;
  wallet_account_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  reference: string;
  description: string;
  status: string;
  gateway: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
  idempotency_key?: string;
  created_at: string;
  completed_at?: string;
}

export interface TopUpHistoryResponse {
  success: boolean;
  transactions: TopUpHistoryRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

export async function getTopUpHistory(
  currency?: 'NGN' | 'USD',
  limit = 20,
  offset = 0,
): Promise<TopUpHistoryResponse> {
  const params: Record<string, string | number> = { limit, offset };
  if (currency) params.currency = currency;
  const res = await apiClient.get<TopUpHistoryResponse>('/api/wallet/topup/history', { params });
  return res.data;
}
