import Image from "next/image";
import { CountdownDisplay } from "./CountdownDisplay";
import type { LiveSeriesData } from "./types";
import { ArrowRight } from "lucide-react";

interface LiveSeriesActionsProps {
  series: LiveSeriesData;
  onReserveHref?: string;
}

export function LiveSeriesActions({
  series,
  onReserveHref = "#",
}: LiveSeriesActionsProps) {
  return (
    <div className="flex flex-col gap-4 items-center lg:items-start">
    
      <div className="flex flex-col items-center gap-1.5">
        <Image
          src="/icons/profile-users.svg"
          alt="attendee invite"
          width={21}
          height={21}
          style={{ opacity: 0.6 }}
        />
        <span
          className="font-['Plus_Jakarta_Sans'] text-xs font-normal"
          style={{ color: "var(--text-gray)" }}
        >
          Attendee invite
        </span>
      </div>

      {/* Reserve CTA */}
      <a
        href={onReserveHref}
        className="flex items-center gap-2 px-8 py-4 rounded-full transition-opacity hover:opacity-90 active:opacity-80"
        style={{ background: "var(--primary)" }}
        aria-label="Reserve your spot"
      >
        <span className="live-event-button-text whitespace-nowrap">
          Reserve your spot
        </span>
        <ArrowRight size={16} color="#fff" />
      </a>

      <div className="flex flex-col items-center gap-[10px]">
        <span
          className="font-['Plus_Jakarta_Sans'] text-xs font-normal"
          style={{ color: "var(--text-gray)", lineHeight: "15px" }}
        >
          Class starts in:
        </span>
        <CountdownDisplay initial={series.countdown} />
      </div>
    </div>
  );
}
