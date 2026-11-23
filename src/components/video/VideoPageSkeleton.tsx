/** The video page's shape while it loads (instead of a plain "Loading…"). */
export function VideoPageSkeleton() {
  const block = 'animate-pulse rounded bg-white/[0.06]';
  return (
    <div className="min-h-screen bg-background-darker md:px-6 md:py-6" aria-busy="true" aria-label="Loading video">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="aspect-video w-full animate-pulse bg-white/[0.06] md:rounded-xl" />
          <div className="space-y-3 p-4 md:px-0">
            <div className={`${block} h-5 w-3/4`} />
            <div className={`${block} h-4 w-1/3`} />
            <div className="flex items-center gap-3 pt-2">
              <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
              <div className={`${block} h-4 w-32`} />
            </div>
          </div>
        </div>
        <div className="hidden w-[400px] shrink-0 flex-col gap-3 lg:flex">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <div className="aspect-video w-44 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
              <div className="flex-1 space-y-2 py-1"><div className={`${block} h-3 w-full`} /><div className={`${block} h-3 w-2/3`} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
