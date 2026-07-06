import { SquarePlay } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { VideoCard } from './VideoCard';
import { formatCurrency } from '@/utils/formatters';

interface TopVideosSectionProps {
  videos: Array<{
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    author: string;
    authorAvatar: string;
    isLive: boolean;
    duration: number;
    postedDate: Date;
    rating: number;
    ratingCount: number;
    rank: number;
    price?: number;
    currency?: string;
    userId?: string | number; // Creator ID for access control
  }>;
}

export function TopVideosSection({ videos }: TopVideosSectionProps) {
  return (
    <section className="mb-12 lg:mb-20">
      <SectionHeader
        title="Top videos today"
        icon={
          <SquarePlay color='#888C94'/>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {videos.map((video) => (
          <div key={video.id} className="relative">
            {/* Rank Number Background */}
            <div
              className="absolute -left-4 lg:-left-6 top-1/5 -translate-y-1/2 rank-number pointer-events-none z-0 opacity-60 "
              // style={{
              //   background: `linear-gradient(135deg, ${
              //     video.rank === 1
              //       ? '#6A57E533'
              //       : video.rank === 2
              //       ? '#5099F8'
              //       : video.rank === 3
              //       ? '#8EF1FF'
              //       : '#F5313B'
              //   } 0%, transparent 100%)`,
              //   WebkitBackgroundClip: 'text',
              //   WebkitTextFillColor: 'transparent',
              //   backgroundClip: 'text',
              // }}


              // style={{
              //   borderImage: `linear-gradient(135deg, ${
              //     video.rank === 1
              //       ? '#6A57E5'
              //       : video.rank === 2
              //       ? '#5099F8'
              //       : video.rank === 3
              //       ? '#8EF1FF'
              //       : '#F5313B'
              //   } 0%, transparent 100%) 1`,
              //   color:
              //     video.rank === 1
              //       ? '#6A57E5'
              //       : video.rank === 2
              //       ? '#5099F8'
              //       : video.rank === 3
              //       ? '#8EF1FF'
              //       : '#F5313B',
              // }}

         style={{
    background: 'transparent',
    fontSize: '18.75rem',
    fontWeight: 900,
    WebkitTextStroke: `5px ${
      video.rank === 1
        ? '#6A57E5'
        : video.rank === 2
        ? '#6A57E5'
        : video.rank === 3
        ? '#6A57E5'
        : '#6A57E5'
    }`,
    WebkitTextFillColor: 'transparent', // removes fill
    color: 'transparent',
  }}     

  //             style={{
  //               borderWidth: '2px',
  //   borderStyle: 'solid',
  //   borderImageSource: `linear-gradient(135deg, ${
  //     video.rank === 1
  //       ? '#6A57E5'
  //       : video.rank === 2
  //       ? '#5099F8'
  //       : video.rank === 3
  //       ? '#8EF1FF'
  //       : '#F5313B'
  //   }, transparent)`,
  //   borderImageSlice: 1,
  //   color:
  //     video.rank === 1
  //       ? '#6A57E5'
  //       : video.rank === 2
  //       ? '#5099F8'
  //       : video.rank === 3
  //       ? '#8EF1FF'
  //       : '#F5313B',
  // }}
            >
              {video.rank}
            </div>
            <div className="relative z-10 lg:ml-19">
              <VideoCard
                video={video}
                showPrice={true}
                priceLabel={(Number(video.price ?? 16) === 0) ? 'Free' : formatCurrency(video.price ?? 16, video.currency || 'NGN')}
                variant="grid"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}