/**
 * Series Types
 * 
 * Type definitions for live series (recurring live classes) feature.
 * These types align with the backend API documented in frontend/src/live_series.md
 */

/**
 * Recurrence pattern defining when sessions occur
 */
export interface RecurrencePattern {
  /** Days of week when sessions occur (lowercase) */
  days: string[]; // ['monday', 'wednesday', 'friday']
  /** Session start time in HH:MM format (24-hour) */
  startTime: string; // 'HH:MM'
  /** Session duration in minutes */
  duration: number;
}

/**
 * Creator information
 */
export interface SeriesCreator {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

/**
 * Next session information
 */
export interface NextSession {
  id: string;
  sessionNumber: number;
  scheduledStartTime: string; // ISO date string
}

/**
 * Active session information
 */
export interface ActiveSession {
  id: string;
  sessionNumber: number;
}

/**
 * Series statistics
 */
export interface SeriesStats {
  totalSessions: number;
  completedSessions: number;
  liveSessions: number;
  scheduledSessions: number;
  cancelledSessions: number;
  completionPercentage: number;
  nextSession?: NextSession;
  activeSession?: ActiveSession | null;
}

/**
 * Pricing structure with dual currency support
 */
export interface SeriesPricing {
  base: {
    amount: number;
    currency: string;
  };
  ngn: number;
  usd: number;
  NGN?: number;
  USD?: number;
}

/**
 * Live series (recurring live class)
 */
export interface Series {
  id: string;
  userId: number;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  price: number; // Price in kobo/cents
  currency: string; // 'NGN', 'USD', etc.
  pricing?: SeriesPricing; // New dual currency pricing structure
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  recurrencePattern: RecurrencePattern;
  privacy: 'public' | 'private';
  maxParticipants: number;
  status: 'active' | 'cancelled';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  creator?: SeriesCreator;
  stats?: SeriesStats;
  hasAccess?: boolean; // Whether current user has access
  accessReason?: 'free_content' | 'creator' | 'purchased' | null; // Reason for access
  requiresPayment?: boolean; // Whether payment is required
  isLive?: boolean; // Whether series has any live sessions happening now
  isRegistered?: boolean; // Whether current user has registered for this free series
}

/**
 * Series information embedded in session
 */
export interface SessionSeriesInfo {
  id: string;
  title: string;
  userId: number;
  description?: string;
  price?: number;
  currency?: string;
  thumbnailUrl?: string;
  creator?: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

/**
 * Individual session within a series
 */
export interface Session {
  id: string;
  seriesId: string;
  sessionNumber: number;
  scheduledStartTime: string; // ISO date string
  scheduledEndTime: string; // ISO date string
  actualStartTime?: string; // ISO date string
  actualEndTime?: string; // ISO date string
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  zegoRoomId?: string;
  zegoAppId?: string;
  recordingUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  series?: SessionSeriesInfo;
  hasAccess?: boolean; // Whether current user has access
  requiresPayment?: boolean; // Whether payment is required
}

/**
 * API Response Types
 */

export interface CreateSeriesResponse {
  success: boolean;
  message: string;
  series: Series;
}

export interface ListSeriesResponse {
  success: boolean;
  count: number;
  series: Series[];
}

export interface GetSeriesResponse {
  success: boolean;
  series: Series;
}

export interface UpdateSeriesResponse {
  success: boolean;
  message: string;
  series: Partial<Series>;
}

export interface CancelSeriesResponse {
  success: boolean;
  message: string;
}

export interface GetSessionsResponse {
  success: boolean;
  count: number;
  sessions: Session[];
}

export interface GetSessionResponse {
  success: boolean;
  session: Session;
}

export interface StartSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    sessionNumber: number;
    roomId: string;
    appId: string;
    creatorToken: string;
    series: {
      id: string;
      title: string;
    };
  };
}

export interface JoinSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    sessionNumber: number;
    roomId: string;
    appId: string;
    token: string;
    role: 'participant';
    userInfo: {
      displayName: string;
      avatar: string | null;
      email: string;
    };
    session: {
      scheduledStartTime: string;
      scheduledEndTime: string;
    };
    series: {
      id: string;
      title: string;
      description: string;
    };
  };
}

export interface EndSessionResponse {
  success: boolean;
  message: string;
  data: {
    sessionId: string;
    sessionNumber: number;
    endedAt: string;
  };
}

/**
 * Filter types for API queries
 */

export interface SeriesFilters {
  status?: 'active' | 'cancelled';
  privacy?: 'public' | 'private';
  category?: string;
}

export interface SessionFilters {
  status?: 'scheduled' | 'live' | 'ended' | 'cancelled';
  upcoming?: boolean;
  past?: boolean;
}
