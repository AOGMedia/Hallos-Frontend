import type { GetStreamTarget } from "../api";

/**
 * The link people use to join this class or series session: its lobby,
 * where payment, privacy and invitations are checked before they get in.
 * (The series list opens sessions the same way: /live/join/<id>?type=series.)
 */
export function classInviteUrl(target: GetStreamTarget, origin = typeof window === "undefined" ? "" : window.location.origin): string {
  const path = target.kind === "session" ? `/live/join/${target.id}?type=series` : `/live/join/${target.id}`;
  return `${origin}${path}`;
}
