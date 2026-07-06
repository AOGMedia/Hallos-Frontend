import { create } from 'zustand'
import type { LiveClass, Host, Attendee } from '@/services/liveClassService'

export interface LiveClassState {
  localStream: MediaStream | null
  videoEnabled: boolean
  currentLiveClass: LiveClass | null
  playbackUrl: string | null
  hosts: Host[]
  attendees: Attendee[]
  setLocalStream: (stream: MediaStream | null) => void
  setVideoEnabled: (enabled: boolean) => void
  setCurrentLiveClass: (lc: LiveClass | null) => void
  setPlaybackUrl: (url: string | null) => void
  setHosts: (hosts: Host[]) => void
  setAttendees: (attendees: Attendee[]) => void
  reset: () => void
}

const initialState: Omit<LiveClassState,
  'setLocalStream' | 'setVideoEnabled' | 'setCurrentLiveClass' | 'setPlaybackUrl' | 'setHosts' | 'setAttendees' | 'reset'
> = {
  localStream: null,
  videoEnabled: false,
  currentLiveClass: null,
  playbackUrl: null,
  hosts: [],
  attendees: [],
}

export const useMeetingStore = create<LiveClassState>((set) => ({
  ...initialState,
  setLocalStream: (stream) => set({ localStream: stream }),
  setVideoEnabled: (enabled) => set({ videoEnabled: enabled }),
  setCurrentLiveClass: (lc) => set({ currentLiveClass: lc }),
  setPlaybackUrl: (url) => set({ playbackUrl: url }),
  setHosts: (hosts) => set({ hosts }),
  setAttendees: (attendees) => set({ attendees }),
  reset: () => set(initialState),
}))