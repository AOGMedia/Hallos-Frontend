import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPartnerCode,
  updatePartnerCode,
  getAdminPartnerCodes,
  getPartnerCodeCreators,
  getPartnerCommissions,
  type PartnerCodeCreatePayload,
  type PartnerCodeUpdatePayload,
  type PartnerCodesResponse,
  type PartnerCreatorsResponse,
  type PartnerCommissionsResponse
} from '@/lib/api/partnerReferral';

// Query Keys
export const partnerReferralKeys = {
  all: ['partner-referrals'] as const,
  codes: () => [...partnerReferralKeys.all, 'codes'] as const,
  codeList: (params: Record<string, unknown>) => [...partnerReferralKeys.codes(), params] as const,
  creators: (id: string) => [...partnerReferralKeys.all, 'creators', id] as const,
  creatorList: (id: string, params: Record<string, unknown>) => [...partnerReferralKeys.creators(id), params] as const,
  commissions: () => [...partnerReferralKeys.all, 'commissions'] as const,
  commissionList: (params: Record<string, unknown>) => [...partnerReferralKeys.commissions(), params] as const,
};

// ----------------------------------------------------------------------------
// Queries
// ----------------------------------------------------------------------------

export function usePartnerCodes(params: { page?: number; limit?: number; status?: string }) {
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;

  return useQuery({
    queryKey: partnerReferralKeys.codeList({ limit, offset, status: params.status }),
    queryFn: () => getAdminPartnerCodes({ limit, offset, status: params.status }),
    placeholderData: (prev: PartnerCodesResponse | undefined) => prev,
  });
}

export function usePartnerCodeCreators(params: { id: string | null; page?: number; limit?: number }) {
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;

  return useQuery({
    queryKey: partnerReferralKeys.creatorList(params.id || '', { limit, offset }),
    queryFn: () => getPartnerCodeCreators({ id: params.id || '', limit, offset }),
    enabled: !!params.id,
    placeholderData: (prev: PartnerCreatorsResponse | undefined) => prev,
  });
}

export function usePartnerCommissions(params: { page?: number; limit?: number; partnerUserId?: number; currency?: string }) {
  const limit = params.limit || 20;
  const offset = ((params.page || 1) - 1) * limit;

  return useQuery({
    queryKey: partnerReferralKeys.commissionList({ limit, offset, partnerUserId: params.partnerUserId, currency: params.currency }),
    queryFn: () => getPartnerCommissions({ 
      limit, 
      offset, 
      partnerUserId: params.partnerUserId,
      currency: params.currency 
    }),
    placeholderData: (prev: PartnerCommissionsResponse | undefined) => prev,
  });
}

// ----------------------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------------------

export function useCreatePartnerCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PartnerCodeCreatePayload) => createPartnerCode(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerReferralKeys.codes() });
    },
  });
}

export function useUpdatePartnerCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: PartnerCodeUpdatePayload }) => updatePartnerCode(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerReferralKeys.codes() });
    },
  });
}
