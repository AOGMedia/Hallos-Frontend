'use client';

import { useState } from 'react';
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

export function EventLandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegister = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <main className="w-full overflow-x-hidden">
      <EventLandingHero onRegister={handleRegister} />
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
