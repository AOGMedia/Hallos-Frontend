import { apiClient } from '@/lib/api/client';
import { AxiosError } from 'axios';
import type {
  Session,
  SessionFilters,
  GetSessionsResponse,
  GetSessionResponse,
  StartSessionResponse,
  JoinSessionResponse,
  EndSessionResponse,
} from '@/types/series';

function toError(e: unknown): Error {
  const err = e as AxiosError<{ message?: string }>;
  const msg = err.response?.data?.message || err.message || 'Request failed';
  return new Error(msg);
}

/**
 * Get all sessions for a specific series
 * @param seriesId - Series ID
 * @param filters - Optional filters (status, upcoming, past)
 * @returns Array of sessions
 */
export async function getSeriesSessions(
  seriesId: string,
  filters?: SessionFilters
): Promise<Session[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.upcoming) params.append('upcoming', 'true');
    if (filters?.past) params.append('past', 'true');

    const url = `/api/live/series/${seriesId}/sessions${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await apiClient.get<GetSessionsResponse>(url);

    console.log('Get series sessions response:', res.data);
    return res.data.sessions || [];
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Get detailed information about a specific session
 * @param sessionId - Session ID
 * @returns Session details
 */
export async function getSessionDetails(sessionId: string): Promise<Session> {
  try {
    const res = await apiClient.get<GetSessionResponse>(`/api/live/series/session/${sessionId}`);
    console.log('Get session details response:', res.data);
    return res.data.session;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Start a session (creator only)
 * Transitions session from 'scheduled' to 'live' and generates ZegoCloud credentials
 * @param sessionId - Session ID
 * @returns Start session response with room credentials
 */
export async function startSession(sessionId: string): Promise<StartSessionResponse> {
  try {
    const res = await apiClient.post<StartSessionResponse>(
      `/api/live/series/session/${sessionId}/start`
    );
    console.log('Start session response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Join a live session (participant)
 * Requires session to be 'live' and user to have access
 * @param sessionId - Session ID
 * @returns Join session response with room credentials
 */
export async function joinSession(sessionId: string): Promise<JoinSessionResponse> {
  try {
    const res = await apiClient.post<JoinSessionResponse>(
      `/api/live/series/session/${sessionId}/join`
    );
    console.log('Join session response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * End a session (creator only)
 * Transitions session from 'live' to 'ended'
 * @param sessionId - Session ID
 * @returns End session response
 */
export async function endSession(sessionId: string): Promise<EndSessionResponse> {
  try {
    const res = await apiClient.post<EndSessionResponse>(
      `/api/live/series/session/${sessionId}/end`
    );
    console.log('End session response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Get upcoming sessions for the authenticated user
 * Returns sessions from all series the user has access to
 * @returns Array of upcoming sessions
 */
export async function getUpcomingSessions(): Promise<Session[]> {
  try {
    const res = await apiClient.get<GetSessionsResponse>('/api/live/session/upcoming');
    console.log('Get upcoming sessions response:', res.data);
    return res.data.sessions || [];
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Get past sessions for the authenticated user
 * Returns completed sessions from all series the user has access to
 * @returns Array of past sessions
 */
export async function getPastSessions(): Promise<Session[]> {
  try {
    const res = await apiClient.get<GetSessionsResponse>('/api/live/sessions/past');
    console.log('Get past sessions response:', res.data);
    return res.data.sessions || [];
  } catch (e) {
    throw toError(e);
  }
}

/**
 * Cancel a specific session (creator only)
 * Transitions session from 'scheduled' to 'cancelled'
 * @param sessionId - Session ID
 * @returns Success response
 */
export async function cancelSession(sessionId: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/api/live/sessions/${sessionId}`
    );
    console.log('Cancel session response:', res.data);
    return res.data;
  } catch (e) {
    throw toError(e);
  }
}
