/* eslint-disable @typescript-eslint/no-explicit-any */
import { CourseCard } from '@/components/course/CourseCard';
import { liveClassHref } from '@/lib/live/providers';

interface LiveClassesTabProps {
  communityContent: any[];
  currentUserId?: string;
}

export function LiveClassesTab({ communityContent, currentUserId }: LiveClassesTabProps) {
  const classes = communityContent.filter(
    (c: any) => c.contentType === 'class' || c.contentType === 'live_class'
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.length === 0 ? (
        <p className="col-span-full text-center text-text-gray py-12">No live classes available.</p>
      ) : (
        classes.map((c: any) => {
          const data = c.contentData || c;
          const isLiveNow = data.status === 'live' || (
            data.status === 'scheduled' && data.startTime && data.endTime && (() => {
              const now = new Date();
              return now >= new Date(data.startTime) && now <= new Date(data.endTime);
            })()
          );
          const scheduledFor = data.status === 'scheduled' && !isLiveNow && data.startTime
            ? data.startTime
            : undefined;

          return (
            <CourseCard
              key={c.id}
              id={c.id}
              title={data.title || 'Untitled Class'}
              description={data.description || ''}
              instructor={data.instructor || data.creatorName || data.hostName || ''}
              thumbnail={data.thumbnail || data.thumbnailUrl || '/placeholder-community.jpg'}
              avatar={data.avatar || data.authorAvatar || undefined}
              price={data.price ?? 0}
              currency={data.currency || 'NGN'}
              duration={data.duration || ''}
              posted={data.posted || (data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '')}
              rating={data.rating ?? 0}
              reviews={data.reviews || '0'}
              isLive={Boolean(isLiveNow)}
              scheduledFor={scheduledFor}
              href={liveClassHref(data, currentUserId)}
            />
          );
        })
      )}
    </div>
  );
}
