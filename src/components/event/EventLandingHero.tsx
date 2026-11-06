"use client";

import Image from "next/image";
import { UserPlus, ArrowRight } from "lucide-react";
import { EventInfoBar } from "./EventInfoBar";
import Link from "next/link";
import { FEATURED_EVENT } from "@/data/featuredEvent";
import { MemberBackBar } from "@/components/nav/MemberBackBar";

interface EventLandingHeroProps {
  onRegister?: () => void;
  isLandingPage?: boolean;
  /** Public /events page: room for the site header (visitors) or the Back bar (signed in). */
  isPublicPage?: boolean;
}

export function EventLandingHero({
  onRegister,
  isLandingPage = false,
  isPublicPage = false,
}: EventLandingHeroProps) {
  const EventTitle = isLandingPage ? "h2" : "h1";

  return (
    // Room at the top for the site header (visitors) or the Back bar (signed in).
    <section aria-label="Event hero" className={isLandingPage || isPublicPage ? "pt-20" : "pt-16"}>
      {/* Signed-in people get a Back bar instead of the visitor menu (not on the homepage banner). */}
      {!isLandingPage && <MemberBackBar />}
      {/* Colorful gradient hero background */}
      <div className="event-hero-colorful-bg relative w-full overflow-hidden">

        {/* Mesh/grid texture overlay */}
        <Image
          src="/images/event/bg-vector.webp"
          alt=""
          aria-hidden="true"
          fill
          // Decorative texture at 20% opacity, and the page's LCP element:
          // full-width, low quality is visually identical and much smaller.
          sizes="100vw"
          quality={45}
          className="w-full h-full object-cover opacity-20 pointer-events-none select-none"
          priority
        />

        <div className="relative z-10 flex flex-col items-center pt-12 sm:pt-16 px-4 pb-0">
          {/* THEME 2026 gradient title. On the homepage this is a promo
              banner, so it's an h2 — the page's single h1 is the Hero. */}
          <EventTitle
            className="text-center"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 800,
              lineHeight: 1.25,
              background:
                "linear-gradient(89.24deg, rgba(0,0,0,1) 15.36%, rgba(106,87,229,1) 83.03%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {FEATURED_EVENT.name}
          </EventTitle>

          {/* Register/Learn More button */}
          {isLandingPage ? (
            <Link
              href="/events"
              aria-label="Learn more about the event"
              className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Learn More
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <button
              onClick={onRegister}
              aria-label="Register for the event"
              className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-bold text-base hover:opacity-90 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Register
              <UserPlus size={18} aria-hidden="true" />
            </button>
          )}

          {/* Speaker images */}
          <div className="mt-8 mb-8 w-full flex justify-center ">
            <Image
              src="/images/event/speakers-hero.webp"
              alt="Event speakers and hosts"
              width={878}
              height={400}
              sizes="(min-width: 910px) 878px, 100vw"
              // Above the fold on every page that shows this hero: load it first.
              priority
              className="w-full max-w-[878px] h-auto"
            />
          </div>
        </div>
      </div>

      {/* Event details info bar */}
      <div className="px-4 sm:px-8 lg:px-16 -mt-6 sm:-mt-8 relative z-20">
        <EventInfoBar
          date={FEATURED_EVENT.dateLabel}
          time={FEATURED_EVENT.durationLabel}
          location={FEATURED_EVENT.locationLabel}
        />
      </div>
    </section>
  );
}
