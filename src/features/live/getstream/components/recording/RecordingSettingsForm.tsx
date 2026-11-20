"use client";

import { useState } from "react";
import { Info, Loader2 } from "lucide-react";
import {
  DEFAULT_RECORDING_SETTINGS,
  sameSettings,
  summarizeRecording,
  type RecordingSettings,
} from "../../lib/recordingSettings";
import { tapHaptic } from "../../lib/haptics";
import { FormatSection } from "./FormatSection";
import { QualitySection } from "./QualitySection";
import { LayoutSection } from "./LayoutSection";
import { AppearanceSection } from "./AppearanceSection";
import { AutoRecordSection } from "./AutoRecordSection";

interface RecordingSettingsFormProps {
  /** The saved settings this form starts from. */
  initial: RecordingSettings;
  /** Whether the creator has saved settings (vs. using the standard ones). */
  saved: boolean;
  /** A recording is running now: changes apply to the next one. */
  recording: boolean;
  saving: boolean;
  resetting: boolean;
  onSave: (settings: RecordingSettings) => void;
  onReset: () => void;
}

/**
 * The settings themselves: a draft edited section by section, saved only on
 * "Save". Remounted (by key) whenever the saved settings change, so the
 * draft always starts from what's stored.
 */
export function RecordingSettingsForm({ initial, saved, recording, saving, resetting, onSave, onReset }: RecordingSettingsFormProps) {
  const [draft, setDraft] = useState<RecordingSettings>(initial);
  const change = (patch: Partial<RecordingSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const dirty = !sameSettings(draft, initial);
  const isStandard = sameSettings(draft, DEFAULT_RECORDING_SETTINGS);
  const busy = saving || resetting;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 px-4 pt-1">
        {recording && (
          <p role="status" className="mb-4 flex items-start gap-2 rounded-2xl bg-primary/15 px-4 py-3 text-sm text-white/85">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            You&apos;re recording now. Changes apply to your next recording.
          </p>
        )}

        <div className="mb-5 rounded-2xl bg-white/5 px-4 py-3">
          <p className="text-xs text-white/50">
            {dirty ? "Not saved yet" : saved ? "Your saved settings" : "Standard settings"}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">{summarizeRecording(draft)}</p>
        </div>

        <FormatSection value={draft} onChange={change} />
        <QualitySection value={draft} onChange={change} />
        <LayoutSection value={draft} onChange={change} />
        <AppearanceSection value={draft} onChange={change} />
        <AutoRecordSection value={draft} onChange={change} />
      </div>

      {/* Pinned to the bottom of the sheet: always within thumb reach. */}
      <div className="sticky bottom-0 border-t border-white/10 bg-[#141a28] px-4 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busy || (!saved && isStandard)}
            onClick={() => {
              tapHaptic(8);
              onReset();
            }}
            className="min-h-12 touch-manipulation rounded-2xl px-4 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            {resetting ? "Resetting…" : "Use standard"}
          </button>
          <button
            type="button"
            disabled={busy || !dirty}
            onClick={() => {
              tapHaptic(12);
              onSave(draft);
            }}
            className="flex min-h-12 flex-1 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 active:scale-[0.99] disabled:opacity-45"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {saving ? "Saving…" : !dirty && saved ? "Saved" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
