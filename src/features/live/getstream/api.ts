import { apiClient } from "@/lib/api/client";

/**
 * GetStream endpoints (backend: routes/getStreamRoutes.js for live classes,
 * routes/getStreamSeriesRoutes.js for series sessions). Separate from
 * services/zegoService.ts — the two providers share nothing but the content.
 */

/** What is being streamed: a one-time live class or one session of a live series. */
export interface GetStreamTarget {
  kind: "class" | "session";
  id: string;
}

const basePath = ({ kind, id }: GetStreamTarget) =>
  kind === "session" ? `/api/live/series/session/${id}` : `/live/${id}`;

export type GetStreamUserType = "creator" | "cohost" | "participant";

/** What the browser needs to join one GetStream call. The token only works for that call. */
export interface GetStreamCredentials {
  apiKey: string;
  callType: string;
  callId: string;
  token: string;
  userId: string;
  userType: GetStreamUserType;
  userName?: string;
  alreadyLive?: boolean;
  liveClass?: { id: string; title: string };
}

export interface GetStreamRecording {
  session: number;
  callId: string;
  filename: string;
  url: string;
  startTime: string;
  endTime: string;
}

/** Same result shape as joinZegoRoom, so the lobby treats both providers alike. */
export type GetStreamJoinResult =
  | { action: "JOIN"; data: GetStreamCredentials }
  | { action: "PAY"; data: { paymentRequired: true; amount: number; liveClassId: string } }
  | { action: "INVITE"; data: { invitationRequired: true; liveClassId: string } };

/** Creator starts (or rejoins) the class or session. Safe to repeat. */
export async function startGetStreamLive(target: GetStreamTarget): Promise<GetStreamCredentials> {
  const res = await apiClient.post(`${basePath(target)}/start-getstream`);
  return res.data.data;
}

/** Join: payment, privacy and co-host rules are enforced on the server. */
export async function joinGetStreamCall(target: GetStreamTarget, invitationCode?: string): Promise<GetStreamJoinResult> {
  try {
    const res = await apiClient.post(`${basePath(target)}/join-getstream`, { invitationCode });
    return { action: "JOIN", data: res.data.data };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error?.response?.status === 402) {
      return {
        action: "PAY",
        data: {
          paymentRequired: true,
          amount: error.response.data.amount || error.response.data.price || 0,
          liveClassId: target.id,
        },
      };
    }
    if (error?.response?.status === 403 && error?.response?.data?.code === "INVITATION_REQUIRED") {
      return { action: "INVITE", data: { invitationRequired: true, liveClassId: target.id } };
    }
    throw error;
  }
}

/** End it for everyone (creator only). */
export async function endGetStreamLive(target: GetStreamTarget) {
  const res = await apiClient.post(`${basePath(target)}/end-getstream`);
  return res.data;
}

/**
 * Host heartbeat (live classes only — series sessions don't use one, same as
 * ZegoCloud). Keeps the class live and lets the server recover a wrongly-ended class.
 */
export async function sendGetStreamHeartbeat(
  liveClassId: string,
  callId: string
): Promise<{ status: string; recovered: boolean }> {
  const res = await apiClient.post(`/live/${liveClassId}/heartbeat-getstream`, { callId });
  return res.data.data;
}

/** Start or stop recording (creator only; done server-side). */
export async function setGetStreamRecording(target: GetStreamTarget, action: "start" | "stop") {
  const res = await apiClient.post(`${basePath(target)}/recording-getstream`, { action });
  return res.data.data as { recording: boolean };
}

/** Recordings (creator; co-hosts too for live classes). */
export async function listGetStreamRecordings(target: GetStreamTarget): Promise<GetStreamRecording[]> {
  const res = await apiClient.get(`${basePath(target)}/recordings-getstream`);
  return res.data.data.recordings;
}

// ---------------------------------------------------------------------------
// Gifts
// ---------------------------------------------------------------------------

export type WalletCurrency = "NGN" | "USD";
export type Balances = Record<WalletCurrency, number>;

export interface GiftDefinition {
  code: string;
  name: string;
  emoji: string;
  animation: string;
  prices: Balances;
}

export interface GiftOverview {
  gifts: GiftDefinition[];
  /** The class/series currency — tried first when paying. */
  currency: WalletCurrency;
  balances: Balances;
  /** False for the host (can't gift themselves). */
  canGift: boolean;
  /** Host only: what they've received here, after the platform fee. */
  received?: { totals: Balances; count: number };
}

export interface SentGift {
  id: string;
  code: string;
  name: string;
  emoji: string;
  currency: WalletCurrency;
  amount: number;
}

export async function getGiftOverview(target: GetStreamTarget): Promise<GiftOverview> {
  const res = await apiClient.get(`${basePath(target)}/gifts-getstream`);
  return res.data.data;
}

/** Thrown when no wallet has enough for the gift (HTTP 402). */
export class InsufficientFundsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

/**
 * Send a gift — attendees to the host (no recipientId), hosts/co-hosts to the
 * participant they pick. The server picks the wallet and the price; the
 * idempotency key (one per tap) makes a retried request safe.
 */
export async function sendGift(
  target: GetStreamTarget,
  giftCode: string,
  idempotencyKey: string,
  recipientId?: string
): Promise<{ gift: SentGift; replay: boolean; balances: Balances }> {
  try {
    const res = await apiClient.post(`${basePath(target)}/gift-getstream`, {
      giftCode,
      idempotencyKey,
      ...(recipientId ? { recipientId } : {}),
    });
    return res.data.data;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 402) throw new InsufficientFundsError(serverMessage(error, "Not enough money in your wallet"));
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Chat photos
// ---------------------------------------------------------------------------

/** Upload a photo to the class chat; the server stores and announces it. */
export async function shareChatPhoto(
  target: GetStreamTarget,
  photo: Blob,
  { caption, clientId, onProgress }: { caption?: string; clientId: string; onProgress?: (fraction: number) => void }
): Promise<{ id: string; url: string }> {
  const form = new FormData();
  form.append("photo", photo, photo instanceof File ? photo.name : "photo.jpg");
  form.append("clientId", clientId);
  if (caption) form.append("caption", caption);
  const res = await apiClient.post(`${basePath(target)}/chat-photo-getstream`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(e.loaded / e.total);
    },
  });
  return res.data.data;
}

/** The server's message for a failed request, if it sent one. */
export function serverMessage(error: unknown, fallback: string): string {
  const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return msg || (error instanceof Error ? error.message : fallback);
}

/** Where a target's recordings page lives. */
export function recordingsHref(target: GetStreamTarget): string {
  return target.kind === "session" ? `/live/${target.id}/recordings?type=series` : `/live/${target.id}/recordings`;
}
