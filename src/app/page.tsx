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
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/seo/site";
import { eventSchema, faqSchema } from "@/lib/seo/jsonLd";
import { HOME_FAQS } from "@/data/faqs";
import { FEATURED_EVENT, isFeaturedEventUpcoming } from "@/data/featuredEvent";

// Re-render daily so the event schema drops off on its own once the event ends.
export const revalidate = 86400;

export const metadata = {
  ...buildMetadata({
    title: SITE.title,
    description: SITE.description,
    path: "/",
  }),
  // The homepage title stands alone, without the "| Hallos" suffix.
  title: { absolute: SITE.title },
};

export default function Home() {
  const structuredData = [
    faqSchema(HOME_FAQS),
    ...(isFeaturedEventUpcoming()
      ? [
          eventSchema({
            name: FEATURED_EVENT.name,
            description: FEATURED_EVENT.description,
            startDate: FEATURED_EVENT.startDate,
            endDate: FEATURED_EVENT.endDate,
            path: FEATURED_EVENT.path,
            image: FEATURED_EVENT.image,
            locationName: FEATURED_EVENT.locationLabel,
            locality: FEATURED_EVENT.locality,
            country: FEATURED_EVENT.country,
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
