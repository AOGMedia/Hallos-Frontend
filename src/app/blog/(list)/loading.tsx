/** Same skeleton the client-rendered blog used, now shown while the server fetches posts. */
export default function BlogLoading() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-28 pb-20 max-w-[1100px] mx-auto">
      <div className="mb-10">
        <div className="h-9 w-32 bg-white/5 rounded animate-pulse mb-3" />
        <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <div className="h-40 bg-white/5 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
