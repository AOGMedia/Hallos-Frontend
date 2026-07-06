import { apiClient } from '@/lib/api/client';
import { 
  GetCompaniesResponse, 
  GetIndustriesResponse, 
  GetCompanyDetailsResponse, 
  SendCollaborationResponse, 
  MyRequestsResponse,
  GetAdminRequestsResponse,
  GetAdminStatsResponse,
  UpdateAdminRequestResponse
} from '@/types/ugc';

export const ugcService = {
  /**
   * Fetch all companies with optional filtering and search
   */
  getCompanies: async (params: { 
    industry?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
  } = {}) => {
    const response = await apiClient.get<GetCompaniesResponse>('/api/ugc/companies', {
      params: {
        page: 1, // Default values
        limit: 20,
        ...params,
      },
    });
    return response.data;
  },

  /**
   * Fetch all unique industries for filtering
   */
  getIndustries: async () => {
    const response = await apiClient.get<GetIndustriesResponse>('/api/ugc/industries');
    return response.data;
  },

  /**
   * Fetch detailed information about a specific company
   */
  getCompanyDetails: async (id: string | number) => {
    const response = await apiClient.get<GetCompanyDetailsResponse>(`/api/ugc/companies/${id}`);
    return response.data;
  },

  /**
   * Send a collaboration request to a company
   */
  sendCollaborationRequest: async (companyId: string | number, message: string) => {
    const response = await apiClient.post<SendCollaborationResponse>(
      `/api/ugc/companies/${companyId}/collaborate`,
      { message }
    );
    return response.data;
  },

  /**
   * Fetch the current user's collaboration request history
   */
  getMyRequests: async (params: { page?: number; limit?: number } = {}) => {
    const response = await apiClient.get<MyRequestsResponse>('/api/ugc/my-requests', {
      params: {
        page: 1,
        limit: 20,
        ...params,
      },
    });
    return response.data;
  },

  // --- Admin Endpoints ---

  /**
   * Fetch all collaboration requests with optional formatting (Admin)
   */
  getAdminRequests: async (params: {
    status?: string;
    companyId?: number;
    userId?: number;
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await apiClient.get<GetAdminRequestsResponse>('/api/ugc/admin/requests', {
      params: {
        page: 1,
        limit: 20,
        ...params,
      },
    });
    return response.data;
  },

  /**
   * Fetch comprehensive collaboration statistics (Admin)
   */
  getAdminStats: async () => {
    const response = await apiClient.get<GetAdminStatsResponse>('/api/ugc/admin/stats');
    return response.data;
  },

  /**
   * Update the status of a collaboration request (Admin)
   */
  updateCollaborationStatus: async (id: string | number, status: string) => {
    const response = await apiClient.patch<UpdateAdminRequestResponse>(`/api/ugc/admin/requests/${id}`, {
      status,
    });
    return response.data;
  },
};
