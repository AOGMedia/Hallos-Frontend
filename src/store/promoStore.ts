import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PromoState {
  modalDismissed: boolean;
  bannerDismissed: boolean;
  dismissModal: () => void;
  dismissBanner: () => void;
}

export const usePromoStore = create<PromoState>()(
  persist(
    (set) => ({
      modalDismissed: false,
      bannerDismissed: false,
      dismissModal: () => set({ modalDismissed: true }),
      dismissBanner: () => set({ bannerDismissed: true }),
    }),
    { name: 'hallos-promo' }
  )
);
