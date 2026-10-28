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

/** The server's message for a failed request, if it sent one. */
export function serverMessage(error: unknown, fallback: string): string {
  const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return msg || (error instanceof Error ? error.message : fallback);
}

/** Where a target's recordings page lives. */
export function recordingsHref(target: GetStreamTarget): string {
  return target.kind === "session" ? `/live/${target.id}/recordings?type=series` : `/live/${target.id}/recordings`;
}
