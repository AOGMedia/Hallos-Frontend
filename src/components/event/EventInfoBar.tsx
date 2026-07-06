import Image from 'next/image';
import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import LocationPinIcon from '@/components/icons/LocationPinIcon';

interface EventInfoBarProps {
  date: string;
  time: string;
  location: string;
  className?: string;
}

export function EventInfoBar({ date, time, location, className = '' }: EventInfoBarProps) {
  return (
    <div className={`event-info-bar ${className}`}>
      {/* Background decorative SVGs */}
      <Image
        src="/images/event/bg-detail-left.svg"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="absolute left-0 top-0 h-full w-auto pointer-events-none select-none"
      />
      <Image
        src="/images/event/bg-detail-right.svg"
        alt=""
        aria-hidden="true"
        width={200}
        height={200}
        className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none"
      />

      {/* Content row */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 sm:px-12 py-8">
        {/* Date */}
        <div className="flex flex-col items-center gap-3 min-w-[100px]">
          <CalendarIcon width={24} height={24} color="rgba(242,242,242,0.8)" />
          <span className="text-body text-center font-semibold" style={{ color: 'rgba(242,242,242,0.8)' }}>
            {date}
          </span>
        </div>

        {/* Separator */}
        <div
          className="hidden sm:block flex-1 h-px"
          style={{ borderTop: '1px dashed rgba(242,242,242,0.6)' }}
          aria-hidden="true"
        />

        {/* Time */}
        <div className="flex flex-col items-center gap-3 min-w-[100px]">
          <ClockIcon width={24} height={24} />
          <span className="text-body text-center font-semibold" style={{ color: 'rgba(242,242,242,0.8)' }}>
            {time}
          </span>
        </div>

        {/* Separator */}
        <div
          className="hidden sm:block flex-1 h-px"
          style={{ borderTop: '1px dashed rgba(242,242,242,0.6)' }}
          aria-hidden="true"
        />

        {/* Location */}
        <div className="flex flex-col items-center gap-3 min-w-[140px] max-w-[200px]">
          <LocationPinIcon width={24} height={24} color="rgba(242,242,242,0.8)" />
          <span
            className="text-body text-center font-semibold leading-6"
            style={{ color: 'rgba(242,242,242,0.8)' }}
          >
            {location}
          </span>
        </div>
      </div>
    </div>
  );
}
