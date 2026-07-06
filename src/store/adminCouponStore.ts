import { create } from 'zustand';
import { adminCouponService } from '@/services/adminCouponService';
import {
  Coupon,
  AdminCouponCreatePayload,
  CouponUpdatePayload,
  AdminCouponAnalytics,
  AdminCouponUsageHistory,
} from '@/types/coupon';

interface AdminCouponState {
  coupons: Coupon[];
  isLoading: boolean;
  
  analytics: AdminCouponAnalytics | null;
  isLoadingAnalytics: boolean;
  
  usageHistory: AdminCouponUsageHistory | null;
  isLoadingUsage: boolean;

  // Filter state for the list
  filters: {
    status?: string;
    type?: string;
    contentType?: string;
    creatorId?: number;
    page: number;
    limit: number;
  };

  // Actions
  fetchCoupons: (params?: Partial<AdminCouponState['filters']>) => Promise<void>;
  fetchAnalytics: (params?: { startDate?: string; endDate?: string; contentType?: string; currency?: string }) => Promise<void>;
  fetchUsageHistory: (id: string, params?: { page?: number; limit?: number }) => Promise<void>;
  
  createCoupon: (payload: AdminCouponCreatePayload) => Promise<boolean>;
  updateCoupon: (id: string, payload: CouponUpdatePayload) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;
  
  setFilters: (filters: Partial<AdminCouponState['filters']>) => void;
}

export const useAdminCouponStore = create<AdminCouponState>((set, get) => ({
  coupons: [],
  isLoading: false,
  
  analytics: null,
  isLoadingAnalytics: false,
  
  usageHistory: null,
  isLoadingUsage: false,

  filters: {
    page: 1,
    limit: 15,
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchCoupons: async (params) => {
    set({ isLoading: true });
    try {
      const mergedParams = { ...get().filters, ...params };
      const res = await adminCouponService.getCoupons(mergedParams);
      if (res.success) {
        set({ coupons: res.data });
        set({ filters: mergedParams });
      }
    } catch (err) {
      console.error('Failed to fetch admin coupons:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAnalytics: async (params) => {
    set({ isLoadingAnalytics: true });
    try {
      const res = await adminCouponService.getAnalytics(params);
      if (res.success) {
        set({ analytics: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch coupon analytics:', err);
    } finally {
      set({ isLoadingAnalytics: false });
    }
  },

  fetchUsageHistory: async (id, params) => {
    set({ isLoadingUsage: true });
    try {
      const res = await adminCouponService.getUsageHistory(id, params);
      if (res.success) {
        set({ usageHistory: res.data });
      }
    } catch (err) {
      console.error('Failed to fetch usage history:', err);
    } finally {
      set({ isLoadingUsage: false });
    }
  },

  createCoupon: async (payload) => {
    try {
      const res = await adminCouponService.createCoupon(payload);
      if (res.success) {
        get().fetchCoupons();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to create coupon:', err);
      return false;
    }
  },

  updateCoupon: async (id, payload) => {
    try {
      const res = await adminCouponService.updateCoupon(id, payload);
      if (res.success) {
        get().fetchCoupons();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update coupon:', err);
      return false;
    }
  },

  deleteCoupon: async (id) => {
    try {
      const res = await adminCouponService.deleteCoupon(id);
      if (res.success) {
        get().fetchCoupons();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      return false;
    }
  },
}));
