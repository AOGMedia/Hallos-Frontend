/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';

export interface CreateCommunityPayload {
  name: string;
  description?: string;
  type: string; // 'school', 'association', 'committee', 'general'
  visibility: 'public' | 'private';
  joinPolicy?: 'request' | 'invite_only';
  poster?: File;
}

export interface CommunityResponse {
  success: boolean;
  data: any;
  isMember?: boolean;
  is_member?: boolean;
  membershipStatus?: string;
  membership_status?: string;
  queued?: boolean;
  message?: string;
}

/**
 * 1. List Communities
 */
export async function getCommunities(page = 1, limit = 20): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities?page=${page}&limit=${limit}`);
  return response.data;
}

/**
 * 1.1 Get My Communities
 */
export async function getMyCommunities(page = 1, limit = 20): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/my?page=${page}&limit=${limit}`);
  return response.data;
}

/**
 * 2. Get Single Community
 */
export async function getCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}`);
  return response.data;
}

/**
 * 3. Create Community
 */
export async function createCommunity(payload: CreateCommunityPayload): Promise<CommunityResponse> {
  const formData = new FormData();
  formData.append('name', payload.name);
  if (payload.description) formData.append('description', payload.description);
  formData.append('type', payload.type);
  formData.append('visibility', payload.visibility);
  if (payload.joinPolicy) formData.append('joinPolicy', payload.joinPolicy);
  if (payload.poster) formData.append('poster', payload.poster);

  const response = await apiClient.post<CommunityResponse>('/api/communities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s — file uploads need more time
  });
  return response.data;
}

/**
 * 4. Join a Community (Request)
 */
export async function joinCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/join`, {});
  return response.data;
}

/**
 * 5. Join via Invite Link
 */
export async function joinCommunityViaInvite(token: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/invite/${token}`);
  return response.data;
}

/**
 * 6. Leave Community
 */
export async function leaveCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/communities/${id}/members/me`);
  return response.data;
}

/**
 * 7. Toggle Email Notifications
 */
export async function toggleNotifications(id: string, enabled: boolean): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/api/communities/${id}/members/me/notifications`, { enabled });
  return response.data;
}

/**
 * 8. List Announcements
 */
export async function getAnnouncements(id: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}/announcements`);
  return response.data;
}

/**
 * 9. List Community Content
 */
export async function getCommunityContent(id: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}/content`);
  return response.data;
}

/**
 * 10. Submit Content for Review
 */
export async function submitContentForReview(id: string, payload: any): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/submissions`, payload);
  return response.data;
}

/**
 * 11. Resubmit Rejected Content
 */
export async function resubmitContent(id: string, submissionId: string, contentData: any): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/api/communities/${id}/submissions/${submissionId}/resubmit`, { contentData });
  return response.data;
}

/**
 * 12. List Members
 */
export async function getCommunityMembers(id: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}/members`);
  return response.data;
}

/**
 * 13. Add Member by Email
 */
export async function addMemberByEmail(id: string, email: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/members`, { email });
  return response.data;
}

/**
 * 14. Remove Member
 */
export async function removeMember(id: string, userId: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/communities/${id}/members/${userId}`);
  return response.data;
}

/**
 * 15. Approve Join Request
 */
export async function approveJoinRequest(id: string, userId: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/join-requests/${userId}/approve`);
  return response.data;
}

/**
 * 16. Reject Join Request
 */
export async function rejectJoinRequest(id: string, userId: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/join-requests/${userId}/reject`);
  return response.data;
}

/**
 * 17. List Moderation Queue (moderator/owner, paginated)
 */
export async function getModerationQueue(id: string, page = 1, limit = 20): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}/submissions`, { params: { page, limit } });
  return response.data;
}

/**
 * 17b. Get My Submissions (member-facing, paginated)
 */
export async function getMySubmissions(id: string, page = 1, limit = 20): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}/submissions/my`, { params: { page, limit } });
  return response.data;
}

/**
 * 18. Approve Submission
 */
export async function approveSubmission(id: string, submissionId: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/submissions/${submissionId}/approve`, {});
  return response.data;
}

/**
 * 19. Reject Submission
 */
export async function rejectSubmission(id: string, submissionId: string, rejectionReason: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/submissions/${submissionId}/reject`, { rejectionReason });
  return response.data;
}

/**
 * 20. Create Announcement (multipart/form-data — supports image upload)
 */
export async function createAnnouncement(id: string, payload: {
  title: string;
  body: string;
  isPinned?: boolean;
  image?: File;
}): Promise<CommunityResponse> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('body', payload.body);
  if (payload.isPinned !== undefined) formData.append('isPinned', String(payload.isPinned));
  if (payload.image) formData.append('image', payload.image);

  const response = await apiClient.post<CommunityResponse>(
    `/api/communities/${id}/announcements`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
  );
  return response.data;
}

/**
 * 21. Update Announcement (multipart/form-data — supports image upload)
 */
export async function updateAnnouncement(id: string, announcementId: string, payload: {
  title?: string;
  body?: string;
  isPinned?: boolean;
  image?: File;
}): Promise<CommunityResponse> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.body !== undefined) formData.append('body', payload.body);
  if (payload.isPinned !== undefined) formData.append('isPinned', String(payload.isPinned));
  if (payload.image) formData.append('image', payload.image);

  const response = await apiClient.patch<CommunityResponse>(
    `/api/communities/${id}/announcements/${announcementId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 }
  );
  return response.data;
}

/**
 * 22. Delete Announcement
 */
export async function deleteAnnouncement(id: string, announcementId: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/communities/${id}/announcements/${announcementId}`);
  return response.data;
}

