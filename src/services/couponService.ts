import { apiClient } from '@/lib/api/client';
import {
  Coupon,
  CouponValidationResponse,
  CouponCreatePayload,
  CouponUpdatePayload,
  CouponUsageStats,
} from '@/types/coupon';

export const couponService = {
  validateCoupon: async (payload: {
    code: string;
    contentType: string;
    contentId: string;
  }): Promise<CouponValidationResponse> => {
    try {
      const response = await apiClient.post<CouponValidationResponse>('/api/coupons/validate', payload);
      return response.data;
    } catch (error: unknown) {
      const e = error as { response?: { data?: CouponValidationResponse }; message?: string };
      if (e.response?.data) return e.response.data;
      return { success: false, message: e.message || 'Validation failed' };
    }
  },

  createCoupon: async (payload: CouponCreatePayload) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: Coupon;
    }>('/api/coupons/create', payload);
    return response.data;
  },

  getMyCoupons: async (params?: {
    status?: string;
    contentType?: string;
  }) => {
    const response = await apiClient.get<{
      success: boolean;
      data: Coupon[];
    }>('/api/coupons/my-coupons', { params });
    return response.data;
  },

  updateCoupon: async (id: string, payload: CouponUpdatePayload) => {
    const response = await apiClient.put<{
      success: boolean;
      message: string;
      data: Coupon;
    }>(`/api/coupons/${id}`, payload);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: Coupon;
    }>(`/api/coupons/${id}`);
    return response.data;
  },

  getCouponUsage: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: CouponUsageStats;
    }>(`/api/coupons/${id}/usage`);
    return response.data;
  },
};
