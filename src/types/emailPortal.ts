export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
export type RecipientStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
export type SignupPreset = 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'custom';
export type TriState = 'yes' | 'no' | null;

export interface AudienceFilters {
  signup: { preset: SignupPreset | null; from?: string | null; to?: string | null };
  liveClassIds: string[];
  liveSeriesIds: string[];
  purchased: TriState;
  joinedLiveClass: TriState;
  includeAdmins: boolean;
}

export interface Audience {
  mode: 'filters' | 'selected';
  filters: AudienceFilters;
  userIds: number[];
  excludeUserIds: number[];
}

export interface AudienceUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface AudienceUsersPage {
  users: AudienceUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AudienceOptions {
  liveClasses: { id: string; title: string; startTime: string | null; attendees: number }[];
  liveSeries: { id: string; title: string; startDate: string | null; enrolled: number }[];
  totals: { allUsers: number; unsubscribed: number };
}

export interface CampaignCounts {
  pending: number;
  sent: number;
  failed: number;
  skipped: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader: string | null;
  bodyHtml?: string;
  audience: Audience;
  status: CampaignStatus;
  scheduledFor: string | null;
  startedAt: string | null;
  completedAt: string | null;
  totalRecipients: number;
  createdBy: number | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  counts: CampaignCounts;
}

export interface CampaignPayload {
  name: string;
  subject: string;
  preheader: string;
  bodyHtml: string;
  audience: Audience;
}

export interface CampaignList {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Recipient {
  id: string;
  userId: number | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: RecipientStatus;
  attempts: number;
  error: string | null;
  sentAt: string | null;
  updatedAt: string;
}

export interface RecipientPage {
  recipients: Recipient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendLimits {
  hourlyCap: number;
  dailyCap: number;
  sentLastHour: number;
  sentToday: number;
  remaining: number;
}

export interface PortalStats {
  campaigns: number;
  active: number;
  totalSent: number;
  totalFailed: number;
  unsubscribed: number;
  limits: SendLimits;
}

export interface PortalUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  sender: { host: string; from: string; dedicatedProvider: boolean };
}

export interface SendResult {
  campaign: Campaign;
  estimate: { recipients: number; hourlyCap: number; dailyCap: number; estimatedHours: number; estimatedDays: number };
}

export interface TestSendResult {
  email: string;
  ok: boolean;
  error?: string;
}

export const emptyAudience = (): Audience => ({
  mode: 'filters',
  filters: {
    signup: { preset: null, from: null, to: null },
    liveClassIds: [],
    liveSeriesIds: [],
    purchased: null,
    joinedLiveClass: null,
    includeAdmins: false,
  },
  userIds: [],
  excludeUserIds: [],
});
