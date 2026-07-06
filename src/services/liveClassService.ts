import { apiClient } from '@/lib/api/client'
import type { AxiosError } from 'axios'
export type LiveStatus = 'scheduled' | 'live' | 'ended' | 'recorded'

export interface LiveClass {
  id: string
  title: string
  description?: string
  price?: string | number
  currency?: string
  thumbnailUrl?: string
  startTime?: string
  endTime?: string
  privacy?: 'public' | 'private'
  status?: LiveStatus
  streamingProvider?: 'mux' | 'zegocloud'
  // Mux-specific fields
  mux_stream_id?: string
  mux_stream_key?: string
  mux_rtmp_url?: string
  mux_playback_id?: string
  rtmp_url?: string
  stream_key?: string
  // ZegoCloud-specific fields
  zego_room_id?: string
  zego_app_id?: string
  max_participants?: number
  // Common fields
  playback_url?: string | null
  recording_asset_id?: string | null
  createdAt?: string
  updatedAt?: string
  userId?: number | string,
  username?: string,
  creatorName?: string
  // Helper fields
  isZegoCloud?: boolean
  isMux?: boolean
  category?: string
  isRegistered?: boolean
}

export interface Host {
  id: string
  userId: number | string
  role: 'creator' | 'cohost'
  LiveClassId: string
}

export interface Attendee {
  id: string
  userId: number | string
  invitedBy?: number | string
  statusPaid?: boolean
  LiveClassId?: string
}

export interface ParticipantEntry {
  id: string
  userId: number | string
  role?: 'creator' | 'cohost' | 'attendee'
  invitedBy?: number | string
  statusPaid?: boolean
}

export interface CreateLiveClassBody {
  title: string
  description?: string
  price?: number
  thumbnailUrl?: string
  startTime?: string
  endTime?: string
  privacy?: 'public' | 'private'
  streamingProvider?: 'mux' | 'zegocloud'
  maxParticipants?: number
  category?: string
}

export interface CreateLiveClassResponse {
  success: boolean
  liveClass?: LiveClass
  message?: string
}

function toError(e: unknown): Error {
  const err = e as AxiosError<{ message?: string }>
  const msg = err.response?.data?.message || err.message || 'Request failed'
  return new Error(msg)
}

export async function createLiveClass(body: CreateLiveClassBody, thumbnailFile?: File): Promise<CreateLiveClassResponse> {
  try {
    console.log('Creating live class with body:', body)
    if (thumbnailFile) {
      const fd = new FormData()
      fd.append('title', body.title)
      if (body.description) fd.append('description', body.description)
      if (typeof body.price === 'number') fd.append('price', String(body.price))
      if (body.startTime) fd.append('startTime', body.startTime)
      if (body.endTime) fd.append('endTime', body.endTime)
      if (body.privacy) fd.append('privacy', body.privacy)
      if (body.streamingProvider) fd.append('streamingProvider', body.streamingProvider)
      if (typeof body.maxParticipants === 'number') fd.append('maxParticipants', String(body.maxParticipants))
      if (body.category) fd.append('category', body.category)
      fd.append('thumbnailUrl', thumbnailFile)
      const res = await apiClient.post<CreateLiveClassResponse>('/live/create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Backend response:', res.data)
      return res.data
    }
    const res = await apiClient.post<CreateLiveClassResponse>('/live/create', body)
    console.log('Backend response:', res.data)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function addHost(id: string, payload: { userId: number | string; role?: 'creator' | 'cohost' }): Promise<{ success: boolean; host?: Host; message?: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; host?: Host; message?: string }>(`/live/${id}/add-host`, payload)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function addAttendee(id: string, payload: { userId: number | string; invitedBy?: number | string; statusPaid?: boolean }): Promise<{ success: boolean; attendee?: Attendee; message?: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; attendee?: Attendee; message?: string }>(`/live/${id}/add-attendee`, payload)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function getLiveClass(id: string): Promise<LiveClass> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.get<any>(`/live/${id}`)
    console.log('getLiveClass response:', res.data)
    
    // Map snake_case backend fields to camelCase frontend fields
    const data = res.data
    const mapped: LiveClass = {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency || 'NGN',
      thumbnailUrl: data.thumbnailUrl,
      startTime: data.startTime,
      endTime: data.endTime,
      privacy: data.privacy,
      status: data.status,
      streamingProvider: (data.streaming_provider || data.streamingProvider) as 'mux' | 'zegocloud' | undefined,
      // Mux fields
      mux_stream_id: data.mux_stream_id,
      mux_stream_key: data.mux_stream_key,
      mux_rtmp_url: data.mux_rtmp_url,
      mux_playback_id: data.mux_playback_id,
      rtmp_url: data.rtmp_url,
      stream_key: data.stream_key,
      // ZegoCloud fields
      zego_room_id: data.zego_room_id,
      zego_app_id: data.zego_app_id,
      max_participants: data.max_participants,
      // Common fields
      playback_url: data.playback_url,
      recording_asset_id: data.recording_asset_id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      userId: data.userId,
      creatorName: data.instructor?.name || data.creatorName || `${data.instructor?.firstname || ''} ${data.instructor?.lastname || ''}`.trim(),
      isZegoCloud: (data.streaming_provider || data.streamingProvider) === 'zegocloud',
      isMux: (data.streaming_provider || data.streamingProvider) === 'mux' || !(data.streaming_provider || data.streamingProvider),
      category: data.category,
      isRegistered: data.isRegistered,
    }
    
    console.log('Mapped live class:', mapped)
    return mapped
  } catch (e) {
    throw toError(e)
  }
}

