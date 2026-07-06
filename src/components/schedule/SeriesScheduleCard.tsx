import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SeriesScheduleCardProps {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  avatar: string;
  price: number;
  currency?: string;
  href: string;
  isLive?: boolean;
  matchCourseCardHeight?: boolean;
}

export function SeriesScheduleCard({
  title,
  description,
  instructor,
  thumbnail,
  avatar,
  price,
  currency = 'NGN',
  href,
  isLive = false,
  matchCourseCardHeight = false,
}: SeriesScheduleCardProps) {
  const formatPrice = (rawPrice: number, currency: string) => {
    const num = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice) || '0');
    if (!num || isNaN(num)) return 'Free';

    switch (currency) {
      case 'USD':
        return `$${num.toFixed(2)}`;
      case 'EUR':
        return `€${num.toFixed(2)}`;
      case 'GBP':
        return `£${num.toFixed(2)}`;
      case 'NGN':
      default:
        return `₦${num.toLocaleString()}`;
    }
  };

  return (
    <Link href={href} className="block h-full">
      <div className={`relative w-full ${matchCourseCardHeight ? 'min-h-[350px] h-full' : 'h-[350px]'} rounded-2xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group`}>
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />

        {/* Top Section - Price */}
        <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-end px-6 gap-2.5">
          <span className="text-xs font-bold text-white leading-3 bg-black/50 w-fit px-2 py-1 rounded-full">
            {formatPrice(price, currency)}
          </span>
        </div>

        {/* Bottom Section - Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2.5">
              <span className="text-xs text-center items-center font-normal text-white leading-3 flex bg-black/70 w-fit p-1 rounded-full truncate">
                {instructor}
                <span className="ml-2">
                  <RefreshCw className={`w-5 h-5 text-red-500 ${isLive ? 'animate-spin' : ''}`} />
                </span>
              </span>

              <div className="flex flex-col gap-2.5">
                <h3 className="text-base font-bold text-white leading-4">{title}</h3>
                <p className="text-sm font-normal text-white/80 leading-[21px] line-clamp-2">{description}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Image
                src={avatar}
                alt={instructor}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border-none"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
