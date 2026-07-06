import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prod-api.aahbibi.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Interfaces based on AdminDashboard.md ---

export interface DashboardStats {
  users: {
    total: number;
    newToday: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  revenue: {
    allTime: Record<string, { total: number; count: number }>;
    last30Days: Record<string, { total: number; count: number }>;
    byContentType: Record<string, Record<string, { total: number; count: number }>>;
  };
  payouts: {
    pendingCount: number;
    pendingAmount: number;
  };
  content: {
    videos: number;
    liveClasses: number;
    activeLiveClasses: number;
    courses: number;
    courseEnrollments: number;
    pendingCredentials: number;
  };
}

export interface RevenueData {
  date: string;
  total: number;
  transactions: number;
}

export interface UserSummary {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'viewer' | 'creator' | 'admin';
  country: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: number;
  type: 'purchase' | 'payout' | 'transfer' | 'refund';
  amount: number;
  currency: string;
  status: string;
  item: string;
  date: string;
  createdAt: string;
  paymentMethod?: string;
}

export interface UserDetail extends UserSummary {
  bio?: string;
  phoneNumber?: string;
  walletBalances: Record<string, { available: string; pending: string }>;
  purchaseSummary: {
    totalPurchases: number;
    totalSpent: Record<string, number>;
    recentPurchases: Transaction[];
  };
  payoutSummary: {
    totalPayouts: number;
    recentPayouts: Payout[];
  };
  courseEnrollments: { id: number; name: string; enrolledAt: string }[];
}

export interface Payout {
  id: string;
  userId: number;
  amount: number;
  platformFee: number;
  gatewayFee: number;
  netAmount: number;
  currency: string;
  paymentGateway: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  failureReason?: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
}

export interface FraudStats {
    totalBlocked: number;
    suspiciousToday: number;
    riskAlerts: number;
}

export interface AuditLog {
    id: string;
    eventType: string;
    userId: number;
    details: Record<string, unknown>;
    ipAddress: string;
    createdAt: string;
}

export const adminDashboardService = {
  // 1. Platform Dashboard
  getDashboardStats: async () => {
    const response = await api.get<{ success: boolean; } & DashboardStats>('/api/admin/dashboard');
    return response.data;
  },

  // 2. Revenue Analytics
  getRevenueAnalytics: async (currency = 'NGN', days = 30) => {
    const response = await api.get<{ success: boolean; currency: string; days: number; data: RevenueData[] }>('/api/admin/revenue', {
      params: { currency, days }
    });
    return response.data;
  },

  // 3. Content Statistics
  getContentStats: async () => {
    const response = await api.get('/api/admin/content-stats');
    return response.data;
  },

  // 4. User Management
  getUsers: async (params: { search?: string; role?: string; page?: number; limit?: number } = {}) => {
    const response = await api.get<{
      success: boolean;
      users: UserSummary[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/api/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (id: number) => {
    const response = await api.get<{ success: boolean; user: UserDetail }>(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: number, role: string) => {
    const response = await api.patch(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  // 5. Payout Management
  getPayouts: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const response = await api.get<{
      success: boolean;
      payouts: Payout[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/api/admin/payouts', { params });
    return response.data;
  },

  approvePayout: async (id: string) => {
    const response = await api.patch(`/api/admin/payouts/${id}/approve`);
    return response.data;
  },

  rejectPayout: async (id: string, reason: string) => {
    const response = await api.patch(`/api/admin/payouts/${id}/reject`, { reason });
    return response.data;
  },

  // 9. Financial Security & Fraud
  getFraudStats: async () => {
    const response = await api.get('/api/admin/fraud-detection/stats');
    return response.data;
  },

  getSuspiciousActivities: async () => {
    const response = await api.get('/api/admin/fraud-detection/suspicious-activities');
    return response.data;
  },

  unblockUser: async (userId: number) => {
    const response = await api.post('/api/admin/fraud-detection/unblock-user', { userId });
    return response.data;
  },

  // 10. Audit Trail
  getAuditLogs: async (params: Record<string, unknown> = {}) => {
    const response = await api.get<{
      success: boolean;
      logs: AuditLog[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/api/admin/audit/logs', { params });
    return response.data;
  },

  // 12. Transaction History
  searchTransactions: async (data: Record<string, unknown>) => {
    const response = await api.post<{
       success: boolean;
       transactions: Transaction[];
       pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/api/admin/transactions/search', data);
    return response.data;
  },

  getTransactionAnalytics: async () => {
    const response = await api.get('/api/admin/transactions/analytics');
    return response.data;
  },

  // 13. Withdrawal Limits
  getWithdrawalSystemStats: async () => {
    const response = await api.get('/api/admin/withdrawal-limits/system-stats');
    return response.data;
  },
  
  setUserTier: async (userId: number, tier: string) => {
    const response = await api.post('/api/admin/withdrawal-limits/set-tier', { userId, tier });
    return response.data;
  }
};
