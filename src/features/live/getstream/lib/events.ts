/**
 * In-class chat, raised hands, reactions and gifts travel over the call's own
 * real-time channel (custom call events), so they need no extra SDK or token.
 * Chat is live-only: people see messages sent while they are in the class.
 *
 * Gift announcements and chat photos are sent by the server as the Hallos
 * system user. Those kinds are only trusted from that user, so nobody can fake
 * a gift or slip an outside image into chat from their browser.
 */

export const CHAT_EVENT = "hallos.chat";
export const HAND_EVENT = "hallos.hand";
// Reactions use custom events too: the "default" call type doesn't grant
// participants Stream's create-reaction permission, but it does grant send-event.
export const REACTION_EVENT = "hallos.reaction";
export const GIFT_EVENT = "hallos.gift";
export const MAX_CHAT_LENGTH = 500;

/** Server-side sender of gift and photo announcements (backend getStreamService). */
export const SYSTEM_USER_ID = "hallos-system";

export interface ChatEventPayload {
  kind: typeof CHAT_EVENT;
  id: string;
  text: string;
}

/** A chat photo announced by the server on behalf of `from`. */
export interface PhotoEventPayload {
  kind: typeof CHAT_EVENT;
  id: string;
  text?: string;
  photo: { url: string };
  from: { id: string; name: string; image?: string };
}

export interface HandEventPayload {
  kind: typeof HAND_EVENT;
  raised: boolean;
  /** Set when a host lowers someone else's hand ("*" = everyone's). */
  targetUserId?: string;
}

export interface ReactionEventPayload {
  kind: typeof REACTION_EVENT;
  code: string;
}

/** A gift announced by the server. */
export interface GiftEventPayload {
  kind: typeof GIFT_EVENT;
  id: string;
  code: string;
  from: { id: string; name: string };
  /** Who received it (the host, or a participant gifted by a host). */
  to?: { id: string; name: string; isHost?: boolean };
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

/** Only our own storage's photos are shown, and only over https. */
export function isSafePhotoUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** "₦1,000" / "$2.50" */
export function formatMoney(amount: number, currency: "NGN" | "USD"): string {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
