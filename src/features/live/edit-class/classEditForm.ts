import type { LiveClass, UpdateLiveClassBody } from "@/services/liveClassService";
import { DEFAULT_LIVE_PROVIDER, type LiveProvider } from "@/lib/live/providers";

/** What the edit form holds. Dates are YYYY-MM-DD, times HH:MM. */
export interface ClassEditValues {
  title: string;
  description: string;
  price: string;
  category: string;
  privacy: "public" | "private";
  maxParticipants: string;
  streamingProvider: LiveProvider;
  date: string;
  startTime: string;
  endTime: string;
}

/** Providers a scheduled class can switch between (Mux classes can't change). */
const SWITCHABLE: string[] = ["zegocloud", "getstream"];

/**
 * Class times are saved as the creator typed them, marked UTC (the create
 * form sends `${date}T${time}:00.000Z`), and the site shows them that way.
 * So the form reads the UTC parts back, and writes them the same way.
 */
const datePart = (iso?: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
const timePart = (iso?: string) => (iso ? new Date(iso).toISOString().slice(11, 16) : "");
export const toClassIso = (date: string, time: string) => new Date(`${date}T${time}:00.000Z`).toISOString();

export function classEditValuesFrom(c: LiveClass): ClassEditValues {
  const price = c.price === undefined || c.price === null || c.price === "" ? 0 : Number(c.price);
  const provider = SWITCHABLE.includes(String(c.streamingProvider))
    ? (c.streamingProvider as LiveProvider)
    : DEFAULT_LIVE_PROVIDER;
  return {
    title: c.title ?? "",
    description: c.description ?? "",
    price: Number.isFinite(price) ? String(price) : "0",
    category: c.category ?? "",
    privacy: c.privacy === "private" ? "private" : "public",
    maxParticipants: c.max_participants ? String(c.max_participants) : "",
    streamingProvider: provider,
    date: datePart(c.startTime),
    startTime: timePart(c.startTime),
    endTime: timePart(c.endTime),
  };
}

/** Date and time can only move before the class has started. */
export const canReschedule = (c: LiveClass) => (c.status ?? "scheduled") === "scheduled";

/** The streaming method can change before the class starts, between the in-app providers. */
export const canSwitchProvider = (c: LiveClass) =>
  canReschedule(c) && SWITCHABLE.includes(String(c.streamingProvider ?? "zegocloud"));

/**
 * The update body: only what changed, so an ordinary save never moves the
 * class or emails anyone.
 */
export function diffClassEdit(c: LiveClass, original: ClassEditValues, form: ClassEditValues) {
  const body: UpdateLiveClassBody = {};
  if (form.title.trim() !== original.title) body.title = form.title.trim();
  if (form.description.trim() !== original.description.trim()) body.description = form.description.trim();
  if (form.category !== original.category) body.category = form.category;
  if (form.privacy !== original.privacy) body.privacy = form.privacy;

  const price = form.price === "" ? 0 : Number(form.price);
  if (price !== Number(original.price)) body.price = price;

  if (form.maxParticipants !== original.maxParticipants && form.maxParticipants !== "") {
    body.maxParticipants = Number(form.maxParticipants);
  }

  if (canSwitchProvider(c) && form.streamingProvider !== original.streamingProvider) {
    body.streamingProvider = form.streamingProvider;
  }

  const rescheduled =
    canReschedule(c) &&
    (form.date !== original.date || form.startTime !== original.startTime || form.endTime !== original.endTime);
  if (rescheduled) {
    body.startTime = toClassIso(form.date, form.startTime);
    body.endTime = toClassIso(form.date, form.endTime);
  }

  return { body, rescheduled, changed: Object.keys(body).length > 0 };
}

/** A message for the first problem, or null. Mirrors the create form's checks. */
export function validateClassEdit(form: ClassEditValues, rescheduled: boolean, now = new Date()): string | null {
  if (!form.title.trim()) return "Please add a title for your class.";
  if (form.price !== "" && !(Number(form.price) >= 0)) return "Enter a valid price.";
  if (form.maxParticipants !== "") {
    const max = Number(form.maxParticipants);
    if (!Number.isInteger(max) || max < 1 || max > 1000) return "Max participants must be between 1 and 1000.";
  }
  if (rescheduled) {
    if (!form.date || !form.startTime || !form.endTime) return "Please choose the date, start time and end time.";
    // Same check as creating a class: read in the creator's own clock.
    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);
    if (start < now) return "Please choose a time that hasn't passed yet.";
    if (end <= start) return "End time must be after start time.";
  }
  return null;
}
