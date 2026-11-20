import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api/client";
import { friendlyErrorMessage } from "@/features/network/friendlyError";

/** Backend: routes/classFeedbackRoutes.js (/api/class-feedback/:token). */

export type FeedbackRole = "participant" | "host";

export interface FeedbackAnswers {
  host?: number;
  useful?: string;
  quality?: string;
  issues?: string[];
  again?: string;
  smooth?: string;
  engagement?: string;
  /** What should be better next time. */
  improve?: string[];
}

export interface FeedbackResponse {
  overall: number;
  answers: FeedbackAnswers;
  comment: string;
  anonymous: boolean;
}

export interface FeedbackForm {
  kind: "class" | "session";
  role: FeedbackRole;
  title: string;
  /** "Session 3" for series sessions. */
  sessionLabel: string | null;
  hostName: string;
  /** Their earlier answers, if they've already given feedback. */
  response: FeedbackResponse | null;
}

/** Why a link can't be used, so the page can say exactly that. */
export type LinkProblem = "invalid" | "expired" | "not_ended" | "not_found" | "unavailable" | "network";

export class FeedbackLinkError extends Error {
  constructor(message: string, readonly problem: LinkProblem) {
    super(message);
  }
}

function toLinkError(error: unknown): FeedbackLinkError {
  if (isAxiosError(error) && error.response) {
    const code = (error.response.data as { code?: string } | undefined)?.code;
    const problem: LinkProblem =
      code === "INVALID_LINK"
        ? "invalid"
        : code === "LINK_EXPIRED"
          ? "expired"
          : code === "NOT_ENDED"
            ? "not_ended"
            : code === "NOT_FOUND"
              ? "not_found"
              : error.response.status === 503
                ? "unavailable"
                : "network";
    return new FeedbackLinkError(friendlyErrorMessage(error), problem);
  }
  return new FeedbackLinkError(friendlyErrorMessage(error), "network");
}

export async function getFeedbackForm(token: string): Promise<FeedbackForm> {
  try {
    const res = await apiClient.get(`/api/class-feedback/${encodeURIComponent(token)}`);
    return res.data.data as FeedbackForm;
  } catch (error) {
    throw toLinkError(error);
  }
}

/** The signed-in person's own link, for the class-ended screen in the room. */
export interface EndScreenLink {
  token: string;
  role: FeedbackRole;
  /** They already answered (e.g. earlier on this screen, or from the email). */
  responded: boolean;
  overall: number | null;
}

/**
 * Their feedback link for a class/session that has ended, or null when
 * feedback isn't for them (they weren't in it). Throws "not_ended" while the
 * class is still being closed, so the caller can try again shortly.
 */
export async function getEndScreenLink(kind: "class" | "session", id: string): Promise<EndScreenLink | null> {
  try {
    const res = await apiClient.post("/api/class-feedback/link", { kind, id });
    return res.data.data as EndScreenLink;
  } catch (error) {
    if (isAxiosError(error) && error.response && [401, 403, 404].includes(error.response.status)) return null;
    throw toLinkError(error);
  }
}

// ── Creators: what people said about their classes ─────────────────────────

export interface RatingStats {
  type: "rating";
  answered: number;
  average: number | null;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface ChoiceStats {
  type: "one" | "many";
  answered: number;
  counts: Record<string, number>;
}

export interface ParticipantSummary {
  responses: number;
  overall: RatingStats;
  comments: number;
  anonymous: number;
  answers: Record<string, RatingStats | ChoiceStats>;
}

export interface MyFeedbackItem {
  kind: "class" | "session";
  id: string;
  title: string;
  sessionLabel: string | null;
  seriesId: string | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  joined: number;
  responses: number;
  responseRate: number | null;
  averageOverall: number | null;
  averageHost: number | null;
  comments: number;
}

export interface MyFeedbackDetail {
  kind: "class" | "session";
  id: string;
  title: string;
  sessionLabel: string | null;
  seriesId: string | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  joined: number;
  responses: number;
  responseRate: number | null;
  summary: ParticipantSummary;
  /** Participants only. Anonymous answers come without a name. */
  feedback: Array<{
    id: string;
    anonymous: boolean;
    person: { firstname: string; lastname: string; avatarUrl: string | null } | null;
    overall: number;
    answers: FeedbackAnswers;
    comment: string;
    updatedAt: string;
  }>;
}

/** The creator's ended classes and sessions, with their feedback numbers. */
export async function getMyFeedbackList(): Promise<MyFeedbackItem[]> {
  const res = await apiClient.get("/api/class-feedback/mine", { params: { limit: 50 } });
  return (res.data.data?.items ?? []) as MyFeedbackItem[];
}

/** What participants said about one of the creator's classes or sessions. */
export async function getMyFeedback(kind: "class" | "session", id: string): Promise<MyFeedbackDetail> {
  const res = await apiClient.get(`/api/class-feedback/mine/${kind}/${encodeURIComponent(id)}`);
  return res.data.data as MyFeedbackDetail;
}

/** Where a creator reads a class's (or series session's) feedback. */
export const feedbackResultsHref = (kind: "class" | "session", id: string) =>
  kind === "session" ? `/live/${id}/feedback?type=series` : `/live/${id}/feedback`;

/** Saves (or updates) their feedback. The overall rating is required; everything else is optional. */
export async function submitFeedback(
  token: string,
  body: { overall: number; answers?: FeedbackAnswers; comment?: string; anonymous?: boolean }
): Promise<void> {
  try {
    await apiClient.post(`/api/class-feedback/${encodeURIComponent(token)}`, body);
  } catch (error) {
    throw toLinkError(error);
  }
}
