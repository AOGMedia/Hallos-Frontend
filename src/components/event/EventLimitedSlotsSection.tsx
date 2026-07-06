import Image from 'next/image';
import { CountdownTimer } from './CountdownTimer';
import CalendarIcon from '@/components/icons/CalendarIcon';
import ClockIcon from '@/components/icons/ClockIcon';
import LocationPinIcon from '@/components/icons/LocationPinIcon';

interface EventLimitedSlotsSectionProps {
  onRegister: () => void;
}

export function EventLimitedSlotsSection({ onRegister }: EventLimitedSlotsSectionProps) {
  // registration deadline: July 5, 2026 (local time at 23:59:59)
  const targetDate = new Date(2026, 6, 5, 23, 59, 59);
  const targetIso = targetDate.toISOString();
  return (
    <section
      aria-label="Limited slots available"
      className="event-limited-section-bg relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden"
    >
      {/* Background mesh decoration */}
      <Image
        src="/images/event/bg-mesh-slots.svg"
        alt=""
        aria-hidden="true"
        width={1000}
        height={1000}
        className="absolute left-0 rotate-165  bottom-0 w-auto h-[70%] opacity-40 pointer-events-none select-none"
      />

      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col gap-[40px]">
        {/* Heading block */}
        <div className="flex flex-col gap-4">
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              lineHeight: '80px',
              color: '#f2f2f2',
            }}
          >
            Limited slots available.
          </h2>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '16px',
              fontWeight: 500,
              color: 'rgba(242,242,242,0.7)',
            }}
          >
            Don&apos;t miss this opportunity to fast-track your growth.
          </p>
        </div>

        {/* Info card + countdown row */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Event info card */}
          <div className="event-info-bar flex-1 min-h-[192px]">
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

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 h-full">
              {/* Date */}
              <div className="flex flex-col items-center gap-3">
                <CalendarIcon width={24} height={24} color="rgba(242,242,242,0.8)" />
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(242,242,242,0.8)',
                  }}
                >
                   24th & 25th July
                </span>
              </div>

              <div
                className="hidden sm:block flex-1 h-px"
                style={{ borderTop: '1px dashed rgba(242,242,242,0.6)' }}
                aria-hidden="true"
              />

              {/* Time */}
              <div className="flex flex-col items-center gap-3">
                <ClockIcon width={24} height={24} />
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(242,242,242,0.8)',
                  }}
                >
                  2 days
                </span>
              </div>

              <div
                className="hidden sm:block flex-1 h-px"
                style={{ borderTop: '1px dashed rgba(242,242,242,0.6)' }}
                aria-hidden="true"
              />

              {/* Location */}
              <div className="flex flex-col items-center gap-3 max-w-[160px]">
                <LocationPinIcon width={24} height={24} color="rgba(242,242,242,0.8)" />
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'rgba(242,242,242,0.8)',
                    textAlign: 'center',
                    lineHeight: '24px',
                  }}
                >
                  Lagos, Nigeria
                </span>
              </div>
            </div>
          </div>

          {/* Countdown block */}
          <div className="flex flex-col w-full lg:w-auto lg:min-w-[426px]">
            {/* COUNTDOWN header */}
            <div className="event-countdown-header relative overflow-hidden py-3 px-6">
              <Image
                src="/images/event/bg-mesh-countdown-header.svg"
                alt=""
                aria-hidden="true"
                fill
                className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none select-none"
              />
              <span
                className="relative z-10 block text-center"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: '40px',
                  color: '#f2f2f2',
                }}
              >
                COUNTDOWN
              </span>
            </div>

            {/* Countdown numbers */}
            <div className="event-countdown-body relative p-5">
              <Image
                src="/images/event/bg-mesh-countdown.svg"
                alt=""
                aria-hidden="true"
                fill
                className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none select-none"
              />
              <div className="relative z-10">
                <CountdownTimer targetDate={targetIso} />
              </div>
            </div>
          </div>
        </div>

        {/* Register now CTA */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onRegister}
            aria-label="Register now"
            className="px-16 py-4 rounded-full bg-primary text-white font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Register now
          </button>
        </div>
      </div>
    </section>
  );
}
