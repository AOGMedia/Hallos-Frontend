import { apiClient } from '@/lib/api/client';

/**
 * Partner links (`/signup?ref=CODE`) credit the partner when someone signs up.
 * Email sign-up sends the code with the form; Google sign-up leaves the site,
 * so the code waits here and is sent right after Google brings them back.
 * The backend only credits brand-new accounts, so a plain Google login with
 * a code lying around changes nothing.
 */

const KEY = 'auth_ref';
/** Matches the backend's window for crediting a new account. */
const MAX_AGE_MS = 30 * 60 * 1000;

export function savePendingSignupReferral(code: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    // storage unavailable — the partner just isn't credited
  }
}

/** Send the waiting code (if any) for the account that just logged in. Never throws or blocks. */
export function claimPendingSignupReferral(token: string) {
  let pending: { code?: string; at?: number } | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    pending = raw ? JSON.parse(raw) : null;
  } catch {
    return;
  }
  if (!pending?.code || !pending.at || Date.now() - pending.at > MAX_AGE_MS) return;

  apiClient
    .post('/api/referral/claim-signup', { ref: pending.code }, { headers: { Authorization: `Bearer ${token}` } })
    .catch(() => {
      // Best effort: sign-in carries on regardless.
    });
}
