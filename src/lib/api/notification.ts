import { apiClient } from './client';

export interface NotificationPreferences {
  userId: number;
  instantLiveClassEmails: boolean;
  dailyDigestEmails: boolean;
  weeklyDigestEmails: boolean;
  allowCreatorRelatedOnly: boolean;
  disableAllEmails: boolean;
}

export interface UpdateNotificationPreferencesPayload {
  instantLiveClassEmails?: boolean;
  dailyDigestEmails?: boolean;
  weeklyDigestEmails?: boolean;
  allowCreatorRelatedOnly?: boolean;
  disableAllEmails?: boolean;
}

export interface DigestQueueItem {
  id: number;
  userId: number;
  type: 'daily' | 'weekly';
  status: 'pending' | 'sent' | 'skipped' | 'failed';
  scheduledFor: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: number;
  userId: number;
  type: string;
  status: 'success' | 'failed' | 'skipped';
  messageId?: string;
  error?: string;
  createdAt: string;
}

export interface TriggerDigestResponse {
  success: boolean;
  data: {
    usersProcessed: number;
    emailsSent: number;
    emailsSkipped: number;
    failed: number;
  };
  message?: string;
}

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get('/api/notifications/preferences');
  return response.data.data;
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (
  payload: UpdateNotificationPreferencesPayload
): Promise<{ success: boolean; data: NotificationPreferences; message?: string }> => {
  const response = await apiClient.patch('/api/notifications/preferences', payload);
  return response.data;
};

/**
 * ADMIN: Get Digest Queue
 */
export const getAdminDigestQueue = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: DigestQueueItem[]; total: number }> => {
  const response = await apiClient.get('/api/notifications/digest-queue', { params });
  return response.data;
};

/**
 * ADMIN: Get Notification Logs
 */
export const getAdminNotificationLogs = async (params: {
  userId?: number;
  notificationType?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: NotificationLog[]; total: number }> => {
  const response = await apiClient.get('/api/notifications/logs', { params });
  return response.data;
};

/**
 * ADMIN: Trigger Digest Manually
 */
export const triggerAdminDigest = async (type: 'daily' | 'weekly'): Promise<TriggerDigestResponse> => {
  const response = await apiClient.post('/api/notifications/digest/trigger', { type });
  return response.data;
};
