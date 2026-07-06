import { apiClient } from '@/lib/api/client';
import { Freebie, PaginationMeta } from '@/types/freebie';

export const freebiesService = {
  getFreebies: async (page = 1) => {
    const response = await apiClient.get<{
      success: boolean;
      freebies: Freebie[];
      pagination: PaginationMeta;
      error?: string;
    }>('/api/freebies', { params: { page } });
    return response.data;
  },

  getFreebieDetail: async (id: string) => {
    const response = await apiClient.get<{
      success: boolean;
      freebie: Freebie;
      error?: string;
    }>(`/api/freebies/${id}`);
    return response.data;
  },

  myFreebies: async (page = 1) => {
    const response = await apiClient.get<{
      success: boolean;
      freebies: Freebie[];
      pagination: PaginationMeta;
      error?: string;
    }>('/api/freebies/my', { params: { page } });
    return response.data;
  },

  uploadFreebie: async (formData: FormData) => {
    const response = await apiClient.post<{
      success: boolean;
      freebie: Freebie;
      error?: string;
    }>('/api/freebies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // axios handles multipart/form-data implicitly when FormData is passed
    return response.data;
  },

  getDownloadUrl: async (itemId: string) => {
    const response = await apiClient.post<{
      success: boolean;
      type: 'file' | 'link';
      url: string;
      fileName?: string;
      fileType?: string;
      expiresIn?: number;
      title?: string;
      // Error data if 403
      freebieId?: string;
      price?: number;
      currency?: string;
      error?: string;
    }>(`/api/freebies/items/${itemId}/download`);
    return response.data;
  },

  updatePrice: async (id: string, price: number, currency: string) => {
    const response = await apiClient.patch<{
      success: boolean;
      freebie: Partial<Freebie>;
      error?: string;
    }>(`/api/freebies/${id}/price`, { price, currency });
    return response.data;
  },

  initiatePurchase: async (id: string, currency: string, couponCode?: string) => {
    const response = await apiClient.post<{
      success: boolean;
      gateway: 'paystack' | 'stripe';
      currency: string;
      originalPrice: number;
      finalPrice: number;
      couponApplied: boolean;
      error?: string;
      data: {
        authorizationUrl?: string;
        accessCode?: string;
        sessionId?: string;
        sessionUrl?: string;
        reference: string;
      };
    }>(`/api/freebies/${id}/purchase`, { currency, couponCode }, {
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    });
    return response.data;
  },

  verifyPurchase: async (id: string, paymentReference: string, currency: string) => {
    const response = await apiClient.post<{
      success: boolean;
      alreadyProcessed: boolean;
      message: string;
      error?: string;
      freebieAccess?: Record<string, unknown>;
    }>(`/api/freebies/${id}/verify-purchase`, { paymentReference, currency }, {
      headers: {
        'Idempotency-Key': crypto.randomUUID(),
      },
    });
    return response.data;
  },

  deleteFreebie: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string; error?: string }>(
      `/api/freebies/my/${id}`
    );
    return response.data;
  },
};
