import { CurrencyCode } from './videoUpload';
import type { LiveProvider } from '@/lib/live/providers';

export interface LiveEventState {
  liveEventTitle: string;
  liveEventDescription: string;
  liveEventPrice: string;
  liveEventCurrency: CurrencyCode;
  liveEventPrivacy: 'public' | 'private';
  liveEventStreamingProvider: LiveProvider;
  liveEventMaxParticipants: string;
  liveEventCategory: string;
  scheduleClass: boolean;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  hostEmails: string[];
  attendeeEmails: string[];
  liveEventThumbnail: File | null;
  liveEventThumbnailPreview: string | null;
}

export interface LiveEventFormData {
  title: string;
  price: string;
  currency: CurrencyCode;
  scheduleClass: boolean;
  scheduleDate?: string;
  startTime?: string;
  endTime?: string;
  thumbnailFile?: File;
  thumbnailPreview?: string;
  hostEmails: string[];
  attendeeEmails: string[];
}