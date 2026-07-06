import { create } from "zustand";

interface videoModalStore {
  isUploadModalOpen: boolean;
  communityId?: string | null;
  isAdmin?: boolean;
  openUploadModal: (communityId?: string, isAdmin?: boolean) => void;
  closeUploadModal: () => void;
  toggleUploadModal: () => void;
  // Community context for all content types (persists across navigation)
  pendingCommunityId?: string | null;
  pendingIsAdmin?: boolean;
  setCommunityContext: (communityId: string, isAdmin: boolean) => void;
  clearCommunityContext: () => void;
  // Initial mode for GoLiveStep
  goLiveInitialMode?: 'single' | 'series';
  setGoLiveInitialMode: (mode: 'single' | 'series') => void;
}

export const useVideoModalStore = create<videoModalStore>((set) => ({
  isUploadModalOpen: false,
  communityId: null,
  isAdmin: false,
  pendingCommunityId: null,
  pendingIsAdmin: false,
  goLiveInitialMode: 'single',

  openUploadModal: (communityId, isAdmin) => set({ isUploadModalOpen: true, communityId, isAdmin }),
  closeUploadModal: () => set({ isUploadModalOpen: false, communityId: null, isAdmin: false }),
  toggleUploadModal: () =>
    set((state) => ({ isUploadModalOpen: !state.isUploadModalOpen })),

  setCommunityContext: (communityId, isAdmin) => set({ pendingCommunityId: communityId, pendingIsAdmin: isAdmin }),
  clearCommunityContext: () => set({ pendingCommunityId: null, pendingIsAdmin: false }),
  setGoLiveInitialMode: (mode) => set({ goLiveInitialMode: mode }),
}));
