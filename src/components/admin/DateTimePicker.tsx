'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  /** Earliest selectable moment — earlier days and same-day slots are disabled */
  min?: Date;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  id?: string;
}

const SLOT_MINUTES = 15;
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Plain date helpers — this app has neither date-fns nor react-day-picker, and
// a month grid isn't worth adding a dependency for.
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const withTime = (d: Date, hours: number, minutes: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0, 0);

/** Six weeks of days covering the given month, Monday-first */
function monthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // JS weeks start Sunday; shift to Monday
  const gridStart = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function relativeHint(target: Date): string {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'in the past';
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `in about ${hours} hour${hours === 1 ? '' : 's'}`;
  return `in ${Math.round(hours / 24)} days`;
}

/**
 * Date + time picker for the admin panel, replacing
 * `<input type="datetime-local">` — which renders the browser's own light-themed
 * widget against this dark UI, shows an unlabelled `--:--`, and will happily
 * accept a start time that precedes the registration deadline. The `min` bound
 * here disables invalid days and invalid same-day slots outright.
 */
export default function DateTimePicker({
  value,
  onChange,
  min,
  placeholder = 'Pick a date and time',
  error,
  disabled,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => startOfDay(value ?? min ?? new Date()));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setMonth(startOfDay(value ?? min ?? new Date()));
  }, [open, value, min]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const days = useMemo(() => monthGrid(month), [month]);
  const minDay = min ? startOfDay(min) : undefined;

  const slots = useMemo(() => {
    const out: { hours: number; minutes: number }[] = [];
    for (let m = 0; m < 24 * 60; m += SLOT_MINUTES) out.push({ hours: Math.floor(m / 60), minutes: m % 60 });
    return out;
  }, []);

  const pickDay = (day: Date) => {
    if (minDay && day < minDay) return;
    if (value) {
      onChange(withTime(day, value.getHours(), value.getMinutes()));
      return;
    }
    // No time chosen yet — default to 18:00, or the earliest legal slot today.
    const base = min && sameDay(day, min) ? min : withTime(day, 18, 0);
    const rounded = new Date(base);
    rounded.setMinutes(Math.ceil(base.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES, 0, 0);
    onChange(rounded);
  };

  const slotDisabled = (hours: number, minutes: number) => {
    if (!min || !value || !sameDay(value, min)) return false;
    return withTime(value, hours, minutes).getTime() < min.getTime();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 bg-black border rounded-lg px-3 py-2 text-sm text-left transition-colors disabled:opacity-50 ${
          error ? 'border-red-500/60' : 'border-zinc-700 hover:border-zinc-600'
        } focus:outline-none focus:border-indigo-500`}
      >
        <CalendarIcon size={14} className="text-zinc-500 shrink-0" />
        {value ? (
          <span className="text-zinc-200 truncate">
            {fmtDate(value)} <span className="text-zinc-600">·</span> {fmtTime(value)}
          </span>
        ) : (
          <span className="text-zinc-600 truncate">{placeholder}</span>
        )}
        {value && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear"
            onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
            className="ml-auto p-0.5 rounded text-zinc-600 hover:text-zinc-300 shrink-0"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 flex bg-[#1a1a1a] border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Calendar */}
          <div className="p-3 border-r border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-xs font-semibold text-zinc-200">
                {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="w-8 text-center text-[10px] text-zinc-600 font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {days.map((day) => {
                const outside = day.getMonth() !== month.getMonth();
                const isDisabled = !!minDay && day < minDay;
                const isSelected = !!value && sameDay(day, value);
                const isToday = sameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => pickDay(day)}
                    className={`w-8 h-8 rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : isDisabled
                          ? 'text-zinc-700 cursor-not-allowed'
                          : outside
                            ? 'text-zinc-600 hover:bg-zinc-800'
                            : 'text-zinc-300 hover:bg-zinc-800'
                    } ${isToday && !isSelected ? 'ring-1 ring-inset ring-zinc-600' : ''}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time */}
          <div className="flex flex-col w-28">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-800 text-[11px] text-zinc-500">
              <Clock size={12} /> Time
            </div>
            <div className="flex-1 max-h-[15rem] overflow-y-auto p-1.5 space-y-0.5">
              {slots.map(({ hours, minutes }) => {
                const selected = !!value && value.getHours() === hours && value.getMinutes() === minutes;
                const isDisabled = slotDisabled(hours, minutes);
                return (
                  <button
                    key={`${hours}:${minutes}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onChange(withTime(value ?? min ?? new Date(), hours, minutes))}
                    className={`w-full px-2 py-1.5 rounded-md text-[11px] transition-colors ${
                      selected
                        ? 'bg-indigo-600 text-white font-medium'
                        : isDisabled
                          ? 'text-zinc-700 cursor-not-allowed'
                          : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {fmtTime(withTime(new Date(), hours, minutes))}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-zinc-800 p-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-1.5 text-[11px] text-red-400">{error}</p>
      ) : value ? (
        <p className="mt-1.5 text-[11px] text-zinc-500">{relativeHint(value)}</p>
      ) : null}
    </div>
  );
}
