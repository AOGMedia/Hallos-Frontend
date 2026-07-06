import { create } from 'zustand';
import { Coupon } from '@/types/coupon';
import { couponService } from '@/services/couponService';

interface CouponState {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  isCreateModalOpen: boolean;
  fetchCoupons: (params?: { status?: string; contentType?: string }) => Promise<void>;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  deleteCoupon: (id: string) => Promise<boolean>;
}

export const useCouponStore = create<CouponState>((set) => ({
  coupons: [],
  isLoading: false,
  error: null,
  isCreateModalOpen: false,

  fetchCoupons: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const res = await couponService.getMyCoupons(params);
      if (res.success) {
        set({ coupons: res.data || [] });
      } else {
        set({ error: 'Failed to fetch coupons' });
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      set({ error: e.message || 'An error occurred while fetching coupons' });
    } finally {
      set({ isLoading: false });
    }
  },

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  deleteCoupon: async (id: string) => {
    try {
      const res = await couponService.deleteCoupon(id);
      if (res.success) {
        set((state) => ({
          coupons: state.coupons.filter(c => c.id !== id),
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
}));
