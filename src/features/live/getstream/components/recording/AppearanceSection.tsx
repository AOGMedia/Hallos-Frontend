"use client";

import { Image as ImageIcon, Tag, Type } from "lucide-react";
import { BACKGROUND_OPTIONS, VIDEO_FIT_OPTIONS } from "../../lib/recordingSettings";
import { Segmented, SettingGroup, SwatchPicker, ToggleRow } from "./controls";
import type { SectionProps } from "./types";

/** A note shown in place of the video-only settings while audio only is chosen. */
function AudioOnlyNote() {
  return (
    <p className="mb-6 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/65">
      Audio-only recordings have no picture, so quality, layout and look don&apos;t apply.
    </p>
  );
}

/** Branding, names, background and how video fits its tile. */
export function AppearanceSection({ value, onChange }: SectionProps) {
  if (value.format === "audio") return <AudioOnlyNote />;
  return (
    <SettingGroup title="Look">
      <div className="space-y-2">
        <ToggleRow icon={<ImageIcon className="h-4 w-4" />} label="Hallos logo" hint="A small logo in the corner" checked={value.showLogo} onChange={(showLogo) => onChange({ showLogo })} />
        <ToggleRow icon={<Type className="h-4 w-4" />} label="Class title" hint="Shown at the top of the recording" checked={value.showTitle} onChange={(showTitle) => onChange({ showTitle })} />
        <ToggleRow icon={<Tag className="h-4 w-4" />} label="Name labels" hint="Everyone's name on their tile" checked={value.showNames} onChange={(showNames) => onChange({ showNames })} />
      </div>

      <div className="mt-4">
        <p className="mb-2 px-1 text-xs font-medium text-white/70">Background</p>
        <SwatchPicker label="Background colour" options={BACKGROUND_OPTIONS} value={value.background} onChange={(background) => onChange({ background })} />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 px-1 text-xs font-medium text-white/70">Video in its tile</p>
        <Segmented label="Video fit" options={VIDEO_FIT_OPTIONS} value={value.videoFit} onChange={(videoFit) => onChange({ videoFit })} />
        <p className="mt-1.5 px-1 text-xs text-white/45">{VIDEO_FIT_OPTIONS.find((o) => o.value === value.videoFit)?.hint}</p>
      </div>
    </SettingGroup>
  );
}
