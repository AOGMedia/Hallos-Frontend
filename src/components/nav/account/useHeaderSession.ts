"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAxiosError } from "axios";
import { apiClient } from "@/lib/api/client";
import { parseMeResponse } from "@/lib/api/users";
import type { User } from "@/types/auth";
import { SAVED_LOGIN_ATTR, SAVED_LOGIN_KEYS } from "./savedLogin";
import { clearAccountPreview, readAccountPreview, saveAccountPreview } from "./accountPreview";

function readSavedToken(): string | null {
  try {
    for (const key of SAVED_LOGIN_KEYS) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
  } catch {
    // Storage blocked (private mode etc.): treat as signed out.
  }
  return null;
}

/** An answer with no identifiable person counts as signed out. */
const isRealUser = (user: User | null | undefined): user is User =>
  !!user && (!!user.email || (!!user.id && user.id !== "unknown"));

export type HeaderSessionStatus = "signedOut" | "checking" | "signedIn";

type Confirmed = { token: string | null; user: User | null };

/**
 * Who's signed in, for the site header.
 *
 * Fast, the way big products do it: the person's name and photo from their
 * last visit (kept on this device, tied to their saved login) show right
 * away, and /auth/me confirms in the background. If the server refuses the
 * login, the header switches to Log In / Sign Up and the remembered profile is
 * dropped. A network failure keeps the remembered profile (the login may well
 * still be valid).
 *
 * The header sits in the root layout and stays mounted across pages, so the
 * saved login is re-read on every navigation (and when another tab signs in
 * or out), and /auth/me is asked again only when it changed.
 *
 * - "checking": a login is saved, nothing remembered yet, answer pending.
 * - "signedIn": `user` is set (remembered or confirmed).
 * - "signedOut": no login, or the saved one was refused.
 */
export function useHeaderSession(): { status: HeaderSessionStatus; user: User | null } {
  const pathname = usePathname();
  // undefined until read on the client; the server renders the visitor header
  // (hidden before paint when a login is saved — see SAVED_LOGIN_ATTR).
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [preview, setPreview] = useState<User | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  // Before paint: the saved login and, for it, the remembered profile.
  useLayoutEffect(() => {
    const saved = readSavedToken();
    setToken(saved);
    setPreview(saved ? readAccountPreview(saved) : null);
  }, [pathname]);

  useEffect(() => {
    const onStorage = () => {
      const saved = readSavedToken();
      setToken(saved);
      setPreview(saved ? readAccountPreview(saved) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Confirm with the server whenever the saved login changes (first load
  // included: a session cookie can sign someone in without a saved token).
  // One request — no retry, so a refused login resolves quickly.
  useEffect(() => {
    if (token === undefined) return;
    let cancelled = false;
    apiClient.get("/auth/me").then(
      (res) => {
        if (cancelled) return;
        let user: User | null = null;
        try {
          user = parseMeResponse(res.data);
        } catch {
          user = null;
        }
        const real = isRealUser(user) ? user : null;
        if (real && token) saveAccountPreview(token, real);
        setConfirmed({ token, user: real });
      },
      (error: unknown) => {
        if (cancelled) return;
        const refused = isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403);
        if (refused || !token) {
          clearAccountPreview();
          setConfirmed({ token, user: null });
        } else {
          // Network trouble or a server error: keep what we remember.
          setConfirmed({ token, user: readAccountPreview(token) });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [token]);

  const current = confirmed && confirmed.token === token ? confirmed : null;
  const user = current ? current.user : preview;
  const status: HeaderSessionStatus = user
    ? "signedIn"
    : token && !current
      ? "checking"
      : "signedOut";

  // Keep the pre-paint marker in step: present while a login is saved and
  // not refused, gone once we know it's a visitor, so the visitor buttons
  // (hidden while it's set) show again.
  const signedOutKnown = token !== undefined && status === "signedOut";
  useLayoutEffect(() => {
    if (signedOutKnown) document.documentElement.removeAttribute(SAVED_LOGIN_ATTR);
    else if (token) document.documentElement.setAttribute(SAVED_LOGIN_ATTR, "");
  }, [signedOutKnown, token]);

  return { status, user };
}
