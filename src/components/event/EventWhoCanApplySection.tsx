'use client';

import { BadgeCheck, UserPlus } from 'lucide-react';
import Image from 'next/image';

const CRITERIA = [
  'Growth-minded individuals',
  'Passionate learners',
  'Career-focused participants',
  'Must be available for the full 2-days',
];

interface EventWhoCanApplySectionProps {
  onRegister: () => void;
}

export function EventWhoCanApplySection({ onRegister }: EventWhoCanApplySectionProps) {
  return (
    <section
      aria-label="Who can apply"
      className="event-section-dark w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-[60px]">
        {/* Section heading */}
        <h2
          className="text-center"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 800,
            lineHeight: '80px',
            color: '#f2f2f2',
          }}
        >
          Who can apply?
        </h2>

        {/* Content: image + checklist */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Circular image */}
          <div className="flex-shrink-0">
            <div
              className="rounded-full overflow-hidden w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px]"
              style={{
                border: '3px solid rgba(106, 87, 229, 0.5)',
                boxShadow: '0 0 60px rgba(106, 87, 229, 0.3)',
              }}
            >
              <Image
                src="/images/event/who-can-apply-hero.svg"
                alt="A person with headphones using a laptop, representing event attendees"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Checklist + CTAs */}
          <div className="flex flex-col gap-[60px] flex-1">
            {/* Checklist */}
            <ul className="flex flex-col gap-6" role="list">
              {CRITERIA.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4">
                
                  <BadgeCheck className='text-[#1DBF5380]'/>
                  <span
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 'clamp(20px, 2.5vw, 32px)',
                      fontWeight: 300,
                      color: '#f2f2f2',
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Register primary button */}
              <button
                onClick={onRegister}
                aria-label="Register for the event"
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Register
                <UserPlus size={18} aria-hidden="true" />
              </button>

              {/* Secure a slot — ghost/outline button */}
              <button
                onClick={onRegister}
                aria-label="Secure a slot at the event"
                className="px-8 py-4 rounded-full font-bold text-base hover:bg-white/5 active:scale-95 transition-all duration-200 cursor-pointer"
                style={{
                  border: '1px solid rgba(229, 229, 229, 0.4)',
                  color: 'rgba(229, 229, 229, 0.95)',
                }}
              >
                Secure a slot
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
