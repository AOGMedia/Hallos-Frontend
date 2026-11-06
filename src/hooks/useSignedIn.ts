"use client";

import { useLayoutEffect, useState } from "react";
import { useCurrentUser } from "./useCurrentUser";

/** Same keys the API client reads the login token from. */
const TOKEN_KEYS = ["auth_token", "token", "accessToken", "access_token", "authToken"];

const hasSavedLogin = () => {
  try {
    return TOKEN_KEYS.some((key) => Boolean(localStorage.getItem(key)));
  } catch {
    return false;
  }
};

/**
 * Whether someone is signed in, known as early as possible: a saved login
 * counts while /auth/me is still loading (checked before the first paint), so
 * signed-in people never see visitor-only UI flash up. An invalid or expired
 * login turns false once /auth/me answers.
 */
export function useSignedIn() {
  const { user, loading } = useCurrentUser();
  const [savedLogin, setSavedLogin] = useState(false);

  useLayoutEffect(() => {
    setSavedLogin(hasSavedLogin());
  }, []);

  return Boolean(user) || (loading && savedLogin);
}
