import axios, { AxiosError } from 'axios';
import { getPortalToken } from '@/lib/emailPortalSession';
import type {
  Audience,
  AudienceOptions,
  AudienceUsersPage,
  AudienceUser,
  Campaign,
  CampaignList,
  CampaignPayload,
  PortalStats,
  PortalUser,
  RecipientPage,
  SendResult,
  TestSendResult,
} from '@/types/emailPortal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://prod-api.aahbibi.com/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = getPortalToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

const unwrap = async <T,>(request: Promise<{ data: Envelope<T> }>): Promise<T> => (await request).data.data;

/** Turns any thrown API error into a message that is safe to show to the user. */
export const portalErrorMessage = (error: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError?.response?.data?.message || fallback;
};

export const emailPortalService = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: { id: number | string; role?: string; firstname: string; lastname: string } }>(
      '/auth/login',
      { email, password }
    );
    return response.data;
  },

  me: () => unwrap<PortalUser>(api.get('/api/email-portal/me')),
  stats: () => unwrap<PortalStats>(api.get('/api/email-portal/stats')),

  audienceOptions: () => unwrap<AudienceOptions>(api.get('/api/email-portal/audience/options')),
  previewAudience: (audience: Audience) =>
    unwrap<{ total: number; sample: AudienceUser[] }>(api.post('/api/email-portal/audience/preview', { audience })),
  audienceUsers: (audience: Audience, params: { search?: string; page?: number; limit?: number } = {}) =>
    unwrap<AudienceUsersPage>(api.post('/api/email-portal/audience/users', { audience, ...params })),

  listCampaigns: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    unwrap<CampaignList>(api.get('/api/email-portal/campaigns', { params })),
  getCampaign: (id: string) => unwrap<Campaign>(api.get(`/api/email-portal/campaigns/${id}`)),
  createCampaign: (payload: CampaignPayload) => unwrap<Campaign>(api.post('/api/email-portal/campaigns', payload)),
  updateCampaign: (id: string, payload: CampaignPayload) =>
    unwrap<Campaign>(api.put(`/api/email-portal/campaigns/${id}`, payload)),
  deleteCampaign: (id: string) => unwrap<{ deleted: boolean }>(api.delete(`/api/email-portal/campaigns/${id}`)),

  sendTest: (payload: { subject: string; preheader: string; bodyHtml: string; to: string[] }) =>
    unwrap<TestSendResult[]>(api.post('/api/email-portal/test', payload)),
  sendCampaign: (id: string, scheduledFor?: string | null) =>
    unwrap<SendResult>(api.post(`/api/email-portal/campaigns/${id}/send`, { scheduledFor: scheduledFor || undefined })),
  cancelCampaign: (id: string) => unwrap<Campaign>(api.post(`/api/email-portal/campaigns/${id}/cancel`)),
  retryFailed: (id: string) =>
    unwrap<{ retried: number; campaign: Campaign }>(api.post(`/api/email-portal/campaigns/${id}/retry-failed`)),

  listRecipients: (id: string, params: { status?: string; search?: string; page?: number; limit?: number } = {}) =>
    unwrap<RecipientPage>(api.get(`/api/email-portal/campaigns/${id}/recipients`, { params })),

  downloadRecipientsCsv: async (id: string, name: string) => {
    const response = await api.get(`/api/email-portal/campaigns/${id}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^\w-]+/g, '_').slice(0, 60) || 'campaign'}-recipients.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
