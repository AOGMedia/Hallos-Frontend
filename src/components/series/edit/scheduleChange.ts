import type { Series } from '@/types/series';

/** What the schedule part of the edit form holds. Dates are YYYY-MM-DD. */
export interface ScheduleForm {
  startDate: string;
  endDate: string;
  days: string[];
  startTime: string;
}

/** An ISO date from the API as the YYYY-MM-DD a date input uses (series dates are stored at UTC midnight). */
export function toDateInput(value?: string | null): string {
  return value ? value.split('T')[0] : '';
}

const daysKey = (days: string[]) => [...days].map((d) => d.toLowerCase()).sort().join(',');

/** The form as loaded from a series, so a save can tell what actually changed. */
export function scheduleFormFrom(series: Series): ScheduleForm {
  return {
    startDate: toDateInput(series.startDate),
    endDate: toDateInput(series.endDate),
    days: series.recurrencePattern?.days ?? [],
    startTime: series.recurrencePattern?.startTime ?? '',
  };
}

/** Whether any session has run (or is running) — after that the start date is fixed. */
export function hasSeriesStarted(series: Series): boolean {
  return (series.stats?.completedSessions ?? 0) > 0 || (series.stats?.liveSessions ?? 0) > 0;
}

export function isSeriesLiveNow(series: Series): boolean {
  return (series.stats?.liveSessions ?? 0) > 0 || !!series.stats?.activeSession;
}

/**
 * The update body for the schedule: only what changed, so a plain save
 * (title, price...) never touches sessions or emails anyone.
 */
export function diffSchedule(original: ScheduleForm, form: ScheduleForm) {
  const daysChanged = daysKey(form.days) !== daysKey(original.days);
  const timeChanged = form.startTime !== original.startTime;
  const startChanged = !!form.startDate && form.startDate !== original.startDate;
  const endChanged = !!form.endDate && form.endDate !== original.endDate;

  return {
    /** Days, time or start date — sessions move and attendees are emailed. */
    rescheduling: daysChanged || timeChanged || startChanged,
    body: {
      ...(startChanged ? { startDate: form.startDate } : {}),
      ...(endChanged ? { endDate: form.endDate } : {}),
      ...(daysChanged || timeChanged
        ? {
            recurrencePattern: {
              ...(daysChanged ? { days: form.days } : {}),
              ...(timeChanged ? { startTime: form.startTime } : {}),
            },
          }
        : {}),
    },
  };
}

/** A message for the first problem with the schedule, or null. */
export function validateSchedule(original: ScheduleForm, form: ScheduleForm, todayInput: string): string | null {
  if (form.days.length === 0) return 'Pick at least one day of the week.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.startTime)) return 'Enter a start time like 19:00.';
  if (form.endDate && original.endDate && form.endDate < original.endDate) {
    return 'End date can only be extended forward, not shortened.';
  }
  if (form.startDate !== original.startDate) {
    if (form.startDate < todayInput) return "The start date can't be in the past.";
    if (form.endDate && form.startDate >= form.endDate) return 'The start date must be before the end date.';
  }
  return null;
}
