"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { LiveSeriesCountdown } from "./types";

interface CountdownDisplayProps {
  initial: LiveSeriesCountdown;
}

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function initialToSeconds(c: LiveSeriesCountdown): number {
  const d = parseInt(c.days, 10) || 0;
  const h = parseInt(c.hours, 10) || 0;
  const m = parseInt(c.minutes, 10) || 0;
  const s = parseInt(c.seconds, 10) || 0;
  return d * 86400 + h * 3600 + m * 60 + s;
}

function diffToState(ms: number): CountdownState {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Memoized — only re-renders when value or label changes
const CountdownBox = memo(function CountdownBox({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2"
      style={{ background: "var(--background-dark)", minWidth: 37 }}
    >
      <span
        className="font-['Plus_Jakarta_Sans'] font-bold leading-tight tabular-nums"
        style={{ fontSize: 14.75, color: "#f2f2f2" }}
      >
        {value}
      </span>
      <span
        className="font-['Plus_Jakarta_Sans'] font-normal"
        style={{ fontSize: 5.9, color: "rgba(242,242,242,0.8)" }}
      >
        {label}
      </span>
    </div>
  );
});

export function CountdownDisplay({ initial }: CountdownDisplayProps) {
  // Compute target timestamp once on mount — immune to drift
  const endTime = useRef(Date.now() + initialToSeconds(initial) * 1000);

  const [time, setTime] = useState<CountdownState>(() =>
    diffToState(endTime.current - Date.now())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = endTime.current - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      setTime(diffToState(diff));
    }, 1000);

    return () => clearInterval(interval);
  }, []); // runs once — endTime ref is stable

  return (
    <div className="flex items-center gap-2">
      <CountdownBox value={pad(time.days)} label="Days" />
      <CountdownBox value={pad(time.hours)} label="Hours" />
      <CountdownBox value={pad(time.minutes)} label="Minutes" />
      <CountdownBox value={pad(time.seconds)} label="Seconds" />
    </div>
  );
}
