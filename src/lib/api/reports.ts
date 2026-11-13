import { apiClient } from './client';

export type ReportTargetType = 'video' | 'freebie' | 'live_class' | 'live_series' | 'community' | 'user';

export type ReportReason =
  | 'spam'
  | 'scam'
  | 'harassment'
  | 'hate'
  | 'sexual'
  | 'violence'
  | 'copyright'
  | 'misleading'
  | 'other';

export const REPORT_REASONS: Array<{ value: ReportReason; label: string; hint: string }> = [
  { value: 'scam', label: 'Scam or fraud', hint: 'Takes money or details under false pretences' },
  { value: 'spam', label: 'Spam', hint: 'Repetitive, irrelevant or promotional' },
  { value: 'misleading', label: 'Misleading', hint: 'Not what it claims to be' },
  { value: 'copyright', label: 'Stolen content', hint: 'Someone else’s work without permission' },
  { value: 'harassment', label: 'Harassment or bullying', hint: 'Targets or threatens a person' },
  { value: 'hate', label: 'Hate speech', hint: 'Attacks people for who they are' },
  { value: 'sexual', label: 'Sexual content', hint: 'Nudity or sexual material' },
  { value: 'violence', label: 'Violence or harm', hint: 'Threats, gore or self-harm' },
  { value: 'other', label: 'Something else', hint: 'Tell us below' },
];

export const reportsApi = {
  create: async (input: { targetType: ReportTargetType; targetId: string | number; reason: ReportReason; details?: string }) => {
    const { data } = await apiClient.post<{ success: boolean; data?: { received: boolean; duplicate: boolean } }>(
      '/api/reports',
      { ...input, targetId: String(input.targetId) }
    );
    return data;
  },
};
