import axios from 'axios';

// Base URL configuration - utilizing environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prod-api.aahbibi.com/api';

// Create axios instance with interceptor for auth
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); // Matches authStore setAuth
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Based on adminEnpoints.md "summary" object
export interface EnrollmentStats {
    total: number;
    credentialsSent: number;
    credentialsPending: number;
    byDepartment: Record<string, number>;
    byCurrency: Record<string, number>;
    // dailyTrend and topCourses seem missing from the sample in adminEnpoints.md
    // If they are needed for UI, we might need to derive them or request backend update.
    // For now, aligning strictly with what is seen in docs.
}

export interface Enrollment {
  id: string | number;
  courseId: string | number;
  userId: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  paymentProvider: string;
  paymentReference: string;
  amount: number;
  currency: string;
  credentialsSent: boolean;
  credentialsSentAt: string | null;
  enrolledAt: string;
  course: {
    id: number;
    name: string;
    department: {
      name: string;
    };
  };
}

// Session Recording Types
export interface SessionRecording {
  sessionNumber: number;
  driveLink: string;
}

export interface SendRecordingPayload {
  recordings: SessionRecording[];
  customMessage?: string;
  testEmail?: string;
}

export interface SendTestRecordingResponse {
  success: boolean;
  message: string;
  batchId?: string;
  student?: {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
  };
  sessionsSent?: number[];
  alreadyReceivedSessions?: number[];
}

export interface SendRecordingResponse {
  success: boolean;
  batchId: string;
  alreadySent: number;
  newlySent: number;
  failed: number;
  total: number;
  failedUsers?: { email: string; error: string }[];
}

export interface RecordingHistoryItem {
  batchId: string;
  sentAt: string;
  sessions: SessionRecording[];
  totalRecipients: number;
}

export interface GetRecordingHistoryResponse {
  success: boolean;
  count: number;
  history: RecordingHistoryItem[];
}

export const adminService = {
  // Removed standalone getStats as it is part of getEnrollments per docs

  getEnrollments: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    credentialsSent?: string;
    status?: string;
    departmentId?: string;
  } = {}) => {
    const response = await api.get<{
        success: boolean; 
        enrollments: Enrollment[];
        summary: EnrollmentStats;
        pagination: { total: number; pages: number; limit: number; offset: number; };
    }>('/api/admin/course-enrollments', {
      params: {
        limit: params.limit || 10,
        offset: ((params.page || 1) - 1) * (params.limit || 10),
        ...params,
      },
    });
    return response.data;
  },

  getEnrollmentDetails: async (id: string | number) => {
    const response = await api.get<{ success: boolean; enrollment: Enrollment }>(
      `/api/admin/course-enrollments/${id}`
    );
    return response.data;
  },

  markCredentialsSent: async (id: string | number, sent: boolean, notes?: string) => {
    const response = await api.patch(
      `/api/admin/course-enrollments/${id}/mark-sent`,
      { sent, notes: notes || null }
    );
    return response.data;
  },
  
  batchMarkSent: async (enrollmentIds: (string | number)[], sent: boolean, notes?: string) => {
      const response = await api.patch(
          '/api/admin/course-enrollments/batch-mark-sent',
          { enrollmentIds, sent, notes }
      );
      return response.data;
  },

  // Session Recording Endpoints
  sendTestRecording: async (seriesId: string, payload: SendRecordingPayload) => {
    const response = await api.post<SendTestRecordingResponse>(
      `/api/admin/live-series/${seriesId}/send-recording/test`,
      payload
    );
    return response.data;
  },

  sendRecordings: async (seriesId: string, payload: SendRecordingPayload) => {
    const response = await api.post<SendRecordingResponse>(
      `/api/admin/live-series/${seriesId}/send-recording`,
      payload
    );
    return response.data;
  },

  getRecordingHistory: async (seriesId: string) => {
    const response = await api.get<GetRecordingHistoryResponse>(
      `/api/admin/live-series/${seriesId}/recording-history`
    );
    return response.data;
  }
};
