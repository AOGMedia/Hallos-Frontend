import { CurrencyCode } from './videoUpload';

/**
 * Series Form State
 * 
 * Form state for creating/editinsg live series.
 * Extends the existing live event form patterns.
 */

export interface SeriesFormState {
  // Basic info (reused from single class)
  title: string;
  description: string;
  price: string;
  currency: CurrencyCode;
  privacy: 'public' | 'private';
  category: string;
  maxParticipants: string;
  thumbnail: File | null;
  thumbnailPreview: string | null;

  // Series-specific fields
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  recurrenceDays: string[]; // ['monday', 'wednesday', 'friday']
  startTime: string; // HH:MM format
  duration: string; // Duration in minutes (as string for form input)
}

export interface SeriesFormData {
  title: string;
  description?: string;
  price?: number;
  currency: CurrencyCode;
  privacy: 'public' | 'private';
  category?: string;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  recurrencePattern: {
    days: string[];
    startTime: string;
    duration: number;
  };
  thumbnailFile?: File;
}

export interface SeriesFormErrors {
  title?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  recurrenceDays?: string;
  startTime?: string;
  duration?: string;
}
