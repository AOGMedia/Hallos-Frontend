import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminCommissions, 
  approveCommission, 
  rejectCommission, 
  getAdminReferralStats,
  type AdminCommissionsResponse
} from '@/lib/api/referral';

interface AdminCommissionsParams {
  page?: number;
  limit?: number;
  status?: string;
  referrerUserId?: number;
}

export function useAdminReferralStats() {
  return useQuery({
    queryKey: ['admin-referral-stats'],
    queryFn: getAdminReferralStats,
  });
}

export function useAdminCommissions(params: AdminCommissionsParams) {
  // Use offset logic based on page and limit
  const limit = params.limit || 50;
  const offset = ((params.page || 1) - 1) * limit;

  return useQuery({
    queryKey: ['admin-commissions', params.page, params.limit, params.status, params.referrerUserId],
    queryFn: () => getAdminCommissions({
      limit,
      offset,
      status: params.status,
      referrerUserId: params.referrerUserId,
    }),
    placeholderData: (prev: AdminCommissionsResponse | undefined) => prev, // Keep previous data while loading new pages
  });
}

export function useApproveCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveCommission(id),
    onSuccess: () => {
      // Optimistically update caches
      queryClient.invalidateQueries({ queryKey: ['admin-referral-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
    },
  });
}

export function useRejectCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectCommission(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-referral-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
    },
  });
}
