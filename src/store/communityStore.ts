import { create } from 'zustand';
import type { Community, CommunityTab } from '@/types/community';

interface CommunityState {
  selectedCommunity: Community | null;
  communities: Record<string, Community>;
  activeTab: CommunityTab;
  isCreateModalOpen: boolean;
  createStep: 1 | 2 | 3;
  searchQuery: string;
  activeNavTab: 'popular' | 'live-events' | 'my-communities';

  // Actions
  selectCommunity: (c: Community) => void;
  clearSelected: () => void;
  setActiveTab: (tab: CommunityTab) => void;
  openCreate: () => void;
  closeCreate: () => void;
  nextCreateStep: () => void;
  prevCreateStep: () => void;
  setSearch: (q: string) => void;
  setNavTab: (tab: 'popular' | 'live-events' | 'my-communities') => void;
  getCommunity: (id: string) => Community | undefined;
  joinCommunity: (id: string) => void;
  acceptRequest: (communityId: string, memberId: string) => void;
  declineRequest: (communityId: string, memberId: string) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  selectedCommunity: null,
  communities: {},
  activeTab: 'announcements',
  isCreateModalOpen: false,
  createStep: 1,
  searchQuery: '',
  activeNavTab: 'popular',

  selectCommunity: (c) => set({ selectedCommunity: c, activeTab: 'announcements' }),
  clearSelected: () => set({ selectedCommunity: null }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  openCreate: () => set({ isCreateModalOpen: true, createStep: 1 }),
  closeCreate: () => set({ isCreateModalOpen: false, createStep: 1 }),
  nextCreateStep: () => {
    const { createStep } = get();
    if (createStep < 3) set({ createStep: (createStep + 1) as 1 | 2 | 3 });
  },
  prevCreateStep: () => {
    const { createStep } = get();
    if (createStep > 1) set({ createStep: (createStep - 1) as 1 | 2 | 3 });
  },
  setSearch: (q) => set({ searchQuery: q }),
  setNavTab: (tab) => set({ activeNavTab: tab }),

  getCommunity: (id) => get().communities[id],

  joinCommunity: (id) => set((s) => ({
    selectedCommunity: s.selectedCommunity?.id === id
      ? { ...s.selectedCommunity, role: 'member' as const }
      : s.selectedCommunity,
    communities: s.communities[id]
      ? {
          ...s.communities,
          [id]: { ...s.communities[id], role: 'member' as const },
        }
      : s.communities,
  })),

  acceptRequest: (communityId, memberId) => set((s) => {
    const updatedSelected = (() => {
      if (s.selectedCommunity?.id !== communityId) return s.selectedCommunity;
      const req = s.selectedCommunity.joinRequests.find(r => r.id === memberId);
      if (!req) return s.selectedCommunity;
      return {
        ...s.selectedCommunity,
        members: [...s.selectedCommunity.members, { ...req, status: 'active' as const }],
        joinRequests: s.selectedCommunity.joinRequests.filter(r => r.id !== memberId),
      };
    })();

    const existing = s.communities[communityId];
    const updatedCommunities = existing
      ? (() => {
          const req = existing.joinRequests.find(r => r.id === memberId);
          if (!req) return s.communities;
          return {
            ...s.communities,
            [communityId]: {
              ...existing,
              members: [...existing.members, { ...req, status: 'active' as const }],
              joinRequests: existing.joinRequests.filter(r => r.id !== memberId),
            },
          };
        })()
      : s.communities;

    return { selectedCommunity: updatedSelected, communities: updatedCommunities };
  }),

  declineRequest: (communityId, memberId) => set((s) => {
    const updatedSelected = s.selectedCommunity?.id === communityId
      ? {
          ...s.selectedCommunity,
          joinRequests: s.selectedCommunity.joinRequests.filter(r => r.id !== memberId),
        }
      : s.selectedCommunity;

    const existing = s.communities[communityId];
    const updatedCommunities = existing
      ? {
          ...s.communities,
          [communityId]: {
            ...existing,
            joinRequests: existing.joinRequests.filter(r => r.id !== memberId),
          },
        }
      : s.communities;

    return { selectedCommunity: updatedSelected, communities: updatedCommunities };
  }),
}));
