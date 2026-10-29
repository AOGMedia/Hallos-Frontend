/**
 * Live class streaming providers — the single place that decides which
 * providers a NEW live class can use and where a class links to.
 *
 * History: Mux (OBS/RTMP streaming) was retired from the frontend. Existing
 * Mux classes can still come back from the API, so 'mux' remains a known
 * legacy value, but it can never be chosen for a new class.
 *
 * Current providers: ZegoCloud (the default) and GetStream (features/live/getstream).
 * Both use the same routes — /live/:id/room and /live/join/:id — and the room
 * page picks the provider's UI from the class.
 *
 * Adding a provider:
 *   1. add it to LIVE_PROVIDERS and PROVIDER_OPTIONS below,
 *   2. give it a room component and start/join calls (see features/live/getstream),
 *   3. make sure the backend accepts it in POST /live/create and reports it in
 *      GET /live/create-capabilities.
 */

/** Providers a new live class can be created with. */
export const LIVE_PROVIDERS = ["zegocloud", "getstream"] as const;
export type LiveProvider = (typeof LIVE_PROVIDERS)[number];

/** Retired providers that may still exist on old classes. */
export type LegacyLiveProvider = "mux";

export const DEFAULT_LIVE_PROVIDER: LiveProvider = "zegocloud";

/** Copy for the "Streaming Method" picker when creating a class. */
export const PROVIDER_OPTIONS: Record<LiveProvider, { title: string; description: string }> = {
  zegocloud: { title: "Stream In-App   (Recommended)", description: "Stream directly from Hallos ." },
  getstream: {
    title: "Interactive Classroom",
    description: "Everyone can join on camera, with live chat, reactions and recording.",
  },
};

/**
 * Providers that are always offered. Others (GetStream) are offered only once
 * the backend reports them available — see useAvailableLiveProviders.
 */
export const ALWAYS_AVAILABLE_PROVIDERS: readonly LiveProvider[] = ["zegocloud"];

export function isLiveProvider(value: unknown): value is LiveProvider {
  return typeof value === "string" && (LIVE_PROVIDERS as readonly string[]).includes(value);
}

/** True for classes created with a retired provider (old Mux/OBS classes). */
export function isLegacyLiveClass(cls: { streamingProvider?: string | null; streaming_provider?: string | null }): boolean {
  return (cls.streamingProvider ?? cls.streaming_provider) === "mux";
}

interface LinkableLiveClass {
  id: string | number;
  userId?: string | number | null;
  streamingProvider?: string | null;
  streaming_provider?: string | null;
}

/**
 * Where a live class card should take the user:
 *   - its owner goes straight to the room (to host),
 *   - everyone else goes to the lobby (pay / register / join).
 * Legacy Mux classes go to /live/:id, which explains they're no longer supported.
 */
export function liveClassHref(cls: LinkableLiveClass, currentUserId?: string | number | null): string {
  const id = String(cls.id);
  if (isLegacyLiveClass(cls)) return `/live/${id}`;

  const isOwner = currentUserId != null && cls.userId != null && String(cls.userId) === String(currentUserId);
  return isOwner ? `/live/${id}/room` : `/live/join/${id}`;
}
