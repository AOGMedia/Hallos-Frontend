import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Users, Rocket, Brain, Target } from 'lucide-react';

const WHY_JOIN_FEATURES = [
  {
    icon: Rocket,
    title: 'Accelerated Growth',
    description: 'Learn practical skills you can apply immediately',
    highlighted: false,
  },
  {
    icon: Users,
    title: 'High-Value Networking',
    description: 'Connect with ambitious, like-minded individuals',
    highlighted: false,
  },
  {
    icon: Brain,
    title: 'Real-Life Skills',
    description: "Gain insights they don't teach in school",
    highlighted: false,
  },
  {
    icon: Target,
    title: 'Clarity & Direction',
    description: 'Leave with a clear plan for your next phase',
    highlighted: true,
  },
];

export function EventWhyJoinSection() {
  return (
    <section
      aria-label="Why you should join"
      className="event-limited-section-bg relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16 overflow-hidden"
    >
      {/* Background mesh decoration */}
      <Image
        src="/images/event/bg-mesh-slots.svg"
        alt=""
        aria-hidden="true"
        width={800}
        height={800}
        className="absolute left-0 rotate-180 bottom-0 w-auto h-[70%] opacity-40 pointer-events-none select-none"
      />
      <div className="max-w-[1440px] mx-auto flex flex-col gap-[60px]">
        {/* Heading + badge tags */}
        <div className="flex flex-col items-center gap-[10px]">
          <h2
            className="text-center"
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              lineHeight: '80px',
              color: '#f2f2f2',
            }}
          >
            Why you should{' '}
            <span style={{ color: '#00abe4' }}>Join</span>
          </h2>

          {/* Feature tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {/* 100% Free */}
            {/* <span
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                border: '1px solid rgba(20, 200, 119, 0.20)',
                background: 'rgba(20, 200, 119, 0.04)',
              }}
            >
              <Users
                size={14}
                style={{ color: '#14c877' }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#14c877',
                }}
              >
                100% Free
              </span>
            </span> */}

            {/* All expense covered */}
            {/* <span
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                border: '1px solid rgba(0, 171, 228, 0.20)',
                background: 'rgba(0, 171, 228, 0.04)',
              }}
            >
              <UserPlus
                size={12}
                style={{ color: '#00abe4' }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#00abe4',
                }}
              >
                All expense covered
              </span>
            </span> */}

            {/* Limited slots */}
            {/* <span
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                border: '1px solid rgba(217, 200, 15, 0.20)',
                background: 'rgba(217, 200, 15, 0.04)',
              }}
            >
              <Video
                size={14}
                style={{ color: '#d9c80f' }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#d9c80f',
                }}
              >
                Limited slots
              </span>
            </span> */}
          </div>

          
        </div>

        {/* Feature columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_JOIN_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="event-info-bar relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4"
            >
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

              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-2">
                  <feature.icon size={24} color="#ffffff" />
                  <h3
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 'clamp(22px, 2vw, 32px)',
                      fontWeight: 700,
                      lineHeight: '46.40px',
                      color: '#f2f2f2',
                    }}
                  >
                    {feature.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontFamily: 'Plus Jakarta Sans", sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: '22.40px',
                    color: 'rgba(242,242,242,0.8)',
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div className="flex justify-center">
          <Button variant="primary" size="lg" className="px-10">
            Secure your slot
          </Button>
        </div>
      </div>
    </section>
  );
}


