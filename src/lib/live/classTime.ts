/**
 * Live class times are saved as the creator typed them, marked UTC (7:00 PM
 * is stored as 19:00 UTC — see the create form), and the site shows them that
 * way. These format them back the same way, so every screen agrees.
 */
const valid = (value?: string | null) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "Wed, Mar 10, 2027" */
export function formatClassDate(value?: string | null): string {
  const d = valid(value);
  return d
    ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : "";
}

/** "Nov 20, 2026" — compact, for cards. */
export function formatClassShortDate(value?: string | null): string {
  const d = valid(value);
  return d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";
}

/** "7:00 PM" */
export function formatClassTime(value?: string | null): string {
  const d = valid(value);
  return d ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }) : "";
}

/** "7:00 PM – 8:30 PM", or just the start when there's no (later) end. */
export function formatClassTimeRange(start?: string | null, end?: string | null): string {
  const from = formatClassTime(start);
  if (!from) return "";
  const s = valid(start);
  const e = valid(end);
  return e && s && e > s ? `${from} – ${formatClassTime(end)}` : from;
}
