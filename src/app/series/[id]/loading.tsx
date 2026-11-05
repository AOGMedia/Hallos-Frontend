/** Shown instantly while a series page renders, instead of a blank screen. Mirrors its layout. */
export default function SeriesLoading() {
  return (
    <div className="min-h-screen bg-background-darker" aria-busy="true" aria-label="Loading series">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="w-full aspect-video lg:rounded-xl bg-white/5 animate-pulse" />
            <div className="h-8 w-2/3 rounded bg-white/10 animate-pulse" />
            <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-40 rounded-lg bg-white/5 animate-pulse" />
          </div>
          <div className="hidden lg:block lg:min-w-[320px] h-[220px] rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
