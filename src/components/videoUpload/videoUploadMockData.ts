import { UploadStep, VideoType, PrivacyType, AgeRestriction, UploadMode } from '@/types/videoUpload';
// Mock data for video upload store state
export const mockStore = {
  currentStep: UploadStep.FILE_UPLOAD as const,
  uploadMode: UploadMode.UPLOAD as const,
  selectedFile: null as File | null,
  uploadProgress: 0,
  isUploading: false,
  videoTitle: '',
  videoDescription: '',
  thumbnailFile: null as File | null,
  thumbnailPreview: null as string | null,
  videoType: VideoType.LONG as const,
  restrictEmbedding: false,
  price: '',
  category: '',
  tags: [] as string[],
  privacy: PrivacyType.PUBLIC as const,
  ageRestriction: AgeRestriction.NONE as const,
  showCancelModal: false,
  isPublishing: false,
  publishProgress: 0,
  uploadComplete: false
};

// Mock props for root component
export const mockRootProps = {
  isOpen: true,
  onClose: () => console.log('Close upload modal')
};