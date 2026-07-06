import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ugcService } from '@/services/ugcService';
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

/**
 * Hook to fetch companies with filtering and search
 */
export function useCompanies(params: { 
  industry?: string; 
  search?: string; 
  page?: number; 
  limit?: number; 
} = {}) {
  return useQuery<GetCompaniesResponse, Error>({
    queryKey: ['ugc-companies', params],
    queryFn: () => ugcService.getCompanies(params),
  });
}

/**
 * Hook to fetch all industries
 */
export function useIndustries() {
  return useQuery<GetIndustriesResponse, Error>({
    queryKey: ['ugc-industries'],
    queryFn: () => ugcService.getIndustries(),
    staleTime: 24 * 60 * 60 * 1000, // Industries are fairly static (1 day cache)
  });
}

/**
 * Hook to fetch company details
 */
export function useCompanyDetails(id: string | number | null) {
  return useQuery<GetCompanyDetailsResponse, Error>({
    queryKey: ['ugc-company', id],
    queryFn: () => ugcService.getCompanyDetails(id!),
    enabled: !!id,
  });
}

/**
 * Hook to send collaboration request
 */
export function useSendCollaboration() {
  const queryClient = useQueryClient();
  
  return useMutation<SendCollaborationResponse, Error, { companyId: string | number; message: string }>({
    mutationFn: ({ companyId, message }) => ugcService.sendCollaborationRequest(companyId, message),
    onSuccess: () => {
      // Invalidate my requests list to refresh history
      queryClient.invalidateQueries({ queryKey: ['ugc-my-requests'] });
    },
  });
}

/**
 * Hook to fetch current user's requests
 */
export function useMyRequests(params: { page?: number; limit?: number } = {}) {
  return useQuery<MyRequestsResponse, Error>({
    queryKey: ['ugc-my-requests', params],
    queryFn: () => ugcService.getMyRequests(params),
  });
}

// --- Admin Hooks ---

/**
 * Hook to fetch admin collaboration requests
 */
export function useAdminRequests(params: {
  status?: string;
  companyId?: number;
  userId?: number;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery<GetAdminRequestsResponse, Error>({
    queryKey: ['ugc-admin-requests', params],
    queryFn: () => ugcService.getAdminRequests(params),
  });
}

/**
 * Hook to fetch admin collaboration statistics
 */
export function useAdminStats() {
  return useQuery<GetAdminStatsResponse, Error>({
    queryKey: ['ugc-admin-stats'],
    queryFn: () => ugcService.getAdminStats(),
  });
}

/**
 * Hook to update collaboration request status as admin
 */
export function useUpdateCollaborationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation<
    UpdateAdminRequestResponse, 
    Error, 
    { id: string | number; status: string }
  >({
    mutationFn: ({ id, status }) => ugcService.updateCollaborationStatus(id, status),
    onSuccess: () => {
      // Invalidate both lists and stats to keep UI fresh
      queryClient.invalidateQueries({ queryKey: ['ugc-admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ugc-admin-stats'] });
    },
  });
}
