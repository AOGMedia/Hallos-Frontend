"use client";

import { Zap } from "lucide-react";
import { SettingGroup, ToggleRow } from "./controls";
import type { SectionProps } from "./types";

/** Start recording by itself when the class goes live. */
export function AutoRecordSection({ value, onChange }: SectionProps) {
  return (
    <SettingGroup title="Automation">
      <ToggleRow
        icon={<Zap className="h-4 w-4" />}
        label="Record automatically"
        hint="Starts recording as soon as your next class goes live. Everyone sees that it's being recorded."
        checked={value.autoRecord}
        onChange={(autoRecord) => onChange({ autoRecord })}
      />
    </SettingGroup>
  );
}
