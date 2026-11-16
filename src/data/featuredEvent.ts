/**
 * The featured event (/events). Staff edit it from the admin (Event page);
 * the pages fetch it from GET /api/events/featured on the server and fall back
 * to DEFAULT_EVENT below if the API is slow, down, or sends something odd, so
 * the page always renders. DEFAULT_EVENT mirrors the backend's defaults
 * (services/featuredEventService.js in Hallos-Latest): keep the two in step.
 *
 * Text may contain {price}; fillPrice() swaps in the current price.
 */

export interface FeaturedEventChapter {
  title: string;
  description: string;
  /** Seconds. */
  duration: number;
  videoSrc: string;
  posterSrc: string;
}

export interface FeaturedEvent {
  name: string;
  description: string;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  dateLabel: string;
  durationLabel: string;
  locationLabel: string;
  locality: string;
  country: string;
  image: string;
  imageAlt: string;
  registrationOpen: boolean;
  /** ISO date-time; the countdown runs to it. */
  registrationDeadline: string;
  /** ₦, whole naira. */
  price: number;
  about: { valueProposition: string; perks: string; commitment: string };
  whyJoin: { title: string; description: string }[];
  whoCanApply: string[];
  slots: { title: string; subtitle: string };
  faqs: { question: string; answer: string }[];
  journey: { title: string; subtitle: string; chapters: FeaturedEventChapter[] };
  form: { locations: string[]; talents: string[]; careerPaths: string[] };
}

const VIDEO = 'https://res.cloudinary.com/dblsgkbk4/video/upload/v1781269264/compressed_dklgv9.mp4';
const POSTER = 'https://res.cloudinary.com/dblsgkbk4/image/upload/v1760131928/2148940744_1_y9chc5.png';

export const DEFAULT_EVENT: FeaturedEvent = {
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
  imageAlt: 'Event speakers and hosts',
  registrationOpen: true,
  registrationDeadline: '2026-12-08T23:00:00.000Z',
  price: 3000,
  about: {
    valueProposition:
      'A 2-day, all-expense paid experience designed to help you gain practical life skills, accelerate your personal growth, and move your career forward with clarity.',
    perks: 'Gain real-world insights, connect with ambitious peers, and take your next step with confidence.',
    commitment: 'Open to individuals ready to take action. A {price} commitment fee applies to complete your registration.',
  },
  whyJoin: [
    { title: 'Accelerated Growth', description: 'Learn practical skills you can apply immediately' },
    { title: 'High-Value Networking', description: 'Connect with ambitious, like-minded individuals' },
    { title: 'Real-Life Skills', description: "Gain insights they don't teach in school" },
    { title: 'Clarity & Direction', description: 'Leave with a clear plan for your next phase' },
  ],
  whoCanApply: [
    'Growth-minded individuals',
    'Passionate learners',
    'Career-focused participants',
    'Must be available for the full 2-days',
  ],
  slots: {
    title: 'Limited slots available.',
    subtitle: "Don't miss this opportunity to fast-track your growth.",
  },
  faqs: [
    {
      question: 'How do I register for the event?',
      answer:
        'Click any "Register" button on this page and complete the registration form. A {price} non-refundable commitment fee is required to secure your spot.',
    },
    {
      question: 'Is the event fully covered?',
      answer:
        'Yes — once you are shortlisted among the participants, all expenses for the 2-day event including accommodation and meals are fully covered.',
    },
    {
      question: 'What happens after I register?',
      answer: 'After registering, you will receive a confirmation email with further instructions.',
    },
    {
      question: 'Can I transfer my slot to someone else?',
      answer:
        'No. Participation in the program is non-transferable. Shortlisted slots cannot be transferred to another individual.',
    },
  ],
  journey: {
    title: 'Event Journey',
    subtitle: 'Relive every moment, from keynote to closing.',
    chapters: [
      { title: 'The Vision', description: 'An inspiring keynote that sets the stage for everything we are building together.', duration: 45, videoSrc: VIDEO, posterSrc: POSTER },
      { title: 'Creator Stories', description: 'Real attendees share their transformative experiences and breakthrough moments.', duration: 52, videoSrc: VIDEO, posterSrc: POSTER },
      { title: 'Skills Workshop', description: 'A hands-on deep dive into the tools and techniques that drive creative success.', duration: 38, videoSrc: VIDEO, posterSrc: POSTER },
      { title: 'The Community', description: 'Networking, collaboration, and the closing moments that connect us all.', duration: 35, videoSrc: VIDEO, posterSrc: POSTER },
    ],
  },
  form: {
    locations: ['Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Kano', 'Other'],
    talents: ['Content Creator', 'Developer', 'Designer', 'Marketer', 'Other'],
    careerPaths: ['Freelancing', 'Full-time Job', 'Entrepreneurship', 'Other'],
  },
};

