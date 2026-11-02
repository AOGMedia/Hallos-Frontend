/**
 * The dashboard's frame (sidebar, header bar, content blocks) shown while the
 * signed-in user is still loading — instead of a blank screen. Purely visual:
 * the layout's auth and redirect logic is unchanged and replaces this as soon
 * as the user is known.
 */
export function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full" aria-busy="true" aria-label="Loading your dashboard">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-[247px] flex-col gap-3 border-r border-border px-5 py-6">
        <div className="h-9 w-32 rounded bg-white/10 animate-pulse mb-6" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </aside>

      <div className="flex-1 lg:ml-[247px]">
        {/* Header bar */}
        <div className="h-[72px] border-b border-border flex items-center justify-between px-4 lg:px-10">
          <div className="h-9 w-48 sm:w-72 rounded-full bg-white/5 animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block h-9 w-24 rounded-full bg-white/5 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <main className="px-2 py-6 lg:px-10 lg:py-16 max-w-[1100px] mx-auto">
          <div className="h-8 w-56 rounded bg-white/10 animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
        </main>
      </div>
    </div>
  );
}
