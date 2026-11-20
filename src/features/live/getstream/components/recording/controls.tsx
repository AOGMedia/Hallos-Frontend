"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { tapHaptic } from "../../lib/haptics";
import type { Option } from "../../lib/recordingSettings";

/**
 * Small controls for the recording settings sheet, in the room's look: dark
 * panels, white/5 surfaces, a primary ring on the selected choice, a light
 * haptic on tap, and touch targets of at least 44px.
 */

export function SettingGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-white/50">{title}</h3>
      {description && <p className="mt-1 px-1 text-xs text-white/45">{description}</p>}
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

/** Choices as cards (label + hint), 2 or 3 per row. */
export function OptionCards<T extends string | number>({
  options,
  value,
  onChange,
  columns = 2,
  disabled,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => {
              tapHaptic(6);
              onChange(option.value);
            }}
            className={`relative min-h-[56px] touch-manipulation rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.98] disabled:opacity-40 ${
              selected ? "bg-primary/20 ring-1 ring-primary/70" : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <span className="block pr-5 text-sm font-semibold text-white">{option.label}</span>
            {option.hint && <span className="mt-0.5 block text-xs text-white/55">{option.hint}</span>}
            {selected && <Check className="absolute right-2.5 top-2.5 h-4 w-4 text-primary" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

/** Compact choices in one pill (e.g. strip position, tiles per screen). */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  disabled,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-white/5 p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => {
              tapHaptic(6);
              onChange(option.value);
            }}
            className={`min-h-11 flex-1 touch-manipulation rounded-xl px-2 text-sm font-medium transition disabled:opacity-40 ${
              selected ? "bg-primary text-white shadow" : "text-white/70 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** A row with an on/off switch. */
export function ToggleRow({
  label,
  hint,
  icon,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  icon?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        tapHaptic(6);
        onChange(!checked);
      }}
      className="flex min-h-14 w-full touch-manipulation items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10 disabled:opacity-40"
    >
      {icon && <span className="shrink-0 text-white/70">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-white/55">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-white/20"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

/** Colour choices as round swatches. */
export function SwatchPicker<T extends string>({
  options,
  value,
  onChange,
  disabled,
  label,
}: {
  options: (Option<T> & { swatch: string })[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  label: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-3">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={option.label}
              title={option.label}
              disabled={disabled}
              onClick={() => {
                tapHaptic(6);
                onChange(option.value);
              }}
              className={`flex h-11 w-11 touch-manipulation items-center justify-center rounded-full ring-offset-2 ring-offset-[#141a28] transition active:scale-95 disabled:opacity-40 ${
                selected ? "ring-2 ring-primary" : "ring-1 ring-white/20"
              }`}
              style={{ backgroundColor: option.swatch }}
            >
              {selected && <Check className="h-4 w-4 text-white" aria-hidden />}
            </button>
          );
        })}
      </div>
      {current && <p className="mt-2 px-1 text-xs text-white/55">{current.label}</p>}
    </div>
  );
}
