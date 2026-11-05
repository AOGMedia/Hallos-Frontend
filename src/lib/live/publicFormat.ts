/**
 * Formatting for server-rendered public class pages. Server output can't know
 * the visitor's timezone, so times are shown explicitly in Lagos time (WAT),
 * where most of Hallos's audience is.
 */

const LAGOS_TZ = 'Africa/Lagos';

export function formatClassTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: LAGOS_TZ });
  const time = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: LAGOS_TZ });
  return `${day}, ${time} WAT`;
}

export function formatPrice(price: number | string | null | undefined, currency: string | null | undefined): string {
  const amount = Number(price ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'Free';
  const symbol = (currency || 'NGN').toUpperCase() === 'USD' ? '$' : '₦';
  return `${symbol}${amount.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}
