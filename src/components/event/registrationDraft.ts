/**
 * Keeps a visitor's event application while they sign in. Paying needs an
 * account, so a signed-out person who submits is sent to sign in; their
 * answers are saved here and put back when they return (?register=1).
 * Stored on this device only, for a short while, and removed once restored.
 */

const KEY = "hallos.eventRegistrationDraft";
/** Long enough to sign up and verify an email; short enough not to linger. */
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

/** Added to the events page address on the way back from sign-in. */
export const REGISTER_PARAM = "register";

export interface RegistrationDraft {
  formData: Record<string, string>;
  otherValues: Record<string, string>;
  otherModeActive: Record<string, boolean>;
  agreedToTerms: boolean;
}

export function saveRegistrationDraft(draft: RegistrationDraft) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private mode): they'll just have to retype.
  }
}

export function loadRegistrationDraft(): RegistrationDraft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RegistrationDraft & { savedAt?: number };
    if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return {
      formData: parsed.formData ?? {},
      otherValues: parsed.otherValues ?? {},
      otherModeActive: parsed.otherModeActive ?? {},
      agreedToTerms: Boolean(parsed.agreedToTerms),
    };
  } catch {
    return null;
  }
}

export function clearRegistrationDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Sign-in page that returns to this events page with the form reopened. */
export function signInToContinueHref() {
  const returnTo = `${window.location.pathname}?${REGISTER_PARAM}=1`;
  return `/signin?redirect=${encodeURIComponent(returnTo)}`;
}