export async function getPlaybackUrl(id: string): Promise<{ playbackUrl: string | null }> {
  try {
    const res = await apiClient.get<{ playbackUrl: string | null }>(`/live/${id}/playback`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function getPlaybackUrlExternal(id: string): Promise<{ playbackUrl: string | null }> {
  try {
    const res = await apiClient.get<{ playbackUrl: string | null }>(`/live/${id}/playback`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function getHosts(id: string): Promise<{ hosts: Host[] }> {
  try {
    const res = await apiClient.get<{ hosts: Host[] }>(`/live/${id}/hosts`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function getAttendees(id: string): Promise<{ attendees: Attendee[] }> {
  try {
    const res = await apiClient.get<{ attendees: Attendee[] }>(`/live/${id}/attendees`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function getParticipants(id: string): Promise<{ participants: ParticipantEntry[] }> {
  try {
    const res = await apiClient.get<{ participants: ParticipantEntry[] }>(`/live/${id}/participants`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function addAttendeeGlobal(payload: { liveClassId: string; userId: number | string; invitedBy?: number | string; statusPaid?: boolean }): Promise<{ success: boolean; attendee?: Attendee; message?: string }> {
  try {
    const res = await apiClient.post<{ success: boolean; attendee?: Attendee; message?: string }>(`/live/add-attendee`, payload)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

export async function listLiveClasses(): Promise<LiveClass[]> {
  try {
    const res = await apiClient.get(`/live`)
    const data = res.data as unknown
    const liveClasses = (data as { liveClasses?: unknown[] }).liveClasses
    const classes = (data as { classes?: unknown[] }).classes
    const arrCandidate: unknown[] = Array.isArray(liveClasses)
      ? liveClasses
      : Array.isArray(classes)
      ? classes
      : Array.isArray(data)
      ? (data as unknown[])
      : []
    return arrCandidate.map((raw) => {
      const obj = raw as Record<string, unknown>
      const hosts = Array.isArray(obj.hosts) ? obj.hosts : undefined
      const firstHost = Array.isArray(hosts) && hosts.length ? (hosts[0] as Record<string, unknown>) : undefined
      const user = firstHost?.User as Record<string, unknown> | undefined
      const creatorName = user ? `${String((user.firstname ?? '') as string).trim()} ${String((user.lastname ?? '') as string).trim()}`.trim() : undefined
      const userId = (firstHost?.userId ?? obj.userId) as number | string | undefined
      const statusRaw = obj.status as string | undefined
      const status: LiveStatus = statusRaw === 'live' ? 'live' : obj.recording_asset_id ? 'recorded' : statusRaw === 'ended' ? 'ended' : 'scheduled'
      const streamingProvider = (obj.streaming_provider || obj.streamingProvider) as 'mux' | 'zegocloud' | undefined
      const mapped: LiveClass = {
        id: String(obj.id),
        title: String(obj.title ?? ''),
        description: obj.description as string | undefined,
        price: (typeof obj.price === 'number' || typeof obj.price === 'string') ? obj.price : undefined,
        thumbnailUrl: obj.thumbnailUrl as string | undefined,
        startTime: obj.startTime as string | undefined,
        endTime: obj.endTime as string | undefined,
        privacy: obj.privacy as 'public' | 'private' | undefined,
        status,
        streamingProvider,
        // Mux fields
        mux_stream_id: obj.mux_stream_id as string | undefined,
        mux_stream_key: obj.mux_stream_key as string | undefined,
        mux_rtmp_url: obj.mux_rtmp_url as string | undefined,
        mux_playback_id: obj.mux_playback_id as string | undefined,
        // ZegoCloud fields
        zego_room_id: obj.zego_room_id as string | undefined,
        zego_app_id: obj.zego_app_id as string | undefined,
        max_participants: obj.max_participants as number | undefined,
        // Common fields
        recording_asset_id: obj.recording_asset_id as string | null | undefined,
        createdAt: obj.createdAt as string | undefined,
        updatedAt: obj.updatedAt as string | undefined,
        userId,
        creatorName,
        playback_url: (obj.playback_url as string | null | undefined) ?? null,
        isZegoCloud: streamingProvider === 'zegocloud',
        isMux: streamingProvider === 'mux' || !streamingProvider,
      }
      return mapped
    })
  } catch (e) {
    throw toError(e)
  }
}

export async function listLiveClassesExternal(): Promise<LiveClass[]> {
  try {
    const res = await apiClient.get('/live/getLive')
    const data = res.data as unknown
    // console.log('API Response (/live/getLive):', data)
    const liveClasses = (data as { liveClasses?: unknown[] }).liveClasses
    const classes = (data as { classes?: unknown[] }).classes
    const arrCandidate: unknown[] = Array.isArray(liveClasses)
      ? liveClasses
      : Array.isArray(classes)
      ? classes
      : Array.isArray(data)
      ? (data as unknown[])
      : []
    return arrCandidate.map((raw) => {
      const obj = raw as Record<string, unknown>
      const hosts = Array.isArray(obj.hosts) ? obj.hosts : undefined
      const firstHost = Array.isArray(hosts) && hosts.length ? (hosts[0] as Record<string, unknown>) : undefined
      const user = firstHost?.User as Record<string, unknown> | undefined
      const creatorName = user ? `${String((user.firstname ?? '') as string).trim()} ${String((user.lastname ?? '') as string).trim()}`.trim() : undefined
      const userId = (firstHost?.userId ?? obj.userId) as number | string | undefined
      const statusRaw = obj.status as string | undefined
      const status: LiveStatus = statusRaw === 'live' ? 'live' : obj.recording_asset_id ? 'recorded' : statusRaw === 'ended' ? 'ended' : 'scheduled'
      const streamingProvider = (obj.streaming_provider || obj.streamingProvider) as 'mux' | 'zegocloud' | undefined
      const mapped: LiveClass = {
        id: String(obj.id),
        title: String(obj.title ?? ''),
        description: obj.description as string | undefined,
        price: (typeof obj.price === 'number' || typeof obj.price === 'string') ? obj.price : undefined,
        thumbnailUrl: obj.thumbnailUrl as string | undefined,
        startTime: obj.startTime as string | undefined,
        endTime: obj.endTime as string | undefined,
        privacy: obj.privacy as 'public' | 'private' | undefined,
        status,
        streamingProvider,
        // Mux fields
        mux_stream_id: obj.mux_stream_id as string | undefined,
        mux_stream_key: obj.mux_stream_key as string | undefined,
        mux_rtmp_url: obj.mux_rtmp_url as string | undefined,
        mux_playback_id: obj.mux_playback_id as string | undefined,
        // ZegoCloud fields
        zego_room_id: obj.zego_room_id as string | undefined,
        zego_app_id: obj.zego_app_id as string | undefined,
        max_participants: obj.max_participants as number | undefined,
        // Common fields
        recording_asset_id: obj.recording_asset_id as string | null | undefined,
        createdAt: obj.createdAt as string | undefined,
        updatedAt: obj.updatedAt as string | undefined,
        userId,
        creatorName,
        playback_url: (obj.playback_url as string | null | undefined) ?? null,
        isZegoCloud: streamingProvider === 'zegocloud',
        isMux: streamingProvider === 'mux' || !streamingProvider,
        category: (obj.category || obj.Category) as string | undefined,
      }
      return mapped
    })
  } catch (e) {
    throw toError(e)
  }
}

// ── Live Class Registration ──────────────────────────────────────────

export interface LiveClassRegistration {
  id: string
  liveClassId: string
  userId: number
  statusPaid: boolean
  createdAt: string
}

export interface RegistrationEntry {
  userId: number
  firstname: string
  lastname: string
  email: string
  registrationType: 'paid' | 'free'
  amount?: number
  currency?: string
  registeredAt: string
}

export interface RegistrationsResponse {
  total: number
  totalFree: number
  totalPaid: number
  page: number
  limit: number
  registrations: RegistrationEntry[]
}

/** Secure a spot for a free live class */
export async function registerLiveClass(id: string): Promise<{ success: boolean; message: string; data?: LiveClassRegistration }> {
  try {
    const res = await apiClient.post(`/live/${id}/register`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

/** Cancel registration for a free live class */
export async function cancelLiveClassRegistration(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.delete(`/live/${id}/register`)
    return res.data
  } catch (e) {
    throw toError(e)
  }
}

/** Get registrations list (creator/admin only) */
export async function getLiveClassRegistrations(id: string, page = 1, limit = 20): Promise<RegistrationsResponse> {
  try {
    const res = await apiClient.get(`/live/${id}/registrations`, { params: { page, limit } })
    return res.data.data
  } catch (e) {
    throw toError(e)
  }
}
