import { apiClient } from '@/lib/api/client'
import type { AxiosError, AxiosProgressEvent } from 'axios'
import {
  JSON_CREATE_TIMEOUT_MS,
  MULTIPART_CREATE_TIMEOUT_MS,
  progressFraction,
  supportsIdempotentCreate,
  toCreateError,
  withNetworkRetry,
  type CreateRequestOptions,
} from '@/lib/api/resilientCreate'
import type { LegacyLiveProvider, LiveProvider } from '@/lib/live/providers'
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
  /** A current provider, or 'mux' on legacy classes (see lib/live/providers). */
  streamingProvider?: LiveProvider | LegacyLiveProvider
  // ZegoCloud-specific fields
  zego_room_id?: string
  zego_app_id?: string
  max_participants?: number
  // Common fields
  recording_asset_id?: string | null
  createdAt?: string
  updatedAt?: string
  userId?: number | string,
  username?: string,
  creatorName?: string
  // Helper fields
  isZegoCloud?: boolean
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
  /**
   * Always sent explicitly (required) so no caller can omit it and fall back
   * to a server-side default. Allowed values live in lib/live/providers.
   */
  streamingProvider: LiveProvider
  maxParticipants?: number
  category?: string
}

export interface CreateLiveClassResponse {
  success: boolean
  liveClass?: LiveClass
  message?: string
  idempotentReplay?: boolean
}

function toError(e: unknown): Error {
  const err = e as AxiosError<{ message?: string }>
  const msg = err.response?.data?.message || err.message || 'Request failed'
  return new Error(msg)
}

export async function createLiveClass(
  body: CreateLiveClassBody,
  thumbnailFile?: File,
  options?: CreateRequestOptions
): Promise<CreateLiveClassResponse> {
  const idempotencyKey = options?.idempotencyKey
  const send = async (): Promise<CreateLiveClassResponse> => {
    if (thumbnailFile) {
      const fd = new FormData()
      fd.append('title', body.title)
      if (body.description) fd.append('description', body.description)
      if (typeof body.price === 'number') fd.append('price', String(body.price))
      if (body.startTime) fd.append('startTime', body.startTime)
      if (body.endTime) fd.append('endTime', body.endTime)
      if (body.privacy) fd.append('privacy', body.privacy)
      fd.append('streamingProvider', body.streamingProvider)
      if (typeof body.maxParticipants === 'number') fd.append('maxParticipants', String(body.maxParticipants))
      if (body.category) fd.append('category', body.category)
      if (idempotencyKey) fd.append('idempotencyKey', idempotencyKey)
      fd.append('thumbnailUrl', thumbnailFile)
      const onProgress = options?.onUploadProgress
      const res = await apiClient.post<CreateLiveClassResponse>('/live/create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...(options ? { timeout: MULTIPART_CREATE_TIMEOUT_MS } : {}),
        ...(onProgress
          ? {
              onUploadProgress: (e: AxiosProgressEvent) => {
                const fraction = progressFraction(e)
                if (fraction !== undefined) onProgress(fraction)
              },
            }
          : {}),
      })
      console.log('Backend response:', res.data)
      return res.data
    }
    const res = await apiClient.post<CreateLiveClassResponse>(
      '/live/create',
      idempotencyKey ? { ...body, idempotencyKey } : body,
      options ? { timeout: JSON_CREATE_TIMEOUT_MS } : undefined
    )
    console.log('Backend response:', res.data)
    return res.data
  }

  try {
    console.log('Creating live class with body:', body)
    if (!idempotencyKey) return await send()
    return await withNetworkRetry(send, {
      canRetry: () => supportsIdempotentCreate('liveClass'),
      onStatus: options?.onRetryStatus,
    })
  } catch (e) {
    throw options ? toCreateError(e) : toError(e)
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
      streamingProvider: (data.streaming_provider || data.streamingProvider) as LiveClass['streamingProvider'],
      // ZegoCloud fields
      zego_room_id: data.zego_room_id,
      zego_app_id: data.zego_app_id,
      max_participants: data.max_participants,
      // Common fields
      recording_asset_id: data.recording_asset_id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      userId: data.userId,
      creatorName: data.instructor?.name || data.creatorName || `${data.instructor?.firstname || ''} ${data.instructor?.lastname || ''}`.trim(),
      isZegoCloud: (data.streaming_provider || data.streamingProvider) === 'zegocloud',
      category: data.category,
      isRegistered: data.isRegistered,
    }
    
    console.log('Mapped live class:', mapped)
    return mapped
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
      const streamingProvider = (obj.streaming_provider || obj.streamingProvider) as LiveClass['streamingProvider']
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
        isZegoCloud: streamingProvider === 'zegocloud',
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
      const streamingProvider = (obj.streaming_provider || obj.streamingProvider) as LiveClass['streamingProvider']
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
        isZegoCloud: streamingProvider === 'zegocloud',
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
