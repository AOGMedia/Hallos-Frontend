import { LiveSeriesPreviewCard } from "./LiveSeriesPreviewCard";
import { LiveSeriesForm } from "./LiveSeriesForm";
import { LiveSeriesActions } from "./LiveSeriesActions";
import type { LiveSeriesData } from "./types";

interface LiveSeriesSectionProps {
  series: LiveSeriesData;
  reserveHref?: string;
}

export function LiveSeriesSection({
  series,
  reserveHref = "#",
}: LiveSeriesSectionProps) {
  return (
    <section
      className="flex flex-col lg:flex-row gap-6 w-full"
      aria-label={`Live series: ${series.title}`}
    >
      <LiveSeriesPreviewCard series={series} />

      <div className="flex-1 min-w-0">
        <LiveSeriesForm series={series} />
      </div>

      <div className="flex justify-center lg:justify-end shrink-0">
        <LiveSeriesActions series={series} onReserveHref={reserveHref} />
      </div>
    </section>
  );
}
