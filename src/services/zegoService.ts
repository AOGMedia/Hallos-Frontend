import { apiClient } from "@/lib/api/client";

/**
 * Types
 */
export type LiveRole = "creator" | "participant" | "audience";
export type LivePrivacy = "public" | "private";

export interface JoinRoomResponse {
  token: string;
  kitToken?: string; // Fallback for transition
  role: string;
  roomId: string;
  userId: string;
  userName: string;
  appId: number;
  liveClass?: {
    id: string;
    title: string;
  };
}

export interface PaymentRequiredResponse {
  paymentRequired: true;
  amount: number;
  liveClassId: string;
}

export interface InvitationRequiredResponse {
  invitationRequired: true;
  liveClassId: string;
}

export interface StartLiveResponse {
  liveClassId: string;
  roomId: string;
  appId: string;
  creatorToken: string;
  kitToken: string;
  sessionStartedAt: string;
  liveClass: {
    id: string;
    title: string;
    description: string;
    privacy: LivePrivacy;
    maxParticipants: number;
  };
}

export interface RoomInfoResponse {
  liveClass: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl?: string;
    startTime?: string;
    endTime?: string;
    privacy: LivePrivacy;
    status: string;
    streamingProvider: string;
    maxParticipants: number;
  };
  room: {
    roomId: string;
    appId: string;
    isActive: boolean;
  };
  userRole: string;
}

export interface ParticipantsResponse {
  roomId: string;
  liveClassId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participants: any[];
  participantCount: number;
  maxParticipants: number;
}

export interface InvitationResponse {
  liveClassId: string;
  invitationCode: string;
  privacy: string;
  expiresAt?: string;
  shareUrl: string;
}

export interface ValidateInvitationResponse {
  liveClassId: string;
  isValid: boolean;
  liveClass?: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnailUrl?: string;
    startTime?: string;
    privacy: LivePrivacy;
    status: string;
  } | null;
}

export interface HealthResponse {
  service: string;
  status: string;
  timestamp: string;
  configuration: {
    valid: boolean;
    issues: string[];
    configuration: {
      appId: string;
      serverSecret: string;
      tokenExpiry: number;
    };
  };
}

// Result types for actions
type JoinRoomResult =
  | { action: "JOIN"; data: JoinRoomResponse }
  | { action: "PAY"; data: PaymentRequiredResponse }
  | { action: "INVITE"; data: InvitationRequiredResponse };

/**
 * Join ZegoCloud Room (Creator / Participant)
 * This endpoint enforces:
 * - authentication
 * - payment gating
 * - role validation
 * - invitation codes for private rooms
 */
export async function joinZegoRoom(
  liveClassId: string,
  role: LiveRole,
  invitationCode?: string
): Promise<JoinRoomResult> {
  try {
    const res = await apiClient.post("/api/live/zegocloud/join-room?format=uikit", {
      liveClassId,
      role,
      invitationCode,
    });

    return {
      action: "JOIN",
      data: res.data.data ?? res.data,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Payment required
    if (error?.response?.status === 402) {
      return {
        action: "PAY",
        data: {
          paymentRequired: true,
          amount: error.response.data.amount || error.response.data.price || 0,
          liveClassId,
        },
      };
    }

    // Invitation required for private rooms
    if (error?.response?.status === 403 && error?.response?.data?.code === "INVITATION_REQUIRED") {
      return {
        action: "INVITE",
        data: {
          invitationRequired: true,
          liveClassId,
        },
      };
    }

    throw error;
  }
}

/**
 * Start ZegoCloud Live (Creator only)
 */
export async function startZegoLive(liveClassId: string): Promise<StartLiveResponse> {
  try {
    const res = await apiClient.post(`/live/${liveClassId}/start-zegocloud`);
    return res.data.data ?? res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.response?.status === 409) {
      // 409 Conflict means it's already started, which is fine.
      return error.response.data.data ?? error.response.data;
    }
    throw error;
  }
}

