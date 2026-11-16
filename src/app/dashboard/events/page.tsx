import { EventLandingPage } from '@/components/event/EventLandingPage';
import { fetchFeaturedEvent } from '@/lib/seo/publicApi';

// The event as set in the admin (cached for a minute; built-in event if the API is down).
export default async function EventsPage() {
  const event = await fetchFeaturedEvent();
  return <EventLandingPage event={event} />;
}
