/* eslint-disable @typescript-eslint/no-explicit-any */
import { SeriesScheduleCard } from '@/components/schedule/SeriesScheduleCard';

interface LiveSeriesTabProps {
  communityContent: any[];
}

export function LiveSeriesTab({ communityContent }: LiveSeriesTabProps) {
  const series = communityContent.filter(
    (c: any) => c.contentType === 'series' || c.contentType === 'live_series'
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {series.length === 0 ? (
        <p className="col-span-full text-center text-text-gray py-12">No live series available.</p>
      ) : (
        series.map((c: any) => {
          const data = c.contentData || c;
          return (
            <SeriesScheduleCard
              key={c.id}
              id={c.id}
              title={data.title || 'Untitled Series'}
              description={data.description || ''}
              instructor={data.instructor || data.creatorName || data.hostName || ''}
              thumbnail={data.thumbnail || data.thumbnailUrl || '/placeholder-community.jpg'}
              avatar={data.avatar || data.authorAvatar || data.creatorAvatar || '/placeholder-community.jpg'}
              price={data.price ?? 0}
              currency={data.currency || 'NGN'}
              href={`/series/${c.id}`}
              isLive={data.isLive ?? false}
              matchCourseCardHeight
            />
          );
        })
      )}
    </div>
  );
}
