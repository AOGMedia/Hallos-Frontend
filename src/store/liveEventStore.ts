import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LiveEventState } from '@/types/liveEvent';
import { CurrencyCode } from '@/types/videoUpload';

interface LiveEventStore extends LiveEventState {
  // Live event actions
  setLiveEventTitle: (title: string) => void;
  setLiveEventDescription: (description: string) => void;
  setLiveEventPrice: (price: string) => void;
  setLiveEventCurrency: (currency: CurrencyCode) => void;
  setLiveEventPrivacy: (privacy: 'public' | 'private') => void;
  setLiveEventStreamingProvider: (provider: 'mux' | 'zegocloud') => void;
  setLiveEventMaxParticipants: (maxParticipants: string) => void;
  setLiveEventCategory: (category: string) => void;
  setScheduleClass: (enabled: boolean) => void;
  setScheduleDate: (date: string) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  addHostEmail: (email: string) => void;
  removeHostEmail: (email: string) => void;
  addAttendeeEmail: (email: string) => void;
  removeAttendeeEmail: (email: string) => void;
  setLiveEventThumbnail: (file: File, preview: string) => void;
  resetLiveEventForm: () => void;
}

const initialState: LiveEventState = {
  liveEventTitle: '',
  liveEventDescription: '',
  liveEventPrice: '',
  liveEventCurrency: CurrencyCode.NGN,
  liveEventPrivacy: 'public',
  liveEventStreamingProvider: 'zegocloud',
  liveEventMaxParticipants: '50',
  liveEventCategory: '',
  scheduleClass: false,
  scheduleDate: '',
  startTime: '',
  endTime: '',
  hostEmails: [],
  attendeeEmails: [],
  liveEventThumbnail: null,
  liveEventThumbnailPreview: null,
};

export const useLiveEventStore = create<LiveEventStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLiveEventTitle: (title) => set({ liveEventTitle: title }),
      
      setLiveEventDescription: (description) => set({ liveEventDescription: description }),
      
      setLiveEventPrice: (price) => set({ liveEventPrice: price }),
      
      setLiveEventCurrency: (currency) => set({ liveEventCurrency: currency }),
      
      setLiveEventPrivacy: (privacy) => set({ liveEventPrivacy: privacy }),
      
      setLiveEventStreamingProvider: (provider) => set({ liveEventStreamingProvider: provider }),
      
      setLiveEventMaxParticipants: (maxParticipants) => set({ liveEventMaxParticipants: maxParticipants }),
      
      setLiveEventCategory: (category) => set({ liveEventCategory: category }),
      
      setScheduleClass: (enabled) => set({ scheduleClass: enabled }),
      
      setScheduleDate: (date) => set({ scheduleDate: date }),
      
      setStartTime: (time) => set({ startTime: time }),
      
      setEndTime: (time) => set({ endTime: time }),
      
      addHostEmail: (email) => {
        const emails = get().hostEmails;
        if (!emails.includes(email) && email.trim()) {
          set({ hostEmails: [...emails, email.trim()] });
        }
      },
      
      removeHostEmail: (email) => {
        set({ hostEmails: get().hostEmails.filter(e => e !== email) });
      },
      
      addAttendeeEmail: (email) => {
        const emails = get().attendeeEmails;
        if (!emails.includes(email) && email.trim()) {
          set({ attendeeEmails: [...emails, email.trim()] });
        }
      },
      
      removeAttendeeEmail: (email) => {
        set({ attendeeEmails: get().attendeeEmails.filter(e => e !== email) });
      },
      
      setLiveEventThumbnail: (file, preview) => {
        set({ 
          liveEventThumbnail: file,
          liveEventThumbnailPreview: preview 
        });
      },
      
      resetLiveEventForm: () => {
        set(initialState);
      },
    }),
    {
      name: 'live-event-storage',
      partialize: (state) => ({
        liveEventTitle: state.liveEventTitle,
        liveEventDescription: state.liveEventDescription,
        liveEventPrice: state.liveEventPrice,
        liveEventCurrency: state.liveEventCurrency,
        liveEventPrivacy: state.liveEventPrivacy,
        liveEventStreamingProvider: state.liveEventStreamingProvider,
        liveEventMaxParticipants: state.liveEventMaxParticipants,
        liveEventCategory: state.liveEventCategory,
      }),
    }
  )
);