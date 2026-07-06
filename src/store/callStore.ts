import { create } from 'zustand';

export interface Participant {
  id: string;
  name: string;
  initials: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isHost: boolean;
  isSharingScreen?: boolean;
  stream?: MediaStream;
}

interface CallState {
  // Call state
  callDuration: number;
  isCallActive: boolean;
  isMicOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  participantCount: number;
  localStream: MediaStream | null;
  screenShareStream: MediaStream | null;
  sharingParticipantId: string | null;
  participants: Participant[];
  roomId: string | null;
  currentUserId: string;
  
  // Settings state
  userName: string;
  selectedCamera: string;
  selectedMicrophone: string;
  selectedSpeaker: string;

  // Actions
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  startScreenShare: (stream: MediaStream, participantId: string) => void;
  stopScreenShare: () => void;
  endCall: () => void;
  incrementCallDuration: () => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenShareStream: (stream: MediaStream | null) => void;
  setRoomId: (roomId: string) => void;
  setCurrentUserId: (userId: string) => void;
  setUserName: (name: string) => void;
  setSelectedCamera: (deviceId: string) => void;
  setSelectedMicrophone: (deviceId: string) => void;
  setSelectedSpeaker: (deviceId: string) => void;
  resetCallState: () => void;
}

const initialState = {
  callDuration: 0,
  isCallActive: false,
  isMicOn: true,
  isVideoOn: false,
  isScreenSharing: false,
  participantCount: 0,
  localStream: null,
  screenShareStream: null,
  sharingParticipantId: null,
  participants: [],
  roomId: null,
  currentUserId: 'user-1',
  userName: 'Alexandar Osaji',
  selectedCamera: '',
  selectedMicrophone: '',
  selectedSpeaker: '',
};

export const useCallStore = create<CallState>((set, get) => ({
  ...initialState,

  toggleMic: () => {
    const { isMicOn, localStream } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
    }
    set({ isMicOn: !isMicOn });
  },

  toggleCamera: () => {
    const { isVideoOn, localStream } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoOn;
      });
    }
    set({ isVideoOn: !isVideoOn });
  },

  toggleScreenShare: () => {
    const { isScreenSharing } = get();
    set({ isScreenSharing: !isScreenSharing });
  },

  startScreenShare: (stream, participantId) => {
    set({
      screenShareStream: stream,
      sharingParticipantId: participantId,
      isScreenSharing: true,
    });
    // Update the participant who is sharing
    get().updateParticipant(participantId, { isSharingScreen: true });
  },

  stopScreenShare: () => {
    const { screenShareStream, sharingParticipantId } = get();
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
    }
    if (sharingParticipantId) {
      get().updateParticipant(sharingParticipantId, { isSharingScreen: false });
    }
    set({
      screenShareStream: null,
      sharingParticipantId: null,
      isScreenSharing: false,
    });
  },

  endCall: () => {
    const { localStream, screenShareStream } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop());
    }
    set({ ...initialState });
  },

  incrementCallDuration: () => {
    set((state) => ({ callDuration: state.callDuration + 1 }));
  },

  addParticipant: (participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
      participantCount: state.participantCount + 1,
    }));
  },

  removeParticipant: (id) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
      participantCount: state.participantCount - 1,
    }));
  },

  updateParticipant: (id, updates) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  setLocalStream: (stream) => {
    set({ localStream: stream });
  },

  setScreenShareStream: (stream) => {
    set({ screenShareStream: stream });
  },

  setRoomId: (roomId) => {
    set({ roomId, isCallActive: true });
  },

  setCurrentUserId: (userId) => {
    set({ currentUserId: userId });
  },

  setUserName: (name) => {
    set({ userName: name });
  },

  setSelectedCamera: (deviceId) => {
    set({ selectedCamera: deviceId });
  },

  setSelectedMicrophone: (deviceId) => {
    set({ selectedMicrophone: deviceId });
  },

  setSelectedSpeaker: (deviceId) => {
    set({ selectedSpeaker: deviceId });
  },

  resetCallState: () => {
    set(initialState);
  },
}));