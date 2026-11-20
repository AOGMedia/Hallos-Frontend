import type { RecordingLayout, SpotlightBar } from "../../lib/recordingSettings";

/**
 * A tiny drawing of how a layout arranges people in the recording, so the
 * choice is visual. Plain divs (no images): instant, crisp, theme-safe.
 */
export function LayoutPreview({
  layout,
  bar = "bottom",
  portrait = false,
}: {
  layout: RecordingLayout;
  bar?: SpotlightBar;
  portrait?: boolean;
}) {
  const tile = "rounded-[3px] bg-white/35";
  const main = "rounded-[3px] bg-primary/80";

  return (
    <div
      aria-hidden
      className={`mx-auto flex overflow-hidden rounded-md bg-black/40 p-1 ${portrait ? "h-16 w-9" : "h-10 w-16"}`}
    >
      {layout === "grid" && (
        <div className="grid h-full w-full grid-cols-2 gap-0.5">
          <span className={tile} />
          <span className={tile} />
          <span className={tile} />
          <span className={tile} />
        </div>
      )}

      {layout === "single-participant" && <span className={`h-full w-full ${main}`} />}

      {layout === "spotlight" && (
        <div
          className={`flex h-full w-full gap-0.5 ${
            bar === "bottom" ? "flex-col" : bar === "top" ? "flex-col-reverse" : bar === "left" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className={`min-h-0 min-w-0 flex-[3] ${main}`} />
          <span className={`flex min-h-0 min-w-0 flex-1 gap-0.5 ${bar === "left" || bar === "right" ? "flex-col" : "flex-row"}`}>
            <span className={`flex-1 ${tile}`} />
            <span className={`flex-1 ${tile}`} />
            <span className={`flex-1 ${tile}`} />
          </span>
        </div>
      )}
    </div>
  );
}
