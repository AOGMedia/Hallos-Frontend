/**
 * Shown instantly while /course renders on the server, instead of a blank
 * screen. Lives in the (catalog) group so it only applies to /course — not to
 * the course and department pages, whose 404s must stay real status codes.
 */
export default function CourseCatalogLoading() {
  return (
    <div
      className="w-full min-h-screen"
      style={{ background: 'linear-gradient(249.02deg, rgba(106, 87, 229, 0) 4.59%, #1F2636 95.53%)' }}
    >
      <section className="pt-20 mb-8 sm:mb-12 lg:mb-20 p-4 sm:p-6" aria-busy="true" aria-label="Loading courses">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="h-6 w-48 rounded bg-white/10 animate-pulse" />
          <div className="h-9 w-56 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="flex gap-2.5 mb-6 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-28 flex-shrink-0 rounded-full bg-white/5 animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 2 }).map((_, row) => (
          <div key={row} className="flex gap-4 mb-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[260px] w-[240px] flex-shrink-0 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
