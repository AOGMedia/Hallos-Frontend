'use client';

import { CalendarClock, Info, Radio } from 'lucide-react';
import { RecurrencePatternField } from '@/components/series/form/RecurrencePatternField';
import type { ScheduleForm } from './scheduleChange';

interface SeriesScheduleSectionProps {
  value: ScheduleForm;
  onChange: (next: ScheduleForm) => void;
  /** As loaded — the end date can only move later than this. */
  originalEndDate: string;
  /** Today as YYYY-MM-DD (earliest new start date). */
  today: string;
  /** A session has run: the start date is fixed. */
  started: boolean;
  /** A session is live right now: nothing here can change until it ends. */
  liveNow: boolean;
  /** Session length in minutes (fixed after creation). */
  duration: number;
  /** Whether the current values differ from the saved schedule. */
  rescheduling: boolean;
}

const dateInputClass =
  'w-full bg-transparent outline-none live-event-input-text [color-scheme:dark] disabled:cursor-not-allowed';

/**
 * Edit a series' dates, weekdays and start time. Moving the schedule only
 * affects sessions that haven't happened; the page confirms before saving.
 */
export function SeriesScheduleSection({
  value,
  onChange,
  originalEndDate,
  today,
  started,
  liveNow,
  duration,
  rescheduling,
}: SeriesScheduleSectionProps) {
  const set = (patch: Partial<ScheduleForm>) => onChange({ ...value, ...patch });

  return (
    <section aria-labelledby="series-schedule-heading" className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CalendarClock size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="series-schedule-heading" className="text-base font-semibold text-text-primary">
            Schedule
          </h2>
          <p className="text-sm text-text-muted">
            Sessions are {duration} minutes each. Changes move upcoming sessions only.
          </p>
        </div>
      </div>

      {liveNow && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-text-primary">
          <Radio size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          A session is live right now. End it to change the schedule.
        </p>
      )}

      <fieldset disabled={liveNow} className="flex min-w-0 flex-col gap-5 disabled:opacity-60">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor="series-start-date" className="text-sm text-text-primary/70">
              Start date
            </label>
            <div className="live-event-input">
              <input
                id="series-start-date"
                type="date"
                value={value.startDate}
                min={today}
                max={value.endDate || undefined}
                disabled={started}
                onChange={(e) => set({ startDate: e.target.value })}
                className={dateInputClass}
              />
            </div>
            <p className="text-xs text-text-muted">
              {started ? 'Fixed once the first session has run.' : 'Sessions start from this date.'}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            <label htmlFor="series-end-date" className="text-sm text-text-primary/70">
              End date
            </label>
            <div className="live-event-input">
              <input
                id="series-end-date"
                type="date"
                value={value.endDate}
                min={originalEndDate || undefined}
                onChange={(e) => set({ endDate: e.target.value })}
                className={dateInputClass}
              />
            </div>
            <p className="text-xs text-text-muted">Can only be moved later.</p>
          </div>
        </div>

        <RecurrencePatternField
          selectedDays={value.days}
          startTime={value.startTime}
          onDaysChange={(days) => set({ days })}
          onStartTimeChange={(startTime) => set({ startTime })}
          showDuration={false}
          label="Days and time"
          helperText="The days of the week your sessions happen on, and when they start."
        />
      </fieldset>

      {rescheduling && !liveNow && (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-border/20 bg-background-dark p-3 text-sm text-text-muted">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          Upcoming sessions will move to the new schedule and everyone enrolled gets an email.
          Sessions that already happened stay as they are.
        </p>
      )}
    </section>
  );
}
