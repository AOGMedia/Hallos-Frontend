export enum UploadStep {
  FILE_UPLOAD = 1,
  VIDEO_DETAILS = 2,
  VIDEO_ELEMENTS = 3,
  VISIBILITY = 4
}

export enum VideoType {
  LONG = 'long',
  SHORT = 'short'
}

export enum PrivacyType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  SCHEDULED= 'scheduled'
}

export enum AgeRestriction {
  NONE = 'none',
  EIGHTEEN_PLUS = '18+'
}

export enum UploadMode {
  UPLOAD = 'upload',
  GO_LIVE = 'go_live'
}

// Props types
export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Currency codes enum
export enum CurrencyCode {
  NGN = 'NGN',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// Store types
export interface VideoUploadState {
  currentStep: UploadStep;
  uploadMode: UploadMode;
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  isCancelled: boolean;
  videoTitle: string;
  videoDescription: string;
  thumbnailFile: File | null;
  thumbnailPreview: string | null;
  videoType: VideoType;
  restrictEmbedding: boolean;
  price: string;
  currency: CurrencyCode;
  videoDuration: number;
  category: string;
  tags: string[];
  privacy: PrivacyType;
  ageRestriction: AgeRestriction;
  showCancelModal: boolean;
  isPublishing: boolean;
  publishProgress: number;
  uploadComplete: boolean;

}

// Query types (for future API integration)
export interface VideoUploadResponse {
  videoId: string;
  status: 'uploading' | 'processing' | 'complete' | 'failed';
  progress: number;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}