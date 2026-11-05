import { PopularClasses } from '@/components/sections/PopularClasses';
import { toPublicLandingContent } from '@/lib/live/landingContent';
import { loadLandingLiveContent } from '@/lib/live/landingContent.server';

/**
 * Server wrapper for the homepage "Popular Live Classes" section: loads the
 * real classes (cached 5 min) so they're in the HTML, then hands them to the
 * client component. Rendered inside <Suspense> on the homepage, so a slow
 * backend never holds up the rest of the page.
 */
export async function PopularClassesSection() {
  const loaded = await loadLandingLiveContent();
  if (!loaded && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    // Background revalidation with the backend down: throwing makes Next keep
    // serving the last good homepage instead of caching one without classes.
    // (Never at build time — a deploy must not depend on the backend — and
    // never in dev.)
    throw new Error('Homepage live classes could not be loaded; keeping the previous version');
  }
  // Private fields (creator emails, room ids) are stripped before embedding.
  return <PopularClasses initialData={toPublicLandingContent(loaded ?? { classes: [], series: [] })} />;
}
