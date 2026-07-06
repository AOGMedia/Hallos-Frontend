import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getPaymentConfig, type ContentType, type PaymentGateway } from '@/lib/api/payments'

interface PaymentState {
  contentType: ContentType | null
  contentId: string | null
  isChecking: boolean
  isModalOpen: boolean
  price?: string
  currency?: string
  selectedGateway?: PaymentGateway
  isInitializing: boolean
  isVerifying: boolean
  error?: string
  paymentReference?: string
  checkoutUrl?: string
  purchasedContent: Record<string, boolean>;
  supportedCurrencies: string[];
  gatewayMapping: Record<string, PaymentGateway>;
  defaultCurrency: string;
  fetchConfig: () => Promise<void>;
  
  // Enrollment Specific
  startDate?: Date; // For bookkeeping if needed
  accessType: 'individual' | 'monthly' | 'yearly';
  couponCode?: string;
  isEnrollmentModalOpen: boolean;

  setContent: (ct: ContentType, id: string) => void
  openModal: () => void
  closeModal: () => void
  
  openEnrollmentModal: () => void;
  closeEnrollmentModal: () => void;
  setAccessType: (type: 'individual' | 'monthly' | 'yearly') => void;
  setCouponCode: (code?: string) => void;

  setPriceCurrency: (price?: string, currency?: string) => void
  setSelectedGateway: (g?: PaymentGateway) => void
  setIsChecking: (v: boolean) => void
  setIsInitializing: (v: boolean) => void
  setIsVerifying: (v: boolean) => void
  setError: (msg?: string) => void
  setPaymentReference: (ref?: string) => void
  setCheckoutUrl: (url?: string) => void
  reset: () => void
  markContentAsPurchased: (type: ContentType, id: string, userId?: string) => void;
  hasAccess: (type: ContentType, id: string, userId?: string) => boolean;
  cleanupGlobalPurchases: () => void;

}


export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      contentType: null,
      contentId: null,
      isChecking: false,
      isModalOpen: false,
      price: undefined,
      currency: undefined,
      selectedGateway: undefined,
      isInitializing: false,
      isVerifying: false,
      error: undefined,
      paymentReference: undefined,
      checkoutUrl: undefined,
      purchasedContent: {},
      supportedCurrencies: [],
      gatewayMapping: {},
      defaultCurrency: 'NGN',
      
      accessType: 'individual',
      couponCode: undefined,
      isEnrollmentModalOpen: false,

      fetchConfig: async () => {
        try {
           const config = await getPaymentConfig()
           set({ 
             supportedCurrencies: config.supportedCurrencies,
             gatewayMapping: config.gatewayMapping,
             defaultCurrency: config.defaultCurrency
           })
        } catch (e) {
            console.error(e)
            // Fallback
             set({ 
             supportedCurrencies: ['NGN', 'USD'],
             gatewayMapping: { 'NGN': 'paystack', 'USD': 'stripe' },
             defaultCurrency: 'NGN'
           })
        }
      },
      
      setContent: (ct, id) => set({ contentType: ct, contentId: id }),
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
      
      openEnrollmentModal: () => set({ isEnrollmentModalOpen: true }),
      closeEnrollmentModal: () => set({ isEnrollmentModalOpen: false }),
      setAccessType: (type) => set({ accessType: type }),
      setCouponCode: (code) => set({ couponCode: code }),

      setPriceCurrency: (price, currency) => set({ price, currency }),
      setSelectedGateway: (g) => set({ selectedGateway: g }),
      setIsChecking: (v) => set({ isChecking: v }),
      setIsInitializing: (v) => set({ isInitializing: v }),
      setIsVerifying: (v) => set({ isVerifying: v }),
      setError: (msg) => set({ error: msg }),
      setPaymentReference: (ref) => set({ paymentReference: ref }),
      setCheckoutUrl: (url) => set({ checkoutUrl: url }),
      markContentAsPurchased: (type, id, userId?: string) => {
        // Don't mark as purchased if user is not logged in
        if (!userId) {
          console.warn('[PaymentStore] Cannot mark content as purchased - no userId provided');
          return;
        }
        
        const key = `${type}_${id}_${userId}`;
        set((state) => ({
          purchasedContent: { ...state.purchasedContent, [key]: true },
        }));
      },

      hasAccess: (type, id, userId?: string) => {
        // Don't grant access if user is not logged in
        if (!userId) {
          return false;
        }
        
        const key = `${type}_${id}_${userId}`;
        return !!get().purchasedContent[key];
      },
      
      // Cleanup function to remove old global purchase records
      cleanupGlobalPurchases: () => {
        const state = get();
        // prevent unnecessary updates
        let changed = false;
        const cleanedPurchases: Record<string, boolean> = {};
        
        Object.keys(state.purchasedContent).forEach(key => {
          const parts = key.split('_');
          if (parts.length >= 3) {
            // This is a user-specific purchase, keep it
            cleanedPurchases[key] = true;
          } else {
            // Skip old global purchases (only 2 parts)
            changed = true;
          }
        });
        
        if (changed) {
          set({ purchasedContent: cleanedPurchases });
        }
      },
      reset: () => set({
        isChecking: false,
        isModalOpen: false,
        isEnrollmentModalOpen: false,
        price: undefined,
        currency: undefined,
        selectedGateway: undefined,
        isInitializing: false,
        isVerifying: false,
        error: undefined,
        paymentReference: undefined,
        checkoutUrl: undefined,
        contentType: null,
        contentId: null,
        accessType: 'individual',
        couponCode: undefined,
      }),
    }),
    {
      name: 'payment-storage',
      partialize: (state) => ({ purchasedContent: state.purchasedContent }),
    }
  )
)

