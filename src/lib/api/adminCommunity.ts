import { apiClient } from './client';
import type { CommunityResponse } from './community';

export interface AdminCommunitiesParams {
  status?: string;
  visibility?: string;
  name?: string;
  page?: number;
  limit?: number;
}

/**
 * 30. List All Communities (Admin)
 */
export async function getAdminCommunities(params: AdminCommunitiesParams): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>('/api/admin/communities', { params });
  return response.data;
}

/**
 * 31. Approve Community
 */
export async function approveCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/admin/communities/${id}/approve`);
  return response.data;
}

/**
 * 32. Reject Community
 */
export async function rejectCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/admin/communities/${id}/reject`);
  return response.data;
}

/**
 * 33. Suspend Community
 */
export async function suspendCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.post<CommunityResponse>(`/api/admin/communities/${id}/suspend`);
  return response.data;
}

/**
 * 34. View All Members (Admin)
 */
export async function getAdminCommunityMembers(id: string): Promise<CommunityResponse> {
  const response = await apiClient.get<CommunityResponse>(`/api/admin/communities/${id}/members`);
  return response.data;
}

/**
 * 35. Remove Any Member (Admin)
 */
export async function removeAdminCommunityMember(id: string, uid: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/admin/communities/${id}/members/${uid}`);
  return response.data;
}

/**
 * 36. Delete Community (Admin)
 */
export async function deleteAdminCommunity(id: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/admin/communities/${id}`);
  return response.data;
}

/**
 * 37. Delete Community Content (Admin)
 */
export async function deleteAdminCommunityContent(id: string, contentId: string, contentType: string): Promise<CommunityResponse> {
  const response = await apiClient.delete<CommunityResponse>(`/api/admin/communities/${id}/content/${contentId}`, {
    params: { contentType }
  });
  return response.data;
}
