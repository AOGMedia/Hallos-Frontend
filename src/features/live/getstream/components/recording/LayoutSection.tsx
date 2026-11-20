"use client";

import { GRID_SIZE_OPTIONS, LAYOUT_OPTIONS, SPEAKER_MODE_OPTIONS, SPOTLIGHT_BAR_OPTIONS } from "../../lib/recordingSettings";
import { tapHaptic } from "../../lib/haptics";
import { LayoutPreview } from "./LayoutPreview";
import { Segmented, SettingGroup, ToggleRow } from "./controls";
import type { SectionProps } from "./types";

/** How people are arranged, with the options for the chosen layout. */
export function LayoutSection({ value, onChange }: SectionProps) {
  if (value.format === "audio") return null;
  const portrait = value.orientation === "portrait";
  return (
    <SettingGroup title="Layout">
      <div role="radiogroup" aria-label="Recording layout" className="grid grid-cols-3 gap-2">
        {LAYOUT_OPTIONS.map((option) => {
          const selected = option.value === value.layout;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                tapHaptic(6);
                onChange({ layout: option.value });
              }}
              className={`flex min-h-[112px] touch-manipulation flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 text-center transition active:scale-[0.98] ${
                selected ? "bg-primary/20 ring-1 ring-primary/70" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <LayoutPreview layout={option.value} bar={value.spotlightBar} portrait={portrait} />
              <span className="text-[13px] font-semibold leading-tight text-white">{option.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 px-1 text-xs text-white/55">{LAYOUT_OPTIONS.find((o) => o.value === value.layout)?.hint}</p>

      {value.layout === "spotlight" && (
        <div className="mt-3">
          <p className="mb-1.5 px-1 text-xs font-medium text-white/70">Others appear at the</p>
          <Segmented label="Where others appear" options={SPOTLIGHT_BAR_OPTIONS} value={value.spotlightBar} onChange={(spotlightBar) => onChange({ spotlightBar })} />
        </div>
      )}

      {value.layout === "grid" && (
        <div className="mt-3 space-y-2">
          <p className="px-1 text-xs font-medium text-white/70">People per screen</p>
          <Segmented label="People per screen" options={GRID_SIZE_OPTIONS} value={value.gridSize} onChange={(gridSize) => onChange({ gridSize })} />
          <ToggleRow
            label="Stretch tiles to fill"
            hint="Uses the whole frame when fewer people are on screen"
            checked={value.gridFill}
            onChange={(gridFill) => onChange({ gridFill })}
          />
        </div>
      )}

      {value.layout === "single-participant" && (
        <div className="mt-3">
          <Segmented label="Who is shown" options={SPEAKER_MODE_OPTIONS} value={value.speakerMode} onChange={(speakerMode) => onChange({ speakerMode })} />
          <p className="mt-1.5 px-1 text-xs text-white/45">
            {value.speakerMode === "rotate" ? "Switches between people every 10 seconds." : "Shows whoever is presenting or speaking."}
          </p>
        </div>
      )}
    </SettingGroup>
  );
}
