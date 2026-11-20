/** A light tap on phones that support it (silently nothing elsewhere). */
export function tap(ms = 10): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(ms);
  } catch {
    // Not allowed here: no haptic.
  }
}
