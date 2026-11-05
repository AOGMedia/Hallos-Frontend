/**
 * The event promoted on the homepage. The hero banner and the Event JSON-LD
 * both read from here, so the dates search engines see always match the page.
 * Update this when the event changes; the JSON-LD stops emitting after `endDate`.
 */
export const FEATURED_EVENT = {
  name: 'Hallos Millionaires Retreat 2026',
  description:
    'An all-expense paid retreat designed to help you gain practical life skills, accelerate your personal growth, and move your career forward with clarity. Connect with ambitious peers and take your next step with confidence.',
  startDate: '2026-12-09',
  endDate: '2026-12-11',
  dateLabel: '9th to 11th December',
  durationLabel: '2 days',
  locationLabel: 'Lagos, Nigeria',
  locality: 'Lagos',
  country: 'NG',
  image: '/images/event/speakers-hero.webp',
  path: '/events',
} as const;

export function isFeaturedEventUpcoming(now = new Date()): boolean {
  // Treat the end date as inclusive (until the end of that day, Lagos time).
  return now.getTime() <= new Date(`${FEATURED_EVENT.endDate}T23:59:59+01:00`).getTime();
}
