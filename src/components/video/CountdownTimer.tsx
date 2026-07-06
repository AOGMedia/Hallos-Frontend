'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import type { CountdownTimerProps } from '@/types/video';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function CountdownTimerComponent({ targetDate }: CountdownTimerProps) {
  const calculateTimeLeft = useMemo(() => {
    return (): TimeLeft => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs text-text-gray leading-[15px]">Class starts in:</p>
      <div className="flex gap-2">
        <TimeUnit value={formatNumber(timeLeft.days)} label="Days" />
        <TimeUnit value={formatNumber(timeLeft.hours)} label="Hours" />
        <TimeUnit value={formatNumber(timeLeft.minutes)} label="Minutes" />
        <TimeUnit value={formatNumber(timeLeft.seconds)} label="Seconds" />
      </div>
    </div>
  );
}

interface TimeUnitProps {
  value: string;
  label: string;
}

const TimeUnit = memo(({ value, label }: TimeUnitProps) => (
  <div className="flex flex-col items-center gap-1 bg-background-dark rounded-md px-2 py-1.5 min-w-[37px]">
    <span className="text-text-primary font-bold text-sm leading-[18.43px]">
      {value}
    </span>
    <span className="text-text-muted text-[5.90px] leading-tight">
      {label}
    </span>
  </div>
));

TimeUnit.displayName = 'TimeUnit';

export const CountdownTimer = memo(CountdownTimerComponent);
CountdownTimer.displayName = 'CountdownTimer';