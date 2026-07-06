import { apiClient } from './client'

export interface CreateLiveClassBody {
  title: string
  description?: string
  price?: number
  thumbnailUrl?: string
  startTime?: string
  endTime?: string
  privacy?: 'public' | 'private'
}

export interface LiveClass {
  id: string
  title: string
  description?: string
  price?: string
  thumbnailUrl?: string
  startTime?: string
  endTime?: string
  privacy?: 'public' | 'private'
  status?: 'scheduled' | 'live' | 'ended' | 'recorded'
  mux_stream_id?: string
  mux_stream_key?: string
  mux_rtmp_url?: string
  mux_playback_id?: string
  recording_asset_id?: string | null
  createdAt?: string
  updatedAt?: string
  userId?: number | string
  [key: string]: unknown
}

export interface CreateLiveClassResponse {
  success: boolean
  liveClass?: LiveClass
  message?: string
}

export interface HostRecord {
  id: string
  userId: number | string
  role: 'creator' | 'cohost'
  LiveClassId: string
}

export interface AttendeeRecord {
  id: string
  userId: number | string
  invitedBy?: number | string
  statusPaid?: boolean
  LiveClassId?: string
}

function getAuthHeaders() {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('auth_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function createLiveClass(body: CreateLiveClassBody): Promise<CreateLiveClassResponse> {
  const res = await apiClient.post<CreateLiveClassResponse>('/live/create', body, { headers: getAuthHeaders() })
  return res.data
}

export async function addHost(id: string, payload: { userId: number | string; role?: 'creator' | 'cohost' }) {
  const res = await apiClient.post<{ success: boolean; host?: HostRecord; message?: string }>(`/live/${id}/add-host`, payload, { headers: getAuthHeaders() })
  return res.data
}

export async function addAttendee(id: string, payload: { userId: number | string; invitedBy?: number | string; statusPaid?: boolean }) {
  const res = await apiClient.post<{ success: boolean; attendee?: AttendeeRecord; message?: string }>(`/live/${id}/add-attendee`, payload, { headers: getAuthHeaders() })
  return res.data
}

export async function getLiveClass(id: string): Promise<LiveClass> {
  const res = await apiClient.get<LiveClass>(`/live/${id}`, { headers: getAuthHeaders() })
  return res.data
}

export async function getLivePlaybackUrl(id: string): Promise<{ playbackUrl: string | null }> {
  const res = await apiClient.get<{ playbackUrl: string | null }>(`/live/${id}/playback`)
  return res.data
}

export async function listHosts(id: string): Promise<{ hosts: HostRecord[] }> {
  const res = await apiClient.get<{ hosts: HostRecord[] }>(`/live/${id}/hosts`, { headers: getAuthHeaders() })
  return res.data
}

export async function listAttendees(id: string): Promise<{ attendees: AttendeeRecord[] }> {
  const res = await apiClient.get<{ attendees: AttendeeRecord[] }>(`/live/${id}/attendees`, { headers: getAuthHeaders() })
  return res.data
}

export async function getMyLiveClasses(): Promise<{ liveClasses: LiveClass[] }> {
    const res = await apiClient.get<{ liveClasses: LiveClass[] }>('/live/my-classes', { headers: getAuthHeaders() })
    return res.data
}

export async function deleteLiveClass(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.delete(`/live/${id}`, { headers: getAuthHeaders() });
    return response.data;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosErr = error as { response?: { data?: unknown } };
      if (axiosErr.response?.data) {
        throw axiosErr.response.data;
      }
    }
    throw error;
  }
}