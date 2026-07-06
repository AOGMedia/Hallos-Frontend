import { apiClient } from './client';

export interface GenerateLinkResponse {
  success: boolean;
  message?: string;
  data?: {
    referralCode: string;
    referralLink: string;
    shareMessage: string;
  };
  // Backend returns these at top level too
  referralCode?: string;
  referralLink?: string;
  shareMessage?: string;
  commissionAmount?: number;
  couponCode?: string;
  seriesId?: string;
}

export interface TrackClickResponse {
  success: boolean;
  message: string;
}

export interface ReferralStatsResponse {
  success: boolean;
  hasReferralCode: boolean;
  referralCode: string | null;
  referralLink: string | null;
  commissionAmount?: number;
  couponCode?: string;
  stats: {
    totalClicks: number;
    totalReferrals: number;
    pendingCommissions: number;
    approvedCommissions: number;
    paidCommissions: number;
    totalEarnings: number;
  };
}

export interface CommissionRecord {
  id: string;
  referee: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  seriesId: string;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  createdAt: string;
  couponCode: string;
}

export interface EarningsResponse {
  success: boolean;
  total: number;
  commissions: CommissionRecord[];
}

export async function generateReferralLink(): Promise<GenerateLinkResponse> {
  const res = await apiClient.post<GenerateLinkResponse>('/api/referral/generate-link');
  return res.data;
}

export async function trackReferralClick(referralCode: string): Promise<TrackClickResponse> {
  const res = await apiClient.post<TrackClickResponse>('/api/referral/track-click', { referralCode });
  return res.data;
}

export async function getMyReferralStats(): Promise<ReferralStatsResponse> {
  const res = await apiClient.get<ReferralStatsResponse>('/api/referral/my-stats');
  return res.data;
}

export async function getMyReferralEarnings(params?: { 
  offset?: number; 
  limit?: number; 
  status?: string 
}): Promise<EarningsResponse> {
  const res = await apiClient.get<EarningsResponse>('/api/referral/my-earnings', { params });
  return res.data;
}

// --- ADMIN ENDPOINTS ---

export interface AdminCommissionRecord {
  id: string;
  referralCode: string;
  commissionAmount: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  couponCode: string;
  purchasedAt: string;
  referrer: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  referee: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  };
  rejectionReason?: string;
  approvedBy?: number;
  approvedAt?: string;
  paidAt?: string;
}

export interface AdminCommissionsResponse {
  success: boolean;
  total: number;
  commissions: AdminCommissionRecord[];
  pagination: {
    limit: number;
    offset: number;
    totalPages: number;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  stats: {
    totalReferralCodes: number;
    totalClicks: number;
    byStatus: {
      pending: { count: number; total: number };
      paid: { count: number; total: number };
      rejected: { count: number; total: number };
      [key: string]: { count: number; total: number } | undefined;
    };
    topReferrers: Array<{
      userId: number;
      user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
      };
      referralCount: number;
      totalEarnings: number;
    }>;
  };
}

export async function getAdminCommissions(params?: {
  status?: string;
  referrerUserId?: number;
  limit?: number;
  offset?: number;
}): Promise<AdminCommissionsResponse> {
  const res = await apiClient.get<AdminCommissionsResponse>('/api/referral/admin/commissions', { params });
  return res.data;
}

export async function approveCommission(id: string): Promise<{ success: boolean; message: string; commission: AdminCommissionRecord }> {
  const res = await apiClient.patch<{ success: boolean; message: string; commission: AdminCommissionRecord }>(`/api/referral/admin/commissions/${id}/approve`);
  return res.data;
}

export async function rejectCommission(id: string, reason: string): Promise<{ success: boolean; message: string; commission: AdminCommissionRecord }> {
  const res = await apiClient.patch<{ success: boolean; message: string; commission: AdminCommissionRecord }>(`/api/referral/admin/commissions/${id}/reject`, { reason });
  return res.data;
}

export async function getAdminReferralStats(): Promise<AdminStatsResponse> {
  const res = await apiClient.get<AdminStatsResponse>('/api/referral/admin/commissions/stats');
  return res.data;
}
