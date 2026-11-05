import { EventLandingPage } from '@/components/event/EventLandingPage';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { breadcrumbSchema, eventSchema } from '@/lib/seo/jsonLd';
import { FEATURED_EVENT, isFeaturedEventUpcoming } from '@/data/featuredEvent';

/**
 * Public events page — the same content as /dashboard/events, reachable
 * without signing in (registration itself doesn't need an account).
 */

// Re-render daily so the event schema drops off on its own once the event ends.
export const revalidate = 86400;

export const metadata = buildMetadata({
  title: FEATURED_EVENT.name,
  description: `${FEATURED_EVENT.dateLabel} · ${FEATURED_EVENT.locationLabel}. ${FEATURED_EVENT.description}`,
  thumbnail: FEATURED_EVENT.image,
  path: '/events',
});

export default function EventsPage() {
  return (
    <>
      <JsonLd
        data={[
          ...(isFeaturedEventUpcoming()
            ? [
                eventSchema({
                  name: FEATURED_EVENT.name,
                  description: FEATURED_EVENT.description,
                  startDate: FEATURED_EVENT.startDate,
                  endDate: FEATURED_EVENT.endDate,
                  path: '/events',
                  image: FEATURED_EVENT.image,
                  locationName: FEATURED_EVENT.locationLabel,
                  locality: FEATURED_EVENT.locality,
                  country: FEATURED_EVENT.country,
                }),
              ]
            : []),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Events', path: '/events' },
          ]),
        ]}
      />
      <EventLandingPage isPublicPage />
    </>
  );
}
