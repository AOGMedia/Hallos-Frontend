"use client";

import { ORIENTATION_OPTIONS, QUALITY_OPTIONS } from "../../lib/recordingSettings";
import { OptionCards, Segmented, SettingGroup } from "./controls";
import type { SectionProps } from "./types";

/** Resolution (up to 1080p) and orientation. */
export function QualitySection({ value, onChange }: SectionProps) {
  if (value.format === "audio") return null;
  return (
    <SettingGroup title="Quality" description="Higher quality looks sharper and makes bigger files.">
      <OptionCards label="Recording quality" options={QUALITY_OPTIONS} value={value.quality} onChange={(quality) => onChange({ quality })} />
      <div className="mt-2">
        <Segmented
          label="Orientation"
          options={ORIENTATION_OPTIONS}
          value={value.orientation}
          onChange={(orientation) => onChange({ orientation })}
        />
        <p className="mt-1.5 px-1 text-xs text-white/45">
          {ORIENTATION_OPTIONS.find((o) => o.value === value.orientation)?.hint}
        </p>
      </div>
    </SettingGroup>
  );
}
