import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { clearAccountPreview } from "./accountPreview";

/**
 * Sign out from the public site header. Does what the dashboard's logout
 * (useAuth) does, then reloads into /signin so every part of the page,
 * this header included, starts fresh. (The header can't use useAuth: it sits
 * outside the React Query provider.)
 */
export async function signOutFromHeader(): Promise<void> {
  try {
    await authApi.logout();
  } catch (error) {
    console.error("Logout error:", error);
  }
  useAuthStore.getState().clearAuth();
  clearAccountPreview();
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
  } catch {
    // Storage blocked: nothing saved to clear.
  }
  window.location.assign("/signin");
}
