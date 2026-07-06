"use client";

import { useQuery } from '@tanstack/react-query';
import { listSeries } from '@/services/seriesService';
import { seriesToLiveSeriesData } from '@/utils/seriesMapper';
import { LiveSeriesSection } from "@/components/dashboard/invite";

export default function InvitePage() {
  // Fetch series data from API
  const { data: seriesData = [], isLoading, error } = useQuery({
    queryKey: ['invite-series'],
    queryFn: () => listSeries(),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading series...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-red-400">
          Failed to load series. Please try again.
        </div>
      </main>
    );
  }

  if (seriesData.length === 0) {
    return (
      <main className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-text-muted">
          No live series available at the moment.
        </div>
      </main>
    );
  }

  // Map series data to LiveSeriesData format
  const liveSeriesList = seriesData.map(seriesToLiveSeriesData);

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col">
        {liveSeriesList.map((series, index) => (
          <div key={series.id}>
            {index > 0 && (
              <div
                className="w-full my-8"
                style={{ height: 1, background: "var(--border)" }}
                aria-hidden="true"
              />
            )}
            <LiveSeriesSection
              series={series}
              reserveHref={`/series/${series.id}`}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
