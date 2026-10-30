const TOKEN_KEY = 'email_portal_token';

export const PORTAL_ROLES = ['email_marketer', 'admin'];

export const getPortalToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setPortalToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable: the session just won't persist
  }
};

export const clearPortalToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};