/**
 * End ZegoCloud Live (Creator only)
 */
export async function endZegoLive(liveClassId: string) {
  const res = await apiClient.post(`/live/${liveClassId}/end-zegocloud`);
  return res.data;
}

/**
 * Get ZegoCloud Room Information
 */
export async function getRoomInfo(liveClassId: string): Promise<RoomInfoResponse> {
  const res = await apiClient.get(`/api/live/zegocloud/room/${liveClassId}`);
  return res.data.data ?? res.data;
}

/**
 * Get Room Participants
 */
export async function getParticipants(liveClassId: string): Promise<ParticipantsResponse> {
  const res = await apiClient.get(`/api/live/zegocloud/participants/${liveClassId}`);
  return res.data.data ?? res.data;
}

/**
 * Remove Participant (Creator only)
 */
export async function removeParticipant(
  liveClassId: string,
  participantId: number,
  reason?: string
) {
  const res = await apiClient.post("/api/live/zegocloud/remove-participant", {
    liveClassId,
    participantId,
    reason,
  });
  return res.data;
}

/**
 * Get Invitation Code (Creator only, Private rooms)
 */
export async function getInvitation(liveClassId: string): Promise<InvitationResponse> {
  const res = await apiClient.get(`/api/live/zegocloud/invitation/${liveClassId}`);
  return res.data.data ?? res.data;
}

/**
 * Validate Invitation Code (No auth required)
 */
export async function validateInvitation(
  liveClassId: string,
  invitationCode: string
): Promise<ValidateInvitationResponse> {
  const res = await apiClient.post("/api/live/zegocloud/validate-invitation", {
    liveClassId,
    invitationCode,
  });
  return res.data.data ?? res.data;
}

/**
 * Health Check (No auth required)
 */
export async function checkHealth(): Promise<HealthResponse> {
  const res = await apiClient.get("/api/live/zegocloud/health");
  return res.data;
}

/**
 * Get Configuration (Auth required)
 */
export async function getConfig() {
  const res = await apiClient.get("/api/live/zegocloud/config");
  return res.data;
}
/**
 * Helper Functions
 */

/**
 * Initialize ZegoCloud for Creator
 * Combines session start + room join for creators
 */
export async function initializeCreator(liveClassId: string) {
  // First start the session (creator only)
  const sessionData = await startZegoLive(liveClassId);
  
  // Then join the room as creator
  const roomResult = await joinZegoRoom(liveClassId, "creator");
  
  if (roomResult.action !== "JOIN") {
    throw new Error("Creator should not require payment or invitation");
  }

  return {
    sessionData,
    roomData: roomResult.data,
  };
}

/**
 * Initialize ZegoCloud for Participant
 * Handles payment and invitation flow
 */
export async function initializeParticipant(
  liveClassId: string,
  invitationCode?: string
) {
  return await joinZegoRoom(liveClassId, "participant", invitationCode);
}

/**
 * Get Share URL for Live Class
 * Includes invitation code for private classes
 */
export async function getShareUrl(liveClassId: string, isPrivate: boolean = false): Promise<string> {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  
  if (isPrivate) {
    const invitation = await getInvitation(liveClassId);
    return invitation.shareUrl;
  }
  
  return `${baseUrl}/live/${liveClassId}`;
}

/**
 * Constants
 */
export const ERROR_CODES = {
  PAYMENT_REQUIRED: "PAYMENT_REQUIRED",
  INVITATION_REQUIRED: "INVITATION_REQUIRED",
  INVALID_INVITATION: "INVALID_INVITATION",
  ACCESS_DENIED: "ACCESS_DENIED",
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  SESSION_NOT_ACTIVE: "SESSION_NOT_ACTIVE",
} as const;

export const ROLES = {
  CREATOR: "creator",
  PARTICIPANT: "participant",
  AUDIENCE: "audience",
} as const;

export const PRIVACY = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;