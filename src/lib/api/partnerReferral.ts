import { apiClient } from './client';

export interface PartnerReferralCode {
  id: string;
  referralCode: string;
  label: string;
  partnerUserId: number;
  commissionPercent: string | number;
  expiresAt: string;
  status: 'active' | 'inactive' | 'expired';
  clicksCount: number;
  successfulReferrals: number;
  totalEarnings: string | number;
  createdAt: string;
  signupLink?: string;
  totalLinkedCreators?: number;
  totalCommissionsPaid?: string | number;
}

export interface PartnerCodeCreatePayload {
  partnerUserId: number;
  commissionPercent: number;
  label: string;
  expiresAt?: string;
}

export interface PartnerCodeUpdatePayload {
  label?: string;
  commissionPercent?: number;
  expiresAt?: string;
  status?: 'active' | 'inactive' | 'expired';
}

export interface PartnerCodesResponse {
  success: boolean;
  total: number;
  data: PartnerReferralCode[];
}

export interface PartnerCreator {
  creatorUserId: number;
  firstname: string;
  lastname: string;
  email: string;
  signedUpAt: string;
  commissionActive: boolean;
}

export interface PartnerCreatorsResponse {
  success: boolean;
  total: number;
  data: PartnerCreator[];
}

export interface PartnerCommissionRecord {
  id: string;
  referralCode: string;
  referrerUserId: number;
  refereeUserId: number;
  purchaseId: string;
  commissionAmount: string | number;
  commissionPercent: string | number;
  purchaseAmount: string | number;
  currency: string;
  contentType: string;
  contentId: string;
  purchasedAt: string;
  createdAt: string;
}

export interface PartnerCommissionsResponse {
  success: boolean;
  total: number;
  data: PartnerCommissionRecord[];
}

// ----------------------------------------------------------------------------
// API Fetchers
// ----------------------------------------------------------------------------

export async function createPartnerCode(payload: PartnerCodeCreatePayload): Promise<{ success: boolean; data: PartnerReferralCode; message?: string }> {
  const res = await apiClient.post('/api/referral/admin/codes', payload);
  return res.data;
}

export async function updatePartnerCode(id: string, payload: PartnerCodeUpdatePayload): Promise<{ success: boolean; data: PartnerReferralCode; message?: string }> {
  const res = await apiClient.put(`/api/referral/admin/codes/${id}`, payload);
  return res.data;
}

export async function getAdminPartnerCodes(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PartnerCodesResponse> {
  const res = await apiClient.get<PartnerCodesResponse>('/api/referral/admin/codes', { params });
  return res.data;
}

export async function getPartnerCodeCreators(params: {
  id?: string;
  limit?: number;
  offset?: number;
}): Promise<PartnerCreatorsResponse> {
  if (!params.id) return { success: false, total: 0, data: [] };
  const { id, ...queryParams } = params;
  const res = await apiClient.get<PartnerCreatorsResponse>(`/api/referral/admin/codes/${id}/creators`, { params: queryParams });
  return res.data;
}

export async function getPartnerCommissions(params?: {
  partnerUserId?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<PartnerCommissionsResponse> {
  const res = await apiClient.get<PartnerCommissionsResponse>('/api/referral/admin/commissions', { params });
  return res.data;
}
