'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSignedIn } from '@/hooks/useSignedIn';
import { REGISTER_PARAM } from './registrationDraft';
import { EventLandingHero } from './EventLandingHero';
import { EventVideoJourney } from './video-journey/EventVideoJourney';
import { EventAboutSection } from './EventAboutSection';
import { EventWhyJoinSection } from './EventWhyJoinSection';
import { EventWhoCanApplySection } from './EventWhoCanApplySection';
import { EventLimitedSlotsSection } from './EventLimitedSlotsSection';
import { EventFAQSection } from './EventFAQSection';
// import { EventTermsSection } from './EventTermsSection';
import { RegistrationModal } from './RegistrationModal';
import { Footer } from '../sections/Footer';
import { DEFAULT_EVENT, type FeaturedEvent } from '@/data/featuredEvent';
import { FeaturedEventProvider } from './FeaturedEventContext';
import type { VideoChapter } from './video-journey/types';

interface EventLandingPageProps {
  /** Rendered at the public /events route (site header above it) rather than inside the dashboard. */
  isPublicPage?: boolean;
  /** As set in the admin (fetched on the server); the built-in event if not given. */
  event?: FeaturedEvent;
}

export function EventLandingPage({ isPublicPage = false, event = DEFAULT_EVENT }: EventLandingPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const signedIn = useSignedIn();

  // Anyone can open and fill the form; signing in is asked for at submit,
  // since paying needs an account (see CareerIgniteForm).
  const handleRegister = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Back from sign-in: reopen the form (their answers are restored by the
  // form itself), then tidy the address.
  useEffect(() => {
    if (!signedIn) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get(REGISTER_PARAM) !== '1') return;
    setIsModalOpen(true);
    params.delete(REGISTER_PARAM);
    const rest = params.toString();
    router.replace(rest ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [signedIn, pathname, router]);

  // Stable across re-renders (opening the form mustn't restart the video player's effects).
  const chapters: VideoChapter[] = useMemo(
    () => event.journey.chapters.map((chapter, i) => ({ id: `chapter-${i + 1}`, ...chapter })),
    [event.journey.chapters]
  );

  return (
    <FeaturedEventProvider event={event}>
      <main className="w-full overflow-x-hidden">
        <EventLandingHero onRegister={handleRegister} isPublicPage={isPublicPage} />
        {/* No videos set: leave the section out rather than show an empty player. */}
        {chapters.length > 0 && (
          <EventVideoJourney
            chapters={chapters}
            sectionTitle={event.journey.title}
            sectionSubtitle={event.journey.subtitle}
          />
        )}
        <EventAboutSection />
        <EventWhyJoinSection />
        <EventWhoCanApplySection onRegister={handleRegister} />
        <EventLimitedSlotsSection onRegister={handleRegister} />
        {event.faqs.length > 0 && <EventFAQSection />}
        {/* <EventTermsSection /> */}

        <Footer />
        <RegistrationModal isOpen={isModalOpen} onClose={handleCloseModal} />
      </main>
    </FeaturedEventProvider>
  );
}
