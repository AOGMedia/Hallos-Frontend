/**
 * In-class chat, raised hands and reactions travel over the call's own
 * real-time channel (custom call events), so they need no extra SDK or token.
 * Chat is live-only: people see messages sent while they are in the class.
 */

export const CHAT_EVENT = "hallos.chat";
export const HAND_EVENT = "hallos.hand";
// Reactions use custom events too: the "default" call type doesn't grant
// participants Stream's create-reaction permission, but it does grant send-event.
export const REACTION_EVENT = "hallos.reaction";
export const MAX_CHAT_LENGTH = 500;

export interface ChatEventPayload {
  kind: typeof CHAT_EVENT;
  id: string;
  text: string;
}

export interface HandEventPayload {
  kind: typeof HAND_EVENT;
  raised: boolean;
}

export interface ReactionEventPayload {
  kind: typeof REACTION_EVENT;
  code: string;
}

export const REACTIONS = [
  { code: ":heart:", emoji: "❤️", label: "Love" },
  { code: ":clap:", emoji: "👏", label: "Clap" },
  { code: ":fire:", emoji: "🔥", label: "Fire" },
  { code: ":laughing:", emoji: "😂", label: "Laugh" },
  { code: ":thumbsup:", emoji: "👍", label: "Like" },
  { code: ":tada:", emoji: "🎉", label: "Celebrate" },
] as const;

/** Only known reactions are shown — never arbitrary text from another client. */
export function emojiFor(code?: string): string | null {
  return REACTIONS.find((r) => r.code === code)?.emoji ?? null;
}

export function newEventId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function initialsOf(name?: string): string {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}
