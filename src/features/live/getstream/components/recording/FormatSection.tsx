"use client";

import { Clapperboard, Music2 } from "lucide-react";
import { tapHaptic } from "../../lib/haptics";
import { SettingGroup } from "./controls";
import type { SectionProps } from "./types";

/** Video or audio only. */
export function FormatSection({ value, onChange }: SectionProps) {
  const choices = [
    { format: "video" as const, icon: <Clapperboard className="h-5 w-5" />, label: "Video", hint: "Everyone on screen" },
    { format: "audio" as const, icon: <Music2 className="h-5 w-5" />, label: "Audio only", hint: "A single MP3" },
  ];
  return (
    <SettingGroup title="Format">
      <div role="radiogroup" aria-label="Recording format" className="grid grid-cols-2 gap-2">
        {choices.map((c) => {
          const selected = value.format === c.format;
          return (
            <button
              key={c.format}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                tapHaptic(6);
                onChange({ format: c.format });
              }}
              className={`flex min-h-[72px] touch-manipulation flex-col items-start justify-center gap-1 rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.98] ${
                selected ? "bg-primary/20 ring-1 ring-primary/70" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className={selected ? "text-primary" : "text-white/70"}>{c.icon}</span>
              <span className="text-sm font-semibold text-white">{c.label}</span>
              <span className="text-xs text-white/55">{c.hint}</span>
            </button>
          );
        })}
      </div>
    </SettingGroup>
  );
}