/** The page's address; not editable. */
export const FEATURED_EVENT_PATH = '/events';

/** Kept for existing imports (homepage, JSON-LD): the built-in event plus its path. */
export const FEATURED_EVENT = { ...DEFAULT_EVENT, path: FEATURED_EVENT_PATH };

export function isFeaturedEventUpcoming(now = new Date(), event: Pick<FeaturedEvent, 'endDate'> = DEFAULT_EVENT): boolean {
  // Treat the end date as inclusive (until the end of that day, Lagos time).
  return now.getTime() <= new Date(`${event.endDate}T23:59:59+01:00`).getTime();
}

/** ₦3,000 (or ₦3,000.00 with decimals). */
export function formatNaira(amount: number, decimals = 0): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function fillPrice(text: string, price: number): string {
  return text.replace(/\{price\}/g, formatNaira(price));
}

/** True for a full web address (needs next/image's `unoptimized`, since its host may not be configured). */
export const isRemoteImage = (src: string) => /^https?:\/\//i.test(src);

// ---------- Defensive merge of what the API sends ----------

const str = (value: unknown, fallback: string) => (typeof value === 'string' && value.trim() ? value : fallback);
const strList = (value: unknown, fallback: string[], min = 1) =>
  Array.isArray(value) && value.length >= min && value.every((v) => typeof v === 'string' && v.trim()) ? (value as string[]) : fallback;
const objList = <T,>(value: unknown, fallback: T[], keys: (keyof T)[], min = 0) =>
  Array.isArray(value) && value.length >= min && value.every((v) => v && typeof v === 'object' && keys.every((k) => (v as T)[k] !== undefined && (v as T)[k] !== null))
    ? (value as T[])
    : fallback;

/** The API's event laid over the defaults, field by field; anything missing or malformed keeps its default. */
export function normalizeEvent(raw: unknown): FeaturedEvent {
  if (!raw || typeof raw !== 'object') return DEFAULT_EVENT;
  const o = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {});
  const r = o(raw);
  const about = o(r.about);
  const slots = o(r.slots);
  const journey = o(r.journey);
  const form = o(r.form);
  const d = DEFAULT_EVENT;
  const price = Number(r.price);
  const deadline = typeof r.registrationDeadline === 'string' && !Number.isNaN(new Date(r.registrationDeadline).getTime());
  const day = (v: unknown, f: string) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : f);
  return {
    name: str(r.name, d.name),
    description: str(r.description, d.description),
    startDate: day(r.startDate, d.startDate),
    endDate: day(r.endDate, d.endDate),
    dateLabel: str(r.dateLabel, d.dateLabel),
    durationLabel: str(r.durationLabel, d.durationLabel),
    locationLabel: str(r.locationLabel, d.locationLabel),
    locality: str(r.locality, d.locality),
    country: str(r.country, d.country),
    image: str(r.image, d.image),
    imageAlt: str(r.imageAlt, d.imageAlt),
    registrationOpen: typeof r.registrationOpen === 'boolean' ? r.registrationOpen : d.registrationOpen,
    registrationDeadline: deadline ? (r.registrationDeadline as string) : d.registrationDeadline,
    price: Number.isInteger(price) && price >= 100 ? price : d.price,
    about: {
      valueProposition: str(about.valueProposition, d.about.valueProposition),
      perks: str(about.perks, d.about.perks),
      commitment: str(about.commitment, d.about.commitment),
    },
    whyJoin: objList(r.whyJoin, d.whyJoin, ['title', 'description'], 1),
    whoCanApply: strList(r.whoCanApply, d.whoCanApply),
    slots: { title: str(slots.title, d.slots.title), subtitle: str(slots.subtitle, d.slots.subtitle) },
    faqs: objList(r.faqs, d.faqs, ['question', 'answer']),
    journey: {
      title: str(journey.title, d.journey.title),
      subtitle: str(journey.subtitle, d.journey.subtitle),
      chapters: objList(journey.chapters, d.journey.chapters, ['title', 'description', 'duration', 'videoSrc', 'posterSrc']),
    },
    form: {
      locations: strList(form.locations, d.form.locations),
      talents: strList(form.talents, d.form.talents),
      careerPaths: strList(form.careerPaths, d.form.careerPaths),
    },
  };
}
