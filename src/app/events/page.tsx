import type { Metadata } from 'next';
import { EventLandingPage } from '@/components/event/EventLandingPage';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { breadcrumbSchema, eventSchema } from '@/lib/seo/jsonLd';
import { fetchFeaturedEvent } from '@/lib/seo/publicApi';
import { isFeaturedEventUpcoming } from '@/data/featuredEvent';

/**
 * Public events page — the same content as /dashboard/events, readable
 * without signing in. Anyone can fill the application; paying needs an
 * account, so a visitor who submits signs in and comes back to the form with
 * their answers kept.
 *
 * The content is set by staff in the admin (Event page) and falls back to the
 * built-in event if the API can't be reached.
 */

// Re-rendered at most every minute, so admin changes show without a deploy
// (and the event schema drops off on its own once the event ends).
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const event = await fetchFeaturedEvent();
  return buildMetadata({
    title: event.name,
    description: `${event.dateLabel} · ${event.locationLabel}. ${event.description}`,
    thumbnail: event.image,
    path: '/events',
  });
}

export default async function EventsPage() {
  const event = await fetchFeaturedEvent();
  return (
    <>
      <JsonLd
        data={[
          ...(isFeaturedEventUpcoming(new Date(), event)
            ? [
                eventSchema({
                  name: event.name,
                  description: event.description,
                  startDate: event.startDate,
                  endDate: event.endDate,
                  path: '/events',
                  image: event.image,
                  locationName: event.locationLabel,
                  locality: event.locality,
                  country: event.country,
                }),
              ]
            : []),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Events', path: '/events' },
          ]),
        ]}
      />
      <EventLandingPage isPublicPage event={event} />
    </>
  );
}
