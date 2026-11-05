/** Shown instantly while /classes renders, instead of a blank screen. */
export default function ClassesLoading() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1200px] mx-auto" aria-busy="true" aria-label="Loading classes">
      <div className="mb-10 max-w-3xl">
        <div className="h-10 w-56 rounded bg-white/10 animate-pulse mb-4" />
        <div className="h-4 w-full rounded bg-white/5 animate-pulse mb-2" />
        <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="h-7 w-48 rounded bg-white/10 animate-pulse mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <div className="h-44 bg-white/5 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
