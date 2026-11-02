/**
 * Live series URLs. The canonical form carries the title for search engines
 * and people reading the link — /series/personal-branding-course-<uuid> — but
 * every page resolves the series by the trailing UUID, so bare /series/<uuid>
 * links (payment callbacks, shared links, dashboard cards) keep working.
 */

const UUID_AT_END = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** Canonical path for a series: /series/<title-slug>-<uuid>. */
export function seriesPath(series: { id: string; title?: string | null }): string {
  const slug = series.title ? slugify(series.title) : '';
  return slug ? `/series/${slug}-${series.id}` : `/series/${series.id}`;
}

/** The series UUID from a route param that is either "<uuid>" or "<slug>-<uuid>". */
export function seriesIdFromParam(param: string): string {
  const decoded = decodeURIComponent(param);
  return decoded.match(UUID_AT_END)?.[1] ?? decoded;
}
