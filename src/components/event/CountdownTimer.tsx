'use client';

import { useState, useEffect } from 'react';
import { TimeUnit } from './TimeUnit';
import type { CountdownTimerProps } from './types';

export function CountdownTimer({ targetDate, closed = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Closed from the admin: nothing to count down to.
    if (closed) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, closed]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <p className="text-body text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>
        {closed ? 'Registration is closed' : 'Registration ends in:'}
      </p>
      <div className="flex gap-3 sm:gap-[19.2px]">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>
    </div>
  );
}