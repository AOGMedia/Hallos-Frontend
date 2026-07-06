/* eslint-disable @typescript-eslint/no-explicit-any */
import { CourseCard } from '@/components/course/CourseCard';

interface VideosTabProps {
  communityContent: any[];
}

export function VideosTab({ communityContent }: VideosTabProps) {
  const videos = communityContent.filter(
    (c: any) => c.contentType === 'video'
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.length === 0 ? (
        <p className="col-span-full text-center text-text-gray py-12">No videos available.</p>
      ) : (
        videos.map((c: any) => {
          const data = c.contentData || c;
          return (
            <CourseCard
              key={c.id}
              {...data}
              id={c.id}
              thumbnail={data.thumbnail || data.thumbnailUrl || '/placeholder-community.jpg'}
              avatar={data.avatar || data.authorAvatar || undefined}
            />
          );
        })
      )}
    </div>
  );
}
