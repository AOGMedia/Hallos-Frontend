/**
 * Where a login token can be saved — the same keys the API client reads.
 * Shared by the header's session check and the pre-paint script in the root
 * layout, so they always agree.
 */
export const SAVED_LOGIN_KEYS = ["auth_token", "token", "accessToken", "access_token", "authToken"];

/** Set on <html> before first paint when a login is saved; cleared once it's found invalid. */
export const SAVED_LOGIN_ATTR = "data-saved-login";

/** Visitor-only controls (Log In / Sign Up): invisible while a saved login is being checked. Keeps their space, so nothing shifts. */
export const VISITOR_ONLY_CLASS = "[html[data-saved-login]_&]:invisible";
