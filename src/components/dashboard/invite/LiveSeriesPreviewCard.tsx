import Image from "next/image";
import type { LiveSeriesData } from "./types";

interface LiveSeriesPreviewCardProps {
  series: LiveSeriesData;
}

export function LiveSeriesPreviewCard({ series }: LiveSeriesPreviewCardProps) {
  // Determine if series has any live sessions
  const isLive = series.isLive;
  
  // Status badge configuration
  const getStatusBadge = () => {
    if (isLive) {
      return {
        text: 'Live',
        dotColor: 'bg-accent-red',
        dotShadow: '0 0 0 4px rgba(245,49,59,0.15)'
      };
    }
    
    // Default to upcoming/scheduled
    return {
      text: 'Upcoming',
      dotColor: 'bg-blue-400',
      dotShadow: '0 0 0 4px rgba(59,130,246,0.15)'
    };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="video-card overflow-hidden flex flex-col w-full max-w-[351px] shrink-0">
      {/* Thumbnail */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "350/209" }}>
        <Image
          src={series.thumbnail}
          alt={series.title}
          fill
          className="object-cover w-full h-full"
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-6 p-4">
        {/* Title row + Avatar */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-[10px] flex-1 min-w-0">
            {/* Status badge */}
            <div className="live-badge flex items-center gap-2 px-3 py-2 self-start">
              <span
                className={`rounded-full ${statusBadge.dotColor} shrink-0`}
                style={{
                  width: 8,
                  height: 8,
                  boxShadow: statusBadge.dotShadow,
                }}
              />
              <span className="text-small text-text-primary font-normal">
                {statusBadge.text}
              </span>
              <span className="text-small text-text-primary font-normal">
                {series.host.name}
              </span>
            </div>

            {/* Title + Description */}
            <div className="flex flex-col gap-[10px]">
              <h3 className="text-medium line-clamp-1">{series.title}</h3>
              <p className="text-description line-clamp-2">
                {series.description}
              </p>
            </div>
          </div>

          {/* Avatar */}
          <div
            className="shrink-0 rounded-full overflow-hidden border border-white/10"
            style={{ width: 40, height: 40 }}
          >
            <Image
              src={series.host.avatar}
              alt={series.host.name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Details row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-full"
          style={{ background: "rgba(106,87,229,0.05)" }}
        >
          <div className="flex items-center gap-1.5">
            <Image
              src="/icons/profile-users.svg"
              alt="attendees"
              width={21}
              height={21}
              className="opacity-80"
            />
            <span className="text-small text-text-primary">
              Attendee invite
            </span>
          </div>
          <span className="text-small" style={{ color: "var(--text-gray)" }}>
            {series.attendeeCount} registered)
          </span>
        </div>
      </div>
    </div>
  );
}
