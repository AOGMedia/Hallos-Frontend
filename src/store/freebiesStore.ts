import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { freebiesService } from '@/services/freebiesService';

interface UploadedLink {
  url: string;
  title: string;
  isFreePreview: boolean;
}

interface UploadedFile {
  file: File;
  isFreePreview: boolean;
}

interface FreebiesState {
  // UI State
  selectedFreebieId: string | null;
  isDetailModalOpen: boolean;
  isUploadModalOpen: boolean;
  
  // Saved Data State (will be persisted)
  savedIds: string[];

  // Upload State
  uploadStep: 1 | 2 | 3;
  uploadedFiles: UploadedFile[];
  uploadedLinks: UploadedLink[];
  isUploading: boolean;
  uploadError: string | null;

  // Actions
  setSelectedFreebieId: (id: string | null) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  toggleSaveLocally: (id: string) => void;

  // Upload Actions
  openUpload: () => void;
  closeUpload: () => void;
  nextUploadStep: () => void;
  prevUploadStep: () => void;
  addFiles: (files: File[]) => void;
  toggleFilePreview: (index: number) => void;
  removeFile: (index: number) => void;
  addLink: (link: UploadedLink) => void;
  toggleLinkPreview: (index: number) => void;
  removeLink: (index: number) => void;
  resetUpload: () => void;
  handleUpload: (title: string, description: string, estimatedReadingTime: number, price: number, currency: string) => Promise<{ success: boolean; message?: string }>;
}

export const useFreebiesStore = create<FreebiesState>()(
  persist(
    (set, get) => ({
      selectedFreebieId: null,
      isDetailModalOpen: false,
      isUploadModalOpen: false,

      savedIds: [],

      uploadStep: 1,
      uploadedFiles: [],
      uploadedLinks: [],
      isUploading: false,
      uploadError: null,

      setSelectedFreebieId: (id) => set({ selectedFreebieId: id }),
      setIsDetailModalOpen: (open) => set({ isDetailModalOpen: open }),
      
      openDetail: (id) => set({ selectedFreebieId: id, isDetailModalOpen: true }),
      closeDetail: () => set({ selectedFreebieId: null, isDetailModalOpen: false }),

      toggleSaveLocally: (id: string) => {
        set((state) => {
          const isCurrentlySaved = state.savedIds.includes(id);
          const newSavedIds = isCurrentlySaved 
            ? state.savedIds.filter(savedId => savedId !== id)
            : [...state.savedIds, id];

          return { savedIds: newSavedIds };
        });
      },

      openUpload: () => set({ isUploadModalOpen: true, uploadStep: 1, uploadedFiles: [], uploadedLinks: [], uploadError: null }),
      closeUpload: () => set({ isUploadModalOpen: false }),

      nextUploadStep: () => {
        const { uploadStep } = get();
        if (uploadStep < 3) set({ uploadStep: (uploadStep + 1) as 1 | 2 | 3 });
      },
      prevUploadStep: () => {
        const { uploadStep } = get();
        if (uploadStep > 1) set({ uploadStep: (uploadStep - 1) as 1 | 2 | 3 });
      },

      addFiles: (files) => set((s) => ({ uploadedFiles: [...s.uploadedFiles, ...files.map(f => ({ file: f, isFreePreview: false }))] })),
      toggleFilePreview: (index) => set((s) => ({
        uploadedFiles: s.uploadedFiles.map((f, i) => i === index ? { ...f, isFreePreview: !f.isFreePreview } : f)
      })),
      removeFile: (index) =>
        set((s) => ({ uploadedFiles: s.uploadedFiles.filter((_, i) => i !== index) })),

      addLink: (link) => set((s) => ({ uploadedLinks: [...s.uploadedLinks, link] })),
      toggleLinkPreview: (index) => set((s) => ({
        uploadedLinks: s.uploadedLinks.map((l, i) => i === index ? { ...l, isFreePreview: !l.isFreePreview } : l)
      })),
      removeLink: (index) => 
        set((s) => ({ uploadedLinks: s.uploadedLinks.filter((_, i) => i !== index) })),

      resetUpload: () => set({ uploadStep: 1, uploadedFiles: [], uploadedLinks: [], uploadError: null, isUploading: false }),

      handleUpload: async (title, description, estimatedReadingTime, price, currency) => {
        set({ isUploading: true, uploadError: null });
        try {
          const { uploadedFiles, uploadedLinks } = get();
          
          const formData = new FormData();
          formData.append('title', title);
          formData.append('description', description);
          formData.append('estimatedReadingTime', estimatedReadingTime.toString());
          formData.append('price', price.toString());
          formData.append('currency', currency);
          
          if (uploadedLinks.length > 0) {
            formData.append('links', JSON.stringify(uploadedLinks));
          }

          const filePreviews = uploadedFiles.map(f => f.isFreePreview);
          formData.append('filePreviews', JSON.stringify(filePreviews));

          uploadedFiles.forEach(f => {
            formData.append('files', f.file);
          });

          const res = await freebiesService.uploadFreebie(formData);
          if (res.success) {
            let communityMsg = "";
            
            // If uploaded from a community context, link it to the community
            const { useVideoModalStore } = await import('@/store/videoModalStore');
            const { pendingCommunityId, clearCommunityContext } = useVideoModalStore.getState();
            if (pendingCommunityId) {
              try {
                const { linkFreebieToCommunity } = await import('@/lib/api/community');
                const freebieId = res.freebie?.id;
                if (freebieId) {
                  const linkRes = await linkFreebieToCommunity(String(freebieId), {
                    communityId: pendingCommunityId,
                    communityVisibility: 'community_only',
                  });
                  
                  if (linkRes.queued) {
                    communityMsg = linkRes.message || "Your resource has been submitted for moderator review.";
                  } else {
                    communityMsg = "Content added to community";
                  }
                }
                const { queryClient } = await import('@/lib/queryClient');
                queryClient.invalidateQueries({ queryKey: ['communityContent', pendingCommunityId] });
              } catch (err) {
                console.error('Failed to link freebie to community:', err);
              } finally {
                clearCommunityContext();
              }
            }

            get().closeUpload();
            return { success: true, message: communityMsg };
          }
          return { success: false };
        } catch (err: unknown) {
          console.error('Failed to upload freebie:', err);
          const e = err as { message?: string, response?: { data?: { message?: string } } };
          set({ uploadError: e.response?.data?.message || e.message || 'Failed to upload freebie.' });
          return { success: false };
        } finally {
          set({ isUploading: false });
        }
      }
    }),
    {
      name: 'freebies-saved-storage',
      partialize: (state) => ({ savedIds: state.savedIds }), // Only persist the saved IDs
    }
  )
);
