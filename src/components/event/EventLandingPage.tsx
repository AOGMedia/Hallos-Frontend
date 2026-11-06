'use client';

import { useEffect, useState } from 'react';
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
import { MOCK_VIDEO_CHAPTERS } from './video-journey/constants';

interface EventLandingPageProps {
  /** Rendered at the public /events route (site header above it) rather than inside the dashboard. */
  isPublicPage?: boolean;
}

export function EventLandingPage({ isPublicPage = false }: EventLandingPageProps) {
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

  return (
    <main className="w-full overflow-x-hidden">
      <EventLandingHero onRegister={handleRegister} isPublicPage={isPublicPage} />
      <EventVideoJourney
        chapters={MOCK_VIDEO_CHAPTERS}
        sectionTitle="Event Journey"
        sectionSubtitle="Relive every moment, from keynote to closing."
      />
      <EventAboutSection />
      <EventWhyJoinSection />
      <EventWhoCanApplySection onRegister={handleRegister} />
      <EventLimitedSlotsSection onRegister={handleRegister} />
      <EventFAQSection />
      {/* <EventTermsSection /> */}
      
<Footer />
      <RegistrationModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </main>
  );
}