/**
 * 23. Like / Unlike Announcement (toggle)
 */
export async function likeAnnouncement(communityId: string, announcementId: string): Promise<{ success: boolean; data: { liked: boolean; likeCount: number } }> {
  const response = await apiClient.post(`/api/communities/${communityId}/announcements/${announcementId}/like`, {});
  return response.data;
}

/**
 * 24. Get Announcement Comments (paginated)
 */
export async function getAnnouncementComments(communityId: string, announcementId: string, page = 1, limit = 20): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(
    `/api/communities/${communityId}/announcements/${announcementId}/comments`,
    { params: { page, limit } }
  );
  return response.data;
}

/**
 * 25. Add Comment
 */
export async function addComment(communityId: string, announcementId: string, body: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(
    `/api/communities/${communityId}/announcements/${announcementId}/comments`,
    { body }
  );
  return response.data;
}

/**
 * 26. Delete Comment
 */
export async function deleteComment(communityId: string, announcementId: string, commentId: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(
    `/api/communities/${communityId}/announcements/${announcementId}/comments/${commentId}`
  );
  return response.data;
}

/**
 * 23. Get Invite Link
 */
export async function getInviteLink(id: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/communities/${id}/invite`);
  return response.data;
}

/**
 * 24. Regenerate Invite Token
 */
export async function regenerateInviteToken(id: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/invite/regenerate`, {});
  return response.data;
}

/**
 * 25. Create Content Directly
 */
export async function createCommunityContent(id: string, payload: any): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/content`, payload);
  return response.data;
}

/**
 * 26. Update Community Profile
 */
export async function updateCommunity(id: string, payload: {
  name?: string;
  description?: string;
  visibility?: 'public' | 'private';
  poster?: File;
}): Promise<CommunityResponse> {
  const formData = new FormData();
  if (payload.name) formData.append('name', payload.name);
  if (payload.description !== undefined) formData.append('description', payload.description);
  if (payload.visibility) formData.append('visibility', payload.visibility);
  if (payload.poster) formData.append('poster', payload.poster);

  const response = await apiClient.patch<CommunityResponse>(
    `/api/communities/${id}`, 
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
  );
  return response.data;
}

/**
 * 27. Assign / Revoke Moderator
 */
export async function updateMemberRole(id: string, userId: string, role: 'moderator' | 'member'): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/api/communities/${id}/members/${userId}/role`, { role });
  return response.data;
}

/**
 * 28. Transfer Ownership
 */
export async function transferOwnership(id: string, newOwnerId: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/communities/${id}/transfer-ownership`, { newOwnerId });
  return response.data;
}

/**
 * 29. Delete Community
 */
export async function deleteCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/communities/${id}`);
  return response.data;
}

/**
 * 30. Get Member Profile
 * All members see: id, firstname, lastname, bio, country, socialLinks, profilePicture, createdAt, community.role/joinedAt/submissionCount
 * Moderators/owners additionally see: email, phoneNumber, role, community.emailNotificationsEnabled
 */
export interface MemberProfileData {
  id: number;
  firstname: string;
  lastname: string;
  bio?: string;
  country?: string;
  socialLinks?: { twitter?: string; instagram?: string; [key: string]: string | undefined };
  profilePicture?: string;
  createdAt: string;
  // Moderator/owner only
  email?: string;
  phoneNumber?: string;
  role?: string;
  community: {
    role: string;
    joinedAt: string;
    submissionCount: number;
    // Moderator/owner only
    emailNotificationsEnabled?: boolean;
  };
}

export interface MemberProfileResponse {
  success: boolean;
  data: MemberProfileData;
}

export async function getMemberProfile(communityId: string, userId: string): Promise<MemberProfileResponse> {
  const response = await apiClient.get<MemberProfileResponse>(`/api/communities/${communityId}/members/${userId}`);
  return response.data;
}

// ── Community Content Linking (new two-step approach) ──────────────────────

interface LinkToCommunityPayload {
  communityId: string;
  communityVisibility?: 'community_only' | 'public';
}

/**
 * Link an uploaded video to a community
 * PATCH /api/videos/:videoId/community
 */
export async function linkVideoToCommunity(videoId: string, payload: LinkToCommunityPayload): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/videos/${videoId}/community`, payload);
  return response.data;
}

/**
 * Link an uploaded live class to a community
 * PATCH /api/live/:liveClassId/community
 */
export async function linkLiveClassToCommunity(liveClassId: string, payload: LinkToCommunityPayload): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/live/${liveClassId}/community`, payload);
  return response.data;
}

/**
 * Link an uploaded live series to a community
 * PATCH /api/live/series/:seriesId/community
 */
export async function linkLiveSeriesToCommunity(seriesId: string, payload: LinkToCommunityPayload): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/api/live/series/${seriesId}/community`, payload);
  return response.data;
}

/**
 * Link an uploaded freebie to a community
 * PATCH /api/freebies/:freebieId/community
 */
export async function linkFreebieToCommunity(freebieId: string, payload: LinkToCommunityPayload): Promise<CommunityResponse> {
  const response = await apiClient.patch<CommunityResponse>(`/api/freebies/${freebieId}/community`, payload);
  return response.data;
}
