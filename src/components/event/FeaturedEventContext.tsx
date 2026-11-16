'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_EVENT, type FeaturedEvent } from '@/data/featuredEvent';

/**
 * The event the page is showing (fetched on the server, see publicApi
 * fetchFeaturedEvent). Outside a provider, sections show the built-in event,
 * so they keep working wherever they're used on their own.
 */
const FeaturedEventContext = createContext<FeaturedEvent>(DEFAULT_EVENT);

export function FeaturedEventProvider({ event, children }: { event: FeaturedEvent; children: ReactNode }) {
  return <FeaturedEventContext.Provider value={event}>{children}</FeaturedEventContext.Provider>;
}

export const useFeaturedEvent = () => useContext(FeaturedEventContext);
