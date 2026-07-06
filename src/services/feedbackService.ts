import { apiClient } from '@/lib/api/client';

export interface AdminFeedbackFilters {
  status?: string;
  rating?: number;
  userType?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export const feedbackService = {
  // --- User Endpoints ---
  submitFeedback: async (data: { rating: number; category: string; subject: string; message: string }) => {
    const response = await apiClient.post('/api/feedback', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await apiClient.get('/api/feedback/status');
    return response.data;
  },

  dismissPopup: async () => {
    const response = await apiClient.post('/api/feedback/dismiss');
    return response.data;
  },

  // --- Admin Endpoints ---
  getAllFeedback: async (params?: AdminFeedbackFilters) => {
    const response = await apiClient.get('/api/feedback/admin/all', { params });
    return response.data;
  },

  updateFeedbackStatus: async (id: string, data: { status?: string; adminNotes?: string }) => {
    const response = await apiClient.patch(`/api/feedback/admin/${id}`, data);
    return response.data;
  },

  getFeedbackStats: async () => {
    const response = await apiClient.get('/api/feedback/admin/stats');
    return response.data;
  },

  deleteFeedback: async (id: string) => {
    const response = await apiClient.delete(`/api/feedback/admin/${id}`);
    return response.data;
  },
};

