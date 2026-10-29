/** A light tap on phones that support it; a no-op everywhere else. */
export function tapHaptic(pattern: number | number[] = 10) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    // Some browsers throw when vibration isn't allowed — never matters.
  }
}
