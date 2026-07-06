import { apiClient } from '@/lib/api/client';
import type { AxiosError } from 'axios';
import type {
  Series,
  SeriesFilters,
  CreateSeriesResponse,
  ListSeriesResponse,
  GetSeriesResponse,
  UpdateSeriesResponse,
  CancelSeriesResponse,
} from '@/types/series';

function toError(e: unknown): Error {
  const err = e as AxiosError<{ message?: string }>;
  const msg = err.response?.data?.message || err.message || 'Request failed';
  return new Error(msg);
}

export interface CreateSeriesBody {
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  recurrencePattern: {
    days: string[]; // ['monday', 'wednesday', 'friday']
    startTime: string; // HH:MM
    duration: number; // minutes
  };
  privacy?: 'public' | 'private';
  maxParticipants?: number;
}

export interface UpdateSeriesBody {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  privacy?: 'public' | 'private';
  maxParticipants?: number;
}

/**
 * Create a new live series with auto-generated sessions
 */
export async function createSeries(
  body: CreateSeriesBody,
  thumbnailFile?: File
): Promise<CreateSeriesResponse> {
  try {
    console.log('Creating series with body:', body);

    if (thumbnailFile) {
      const fd = new FormData();
      fd.append('title', body.title);
      if (body.description) fd.append('description', body.description);
      if (typeof body.price === 'number') fd.append('price', String(body.price));
      if (body.currency) fd.append('currency', body.currency);
      if (body.category) fd.append('category', body.category);
      fd.append('startDate', body.startDate);
      fd.append('endDate', body.endDate);
      
      // IMPORTANT: Send recurrencePattern as a JSON string for FormData
      // The backend will need to parse this
      fd.append('recurrencePattern', JSON.stringify(body.recurrencePattern));
      
      if (body.privacy) fd.append('privacy', body.privacy);
      if (typeof body.maxParticipants === 'number') {
        fd.append('maxParticipants', String(body.maxParticipants));
      }
      fd.append('thumbnail', thumbnailFile);

      const res = await apiClient.post<CreateSeriesResponse>('/api/live/series/create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // console.log('Backend response:', res.data);
      return res.data;
    }

    // When no thumbnail, send as JSON (recurrencePattern will be an object)
    const res = await apiClient.post<CreateSeriesResponse>('/api/live/series/create', body);
    // console.log('Backend response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Get all public live series with optional filters
 */
export async function listSeries(filters?: SeriesFilters): Promise<Series[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.privacy) params.append('privacy', filters.privacy);
    if (filters?.category) params.append('category', filters.category);

    const url = `/api/live/series${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiClient.get<ListSeriesResponse>(url);

    // console.log('List series response:', res.data);
    return res.data.series || [];
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Get all series created by the authenticated user
 */
export async function getMySeries(filters?: SeriesFilters): Promise<Series[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const url = `/api/live/series/my-series${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiClient.get<ListSeriesResponse>(url);

    // console.log('My series response:', res.data);
    return res.data.series || [];
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Get detailed information about a specific series
 */
export async function getSeriesDetails(id: string): Promise<Series> {
  try {
    const res = await apiClient.get<GetSeriesResponse & { 
      isRegistered?: boolean; 
      hasAccess?: boolean; 
      accessReason?: string | null; 
      requiresPayment?: boolean;
    }>(`/api/live/series/${id}`);
    
    const series = res.data.series;
    if (series) {
      // Merge root-level fields if they exist (sometimes dynamic states are returned at root)
      if (res.data.isRegistered !== undefined) {
        series.isRegistered = res.data.isRegistered;
      }
      if (res.data.hasAccess !== undefined) {
        series.hasAccess = res.data.hasAccess;
      }
      if (res.data.accessReason !== undefined) {
        series.accessReason = res.data.accessReason as 'free_content' | 'creator' | 'purchased' | null;
      }
      if (res.data.requiresPayment !== undefined) {
        series.requiresPayment = res.data.requiresPayment;
      }
    }
    return series;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Update series metadata (only creator can update)
 */
export async function updateSeries(
  id: string,
  body: UpdateSeriesBody,
  thumbnailFile?: File
): Promise<UpdateSeriesResponse> {
  try {
    // console.log('Updating series with body:', body);

    if (thumbnailFile) {
      const fd = new FormData();
      if (body.title) fd.append('title', body.title);
      if (body.description) fd.append('description', body.description);
      if (typeof body.price === 'number') fd.append('price', String(body.price));
      if (body.category) fd.append('category', body.category);
      if (body.privacy) fd.append('privacy', body.privacy);
      if (typeof body.maxParticipants === 'number') {
        fd.append('maxParticipants', String(body.maxParticipants));
      }
      fd.append('thumbnail', thumbnailFile);

      const res = await apiClient.put<UpdateSeriesResponse>(`/api/live/series/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // console.log('Backend response:', res.data);
      return res.data;
    }

    const res = await apiClient.put<UpdateSeriesResponse>(`/api/live/series/${id}`, body);
    // console.log('Backend response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Cancel a series (only creator can cancel)
 */
export async function cancelSeries(id: string): Promise<CancelSeriesResponse> {
  try {
    const res = await apiClient.delete<CancelSeriesResponse>(`/api/live/series/${id}`);
    // console.log('Cancel series response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

// ── Series Registration ──────────────────────────────────────────────

export interface SeriesRegistrationEntry {
  userId: number;
  firstname: string;
  lastname: string;
  email: string;
  registrationType: 'paid' | 'free';
  amount?: number;
  currency?: string;
  registeredAt: string;
}

export interface SeriesRegistrationsResponse {
  total: number;
  totalFree: number;
  totalPaid: number;
  page: number;
  limit: number;
  registrations: SeriesRegistrationEntry[];
}

/** Secure a spot for a free live series */
export async function registerSeries(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post(`/api/live/series/${id}/register`);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/** Cancel registration for a free live series */
export async function cancelSeriesRegistration(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.delete(`/api/live/series/${id}/register`);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/** Get series registrations list (creator/admin only) */
export async function getSeriesRegistrations(id: string, page = 1, limit = 20): Promise<SeriesRegistrationsResponse> {
  try {
    const res = await apiClient.get(`/api/live/series/${id}/registrations`, { params: { page, limit } });
    return res.data.data;
  } catch (e) {
    throw toError(e);
  }
}
