// import { EventSection } from '@/components/event';
// import { mockRootProps } from '@/components/event/eventMockData';
import { Hero } from "@/components/sections/Hero";
import { EventLandingHero } from "@/components/event/EventLandingHero";
// import { SearchSection } from '@/components/sections/SearchSection';
import { GamersSection } from "@/components/sections/GamersSection";
import { PopularClasses } from "@/components/sections/PopularClasses";
import { LiveClassShowSection } from "@/components/sections/LiveClassShowSection";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import { SpecialCoursesSection } from "@/components/dashboard/SpecialCoursesSection";
import { LandingRedirect } from "@/components/auth/LandingRedirect";

export default function Home() {
  return (
    <div className="min-h-screen ">
      <LandingRedirect />
      <main>
        {/* <EventSection {...mockRootProps} /> */}
        <EventLandingHero isLandingPage={true} />
        <Hero />
        {/* <SearchSection header1='Find your ' header2='next class'/> */}

        <PopularClasses />
        
        <GamersSection />

        <LiveClassShowSection />
        <div>
          <SpecialCoursesSection isLandingPage={true} />
        </div>
        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
