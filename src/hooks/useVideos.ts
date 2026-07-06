import { useQuery } from '@tanstack/react-query';
import { getVideos, type GetVideosParams, type VideoListItem } from '@/lib/api/videos';

export function useVideos(params: GetVideosParams = {}) {
  return useQuery<VideoListItem[], Error>({
    queryKey: ['videos', params],
    queryFn: () => getVideos(params),
  });
}