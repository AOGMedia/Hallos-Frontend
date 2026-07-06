/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/community';

// QUERIES
export function useCommunities(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['communities', { page, limit }],
    queryFn: () => api.getCommunities(page, limit),
  });
}

export function useMyCommunities(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['communities', 'my', { page, limit }],
    queryFn: () => api.getMyCommunities(page, limit),
  });
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: ['community', id],
    queryFn: () => api.getCommunity(id),
    enabled: !!id,
  });
}

export function useCommunityAnnouncements(communityId: string) {
  return useQuery({
    queryKey: ['communityAnnouncements', communityId],
    queryFn: () => api.getAnnouncements(communityId),
    enabled: !!communityId,
  });
}

export function useCommunityContent(communityId: string) {
  return useQuery({
    queryKey: ['communityContent', communityId],
    queryFn: () => api.getCommunityContent(communityId),
    enabled: !!communityId,
  });
}

export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: ['communityMembers', communityId],
    queryFn: () => api.getCommunityMembers(communityId),
    enabled: !!communityId,
  });
}

export function useModerationQueue(communityId: string, isAdmin = false, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['communityModerationQueue', communityId, page, limit],
    queryFn: () => api.getModerationQueue(communityId, page, limit),
    enabled: !!communityId && isAdmin,
    retry: false,
  });
}

export function useMySubmissions(communityId: string, isMember = false, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['mySubmissions', communityId, page, limit],
    queryFn: () => api.getMySubmissions(communityId, page, limit),
    enabled: !!communityId && isMember,
    retry: false,
  });
}

export function useCommunityInviteLink(communityId: string) {
  return useQuery({
    queryKey: ['communityInviteLink', communityId],
    queryFn: () => api.getInviteLink(communityId),
    enabled: !!communityId,
  });
}

// MUTATIONS
export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.CreateCommunityPayload) => api.createCommunity(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.joinCommunity(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['community', id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useJoinCommunityViaInvite() {
  return useMutation({
    mutationFn: (token: string) => api.joinCommunityViaInvite(token),
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.leaveCommunity(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['communityMembers', id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useUpdateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.updateCommunity(id, payload),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['community', id] }),
  });
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCommunity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newOwnerId }: { id: string; newOwnerId: string }) => api.transferOwnership(id, newOwnerId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['communityMembers', id] });
      queryClient.invalidateQueries({ queryKey: ['community', id] });
    },
  });
}

export function useAddMemberByEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => api.addMemberByEmail(id, email),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityMembers', id] }),
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => api.removeMember(id, userId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityMembers', id] }),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId, role }: { id: string; userId: string; role: 'moderator' | 'member' }) => api.updateMemberRole(id, userId, role),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityMembers', id] }),
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => api.approveJoinRequest(id, userId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityMembers', id] }),
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => api.rejectJoinRequest(id, userId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityMembers', id] }),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title: string; body: string; isPinned?: boolean; image?: File } }) =>
      api.createAnnouncement(id, payload),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityAnnouncements', id] }),
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, announcementId, payload }: { id: string; announcementId: string; payload: { title?: string; body?: string; isPinned?: boolean; image?: File } }) =>
      api.updateAnnouncement(id, announcementId, payload),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityAnnouncements', id] }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, announcementId }: { id: string; announcementId: string }) => api.deleteAnnouncement(id, announcementId),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityAnnouncements', id] }),
  });
}

export function useLikeAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, announcementId }: { communityId: string; announcementId: string }) =>
      api.likeAnnouncement(communityId, announcementId),
    onSuccess: (_, { communityId }) => queryClient.invalidateQueries({ queryKey: ['communityAnnouncements', communityId] }),
  });
}

export function useAnnouncementComments(communityId: string, announcementId: string | null, page = 1) {
  return useQuery({
    queryKey: ['announcementComments', communityId, announcementId, page],
    queryFn: () => api.getAnnouncementComments(communityId, announcementId!, page),
    enabled: !!communityId && !!announcementId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, announcementId, body }: { communityId: string; announcementId: string; body: string }) =>
      api.addComment(communityId, announcementId, body),
    onSuccess: (_, { communityId, announcementId }) =>
      queryClient.invalidateQueries({ queryKey: ['announcementComments', communityId, announcementId] }),
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, announcementId, commentId }: { communityId: string; announcementId: string; commentId: string }) =>
      api.deleteComment(communityId, announcementId, commentId),
    onSuccess: (_, { communityId, announcementId }) =>
      queryClient.invalidateQueries({ queryKey: ['announcementComments', communityId, announcementId] }),
  });
}

export function useSubmitContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.submitContentForReview(id, payload),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityModerationQueue', id] }),
  });
}

export function useApproveSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, submissionId }: { id: string; submissionId: string }) => api.approveSubmission(id, submissionId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['communityModerationQueue', id] });
      queryClient.invalidateQueries({ queryKey: ['communityContent', id] });
    },
  });
}

export function useRejectSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, submissionId, reason }: { id: string; submissionId: string; reason: string }) => api.rejectSubmission(id, submissionId, reason),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityModerationQueue', id] }),
  });
}

export function useRegenerateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.regenerateInviteToken(id),
    onSuccess: (_, id) => queryClient.invalidateQueries({ queryKey: ['communityInviteLink', id] }),
  });
}

export function useToggleNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => api.toggleNotifications(id, enabled),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['community', id] }),
  });
}

export function useResubmitContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, submissionId, payload }: { id: string; submissionId: string; payload: any }) => api.resubmitContent(id, submissionId, payload),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['communityModerationQueue', id] }),
  });
}

export function useMemberProfile(communityId: string, userId: string | null) {
  return useQuery({
    queryKey: ['communityMemberProfile', communityId, userId],
    queryFn: () => api.getMemberProfile(communityId, userId!),
    enabled: !!communityId && !!userId,
  });
}
