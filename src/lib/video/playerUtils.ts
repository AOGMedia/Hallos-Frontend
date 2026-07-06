/**
 * Formats seconds into a human-readable time string.
 * e.g. 83 → "1:23", 3723 → "1:02:03"
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Shares a URL using the native Web Share API if available,
 * falling back to clipboard copy.
 *
 * Returns:
 * - 'native'   — native share sheet was triggered
 * - 'copied'   — URL was copied to clipboard
 * - 'fallback' — neither worked (caller should show a custom modal)
 */
export async function shareUrl(url: string, title?: string): Promise<'native' | 'copied' | 'fallback'> {
  if (typeof navigator === 'undefined') return 'fallback';

  if (navigator.share) {
    try {
      await navigator.share({ url, title });
      return 'native';
    } catch {
      // AbortError (user cancelled) or NotAllowedError — fall through
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'fallback';
  }
}
