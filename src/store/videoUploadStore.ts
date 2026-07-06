import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VideoUploadState } from '@/types/videoUpload';
import { UploadStep, VideoType, PrivacyType, AgeRestriction, UploadMode, CurrencyCode } from '@/types/videoUpload';

interface VideoUploadStore extends VideoUploadState {
  // Navigation
  setCurrentStep: (step: UploadStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Upload mode
  setUploadMode: (mode: UploadMode) => void;
  
  // File handling
  setSelectedFile: (file: File | null) => void;
  setThumbnailFile: (file: File | null) => void;
  setThumbnailPreview: (preview: string | null) => void;
  
  // Upload progress
  setUploadProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  setCancelled: (cancelled: boolean) => void;
  
  // Form data
  setVideoTitle: (title: string) => void;
  setVideoDescription: (description: string) => void;
  setVideoType: (type: VideoType) => void;
  setRestrictEmbedding: (restrict: boolean) => void;
  setPrice: (price: string) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setVideoDuration: (duration: number) => void;
  setCategory: (category: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setPrivacy: (privacy: PrivacyType) => void;
  setAgeRestriction: (restriction: AgeRestriction) => void;
  
  // Modal states
  setShowCancelModal: (show: boolean) => void;
  setIsPublishing: (isPublishing: boolean) => void;
  setPublishProgress: (progress: number) => void;
  setUploadComplete: (complete: boolean) => void;
  

  
  // Actions
  resetUpload: () => void;
  cancelUpload: () => void;
}

const initialState: VideoUploadState = {
  currentStep: UploadStep.FILE_UPLOAD,
  uploadMode: UploadMode.UPLOAD,
  videoDuration: 0,
  selectedFile: null,
  uploadProgress: 0,
  isUploading: false,
  isCancelled: false,
  videoTitle: '',
  videoDescription: '',
  thumbnailFile: null,
  thumbnailPreview: null,
  videoType: VideoType.LONG,
  restrictEmbedding: false,
  price: '',
  currency: CurrencyCode.NGN,
  category: '',
  tags: [],
  privacy: PrivacyType.PUBLIC,
  ageRestriction: AgeRestriction.NONE,
  showCancelModal: false,
  isPublishing: false,
  publishProgress: 0,
  uploadComplete: false,
  

};

export const useVideoUploadStore = create<VideoUploadStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const current = get().currentStep;
        if (current < UploadStep.VISIBILITY) {
          set({ currentStep: current + 1 });
        }
      },
      
      previousStep: () => {
        const current = get().currentStep;
        if (current > UploadStep.FILE_UPLOAD) {
          set({ currentStep: current - 1 });
        }
      },

      setUploadMode: (mode) => set({ uploadMode: mode }),

      setSelectedFile: (file) => set({ selectedFile: file }),
      
      setThumbnailFile: (file) => set({ thumbnailFile: file }),
      
      setThumbnailPreview: (preview) => set({ thumbnailPreview: preview }),

      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      
      setIsUploading: (isUploading) => set({ isUploading }),

      setCancelled: (cancelled) => set({ isCancelled: cancelled }),

      setVideoTitle: (title) => set({ videoTitle: title }),
      
      setVideoDescription: (description) => set({ videoDescription: description }),
      
      setVideoType: (type) => set({ videoType: type }),
      
      setRestrictEmbedding: (restrict) => set({ restrictEmbedding: restrict }),
      
      setPrice: (price) => set({ price }),
      
      setCurrency: (currency) => set({ currency }),
      
      setVideoDuration: (duration) => set({ videoDuration: duration }),
      
      setCategory: (category) => set({ category }),
      
      setTags: (tags) => set({ tags }),
      
      addTag: (tag) => {
        const tags = get().tags;
        if (!tags.includes(tag) && tag.trim()) {
          set({ tags: [...tags, tag.trim()] });
        }
      },
      
      removeTag: (tag) => {
        set({ tags: get().tags.filter(t => t !== tag) });
      },
      
      setPrivacy: (privacy) => set({ privacy }),
      
      setAgeRestriction: (restriction) => set({ ageRestriction: restriction }),

      setShowCancelModal: (show) => set({ showCancelModal: show }),
      
      setIsPublishing: (isPublishing) => set({ isPublishing }),
      
      setPublishProgress: (progress) => set({ publishProgress: progress }),
      
      setUploadComplete: (complete) => set({ uploadComplete: complete }),

      resetUpload: () => set(initialState),
      
      cancelUpload: () => {
        set({
          selectedFile: null,
          uploadProgress: 0,
          isUploading: false,
          isCancelled: true,
          showCancelModal: false,
        });
      },


    }),
    {
      name: 'video-upload-storage',
      partialize: (state) => ({
        videoTitle: state.videoTitle,
        videoDescription: state.videoDescription,
        videoType: state.videoType,
        category: state.category,
        tags: state.tags,
        privacy: state.privacy,
      }),
    }
  )
);