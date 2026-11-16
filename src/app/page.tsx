// import { EventSection } from '@/components/event';
// import { mockRootProps } from '@/components/event/eventMockData';
import { Hero } from "@/components/sections/Hero";
// Hallos Millionaires Retreat hero: hidden from the landing page for now.
// import { EventLandingHero } from "@/components/event/EventLandingHero";
// import { SearchSection } from '@/components/sections/SearchSection';
import { GamersSection } from "@/components/sections/GamersSection";
import { Suspense } from "react";
import { PopularClassesSkeleton } from "@/components/sections/PopularClasses";
import { PopularClassesSection } from "@/components/sections/PopularClassesSection";
import { LiveClassShowSection } from "@/components/sections/LiveClassShowSection";
import { Features } from "@/components/sections/Features";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";
import { SpecialCoursesSection } from "@/components/dashboard/SpecialCoursesSection";
import { LandingRedirect } from "@/components/auth/LandingRedirect";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/seo/site";
import { eventSchema, faqSchema } from "@/lib/seo/jsonLd";
import { HOME_FAQS } from "@/data/faqs";
import { FEATURED_EVENT_PATH, isFeaturedEventUpcoming } from "@/data/featuredEvent";
import { fetchFeaturedEvent } from "@/lib/seo/publicApi";

// Re-rendered every 5 minutes: keeps the server-rendered "Popular Live Classes"
// current (its data is cached for the same window), and drops the event schema
// on its own once the event ends.
export const revalidate = 300;

export const metadata = {
  ...buildMetadata({
    title: SITE.title,
    description: SITE.description,
    path: "/",
  }),
  // The homepage title stands alone, without the "| Hallos" suffix.
  title: { absolute: SITE.title },
};

export default async function Home() {
  // As set in the admin; cached for a minute, built-in event if the API is slow or down.
  const event = await fetchFeaturedEvent();
  const structuredData = [
    faqSchema(HOME_FAQS),
    ...(isFeaturedEventUpcoming(new Date(), event)
      ? [
          eventSchema({
            name: event.name,
            description: event.description,
            startDate: event.startDate,
            endDate: event.endDate,
            path: FEATURED_EVENT_PATH,
            image: event.image,
            locationName: event.locationLabel,
            locality: event.locality,
            country: event.country,
          }),
        ]
      : []),
  ];

  return (
    <div className="min-h-screen ">
      <JsonLd data={structuredData} />
      <LandingRedirect />
      <main>
        {/* <EventSection {...mockRootProps} /> */}
        {/* Hallos Millionaires Retreat hero: hidden for now. Uncomment (and its import) to bring it back. */}
        {/* <EventLandingHero isLandingPage={true} /> */}
        <Hero />
        {/* <SearchSection header1='Find your ' header2='next class'/> */}

        {/* Streams in when its data arrives — the slow classes API never blocks the page */}
        <Suspense fallback={<PopularClassesSkeleton />}>
          <PopularClassesSection />
        </Suspense>

        <div>
          <SpecialCoursesSection isLandingPage={true} />
        </div>

        <LiveClassShowSection />
        <GamersSection />

        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
