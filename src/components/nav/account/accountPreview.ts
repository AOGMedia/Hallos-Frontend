import type { User } from "@/types/auth";

/**
 * The signed-in person's name and photo, remembered on this device so the
 * header can show their account instantly on the next visit (confirmed with
 * the server right after). Tied to the saved login: a different login on the
 * same browser never sees someone else's details.
 *
 * Only what the header shows is kept: name, email, photo. The login token
 * itself stays where it already is; we store just its last characters to
 * know which login this belongs to.
 */
const KEY = "hallos_account_preview";

type Stored = {
  login: string;
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  avatarUrl: string | null;
};

const loginTag = (token: string) => token.slice(-16);

export function readAccountPreview(token: string): User | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (stored.login !== loginTag(token) || !stored.id) return null;
    return {
      id: stored.id,
      firstname: stored.firstname ?? "",
      lastname: stored.lastname ?? "",
      email: stored.email ?? "",
      avatarUrl: stored.avatarUrl ?? null,
    };
  } catch {
    return null;
  }
}

export function saveAccountPreview(token: string, user: User): void {
  try {
    const stored: Stored = {
      login: loginTag(token),
      id: user.id,
      firstname: user.firstname ?? "",
      lastname: user.lastname ?? "",
      email: user.email ?? "",
      avatarUrl: user.avatarUrl ?? null,
    };
    localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Storage full or blocked: the header just waits for the server instead.
  }
}

export function clearAccountPreview(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
