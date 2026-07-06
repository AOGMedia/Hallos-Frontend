import { Download, Mic2, Users, Wallet, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export function EventAboutSection() {
  return (
    <section
      aria-label="About this event"
      className="event-limited-section-bg relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden"
    >
      {/* Background mesh decoration */}
      <Image
        src="/images/event/bg-mesh-slots.svg"
        alt=""
        aria-hidden="true"
        width={800}
        height={800}
        className="absolute left-0 rotate-165 bottom-0 w-auto h-[70%] opacity-40 pointer-events-none select-none"
      />
      <div className="max-w-[1440px] mx-auto flex flex-col gap-[60px]">
        {/* Section heading — ghost effect */}
        <h2
          className="heading-section text-center"
          style={{ color: '#f2f2f2' }}
        >
          About this Event
        </h2>

        {/* Cards grid: 2 columns with 3fr / 2fr ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10">
          {/* Row 1 */}
          {/* Card 1 — Value proposition (dark gradient) */}
          <div className="event-about-card-dark"
          
          >
            <div className="event-card-icon-badge">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(106,87,229,0.15)' }}
              >
                <Download size={16} color="#6a57e5" aria-hidden="true" />
              </div>
              <span
                className="text-regular"
                style={{ color: 'rgba(242,242,242,0.7)' }}
              >
                Value proposition
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(22px, 2.5vw, 32px)',
                fontWeight: 600,
                lineHeight: '46.40px',
                color: '#f2f2f2',
              }}
            >
              A 2-day, all-expense paid experience designed to help you gain
              practical life skills, accelerate your personal growth, and move
              your career forward with clarity.
            </p>
          </div>

          {/* Card 2 — Perks */}
          <div className="event-about-card-perks">
            <div className="event-card-icon-badge">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(106,87,229,0.15)' }}
              >
                <Mic2 size={16} color="#6a57e5" aria-hidden="true" />
              </div>
              <span
                className="text-regular"
                style={{ color: 'rgba(242,242,242,0.7)' }}
              >
                Perks
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(22px, 2.5vw, 32px)',
                fontWeight: 600,
                lineHeight: '46.40px',
                color: '#f2f2f2',
              }}
            >
              Gain real-world insights, connect with ambitious peers, and take
              your next step with confidence.
            </p>
          </div>

          {/* Row 2 */}
          {/* Card 3 — Commitment (warm gradient) */}
          <div className="event-about-card-commitment">
            <div className="event-card-icon-badge">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(182,31,112,0.15)' }}
              >
                <Users size={16} color="rgba(182,31,112,0.9)" aria-hidden="true" />
              </div>
              <span
                className="text-regular"
                style={{ color: 'rgba(242,242,242,0.7)' }}
              >
                Commitment and context
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(22px, 2.5vw, 32px)',
                fontWeight: 600,
                lineHeight: '46.40px',
                color: '#f2f2f2',
              }}
            >
              Open to individuals ready to take action. A ₦3,000 commitment fee
              applies to complete your registration.
            </p>
            <button
              className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="View terms and conditions"
            >
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'rgba(242,242,242,0.7)',
                }}
              >
                Terms and conditions apply
              </span>
              <ArrowRight size={14} color="rgba(242,242,242,0.7)" aria-hidden="true" />
            </button>
          </div>

          {/* Card 4 — Save your slot (radial gradient CTA) */}
          <div className="event-about-card-register relative overflow-hidden">
            {/* Mesh texture overlay – matching hero */}
            <Image
              src="/images/event/bg-vector.svg"
              alt=""
              aria-hidden="true"
              fill
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
            />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="event-card-icon-badge">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <Wallet size={16} color="#1f2636" aria-hidden="true" />
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#000000',
                  }}
                >
                  Register
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 800,
                    background: 'linear-gradient(89.24deg, rgba(0,0,0,1) 15.36%, rgba(106,87,229,1) 83.03%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Save your slot
                </span>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
