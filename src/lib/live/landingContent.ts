import { listLiveClassesExternal, type LiveClass } from '@/services/liveClassService';
import { listSeries } from '@/services/seriesService';
import type { Series } from '@/types/series';

/**
 * Data for the homepage "Popular Live Classes" section. Shared by the client
 * component (React Query) and the homepage server render, so search engines
 * get the real classes in the HTML instead of the placeholder cards.
 *
 * Never throws: on failure it returns empty lists and the section falls back
 * to its placeholder cards, as before.
 */

export interface LandingLiveContent {
  classes: LiveClass[];
  series: Series[];
}

/** Throws when the backend can't be reached. */
export async function requestLandingLiveContent(): Promise<LandingLiveContent> {
  const [liveClasses, allSeries] = await Promise.all([listLiveClassesExternal(), listSeries()]);

  // Upcoming/ongoing public classes only
  const classes = liveClasses.filter(
    (c) => c.status !== 'ended' && c.status !== 'recorded' && c.privacy !== 'private'
  );
  // Public, active series only
  const series = allSeries.filter((s) => s.status === 'active' && s.privacy === 'public');

  return { classes, series };
}

/** Browser-side fetch for React Query. Never throws: empty lists on failure. */
export async function fetchLandingLiveContent(): Promise<LandingLiveContent> {
  try {
    return await requestLandingLiveContent();
  } catch (error) {
    console.error('[PopularClasses] Error fetching live content:', error);
    return { classes: [], series: [] };
  }
}


/**
 * Copy of the content that is safe to embed in page HTML: drops creator
 * emails and streaming room details, which the API includes but the cards
 * never show. (The browser's own refetch still gets the full objects.)
 */
export function toPublicLandingContent(content: LandingLiveContent): LandingLiveContent {
  return {
    classes: content.classes.map((c) => ({ ...c, zego_room_id: undefined, zego_app_id: undefined })),
    series: content.series.map((s) => ({ ...s, creator: s.creator ? { ...s.creator, email: '' } : s.creator })),
  };
}
