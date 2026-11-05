import { unstable_cache } from 'next/cache';
import { requestLandingLiveContent, type LandingLiveContent } from './landingContent';

/**
 * Server-side load for the homepage section, cached for 5 minutes.
 *
 * GET /live/getLive is slow (~9s on the current backend), so without a cache
 * every homepage render — every request in dev — would wait on it. Only
 * successes are cached: a thrown error isn't stored, so the next render retries.
 */
const cachedLandingLiveContent = unstable_cache(requestLandingLiveContent, ['landing-live-content'], {
  revalidate: 300,
});

/** null when the backend couldn't be reached (as opposed to "no classes right now"). */
export async function loadLandingLiveContent(): Promise<LandingLiveContent | null> {
  try {
    return await cachedLandingLiveContent();
  } catch (error) {
    console.error('[PopularClasses] Error fetching live content:', error);
    return null;
  }
}
