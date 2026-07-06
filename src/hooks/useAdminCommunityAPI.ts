import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/lib/api/adminCommunity';
import type { CommunityResponse } from '@/lib/api/community';

// QUERIES

export function useAdminCommunities(params: adminApi.AdminCommunitiesParams) {
  // Use offset logic or pass page directly, depending on how backend handles it
  // The docs specify `page` and `limit`, so we pass those directly.
  return useQuery({
    queryKey: ['admin-communities', params.page, params.limit, params.status, params.visibility, params.name],
    queryFn: () => adminApi.getAdminCommunities(params),
    placeholderData: (prev: CommunityResponse | undefined) => prev, // Keeps previous data while fetching next page
  });
}

export function useAdminCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: ['admin-community-members', communityId],
    queryFn: () => adminApi.getAdminCommunityMembers(communityId),
    enabled: !!communityId,
  });
}

// MUTATIONS

export function useApproveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.approveCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
    },
  });
}

export function useRejectCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.rejectCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
    },
  });
}

export function useSuspendCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.suspendCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
    },
  });
}

export function useRemoveAdminCommunityMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, uid }: { id: string; uid: string }) => adminApi.removeAdminCommunityMember(id, uid),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-community-members', id] });
    },
  });
}

export function useDeleteAdminCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteAdminCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
    },
  });
}

export function useDeleteAdminCommunityContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contentId, contentType }: { id: string; contentId: string; contentType: string }) => 
      adminApi.deleteAdminCommunityContent(id, contentId, contentType),
    onSuccess: (_, { id }) => {
      // Invalidate relevant content queries if needed, depending on how they are structured
      // For now, we invalidate any communityContent query for this community
      queryClient.invalidateQueries({ queryKey: ['communityContent', id] });
      queryClient.invalidateQueries({ queryKey: ['communityModerationQueue', id] });
    },
  });
}
