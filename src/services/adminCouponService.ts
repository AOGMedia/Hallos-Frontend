import axios from 'axios';
import {
  Coupon,
  AdminCouponCreatePayload,
  CouponUpdatePayload,
  AdminCouponAnalytics,
  AdminCouponUsageHistory,
} from '@/types/coupon';

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

export const adminCouponService = {
  getCoupons: async (params: {
    status?: string;
    type?: string;
    contentType?: string;
    creatorId?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get<{
      success: boolean;
      data: Coupon[];
    }>('/api/admin/coupons', { params });
    return response.data;
  },

  createCoupon: async (payload: AdminCouponCreatePayload) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: Coupon;
    }>('/api/admin/coupons/create', payload);
    return response.data;
  },

  updateCoupon: async (id: string, payload: CouponUpdatePayload) => {
    const response = await api.put<{
      success: boolean;
      message: string;
      data: Coupon;
    }>(`/api/admin/coupons/${id}`, payload);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await api.delete<{
      success: boolean;
      message: string;
      data: Coupon;
    }>(`/api/admin/coupons/${id}`);
    return response.data;
  },

  getAnalytics: async (params: {
    startDate?: string;
    endDate?: string;
    contentType?: string;
    currency?: string;
  } = {}) => {
    const response = await api.get<{
      success: boolean;
      data: AdminCouponAnalytics;
    }>('/api/admin/coupons/analytics', { params });
    return response.data;
  },

  getUsageHistory: async (id: string, params: {
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get<{
      success: boolean;
      data: AdminCouponUsageHistory;
    }>(`/api/admin/coupons/${id}/usage-history`, { params });
    return response.data;
  },
};
