import type { RecordingSettings } from "../../lib/recordingSettings";

/** Every recording settings section edits the draft through one patch function. */
export interface SectionProps {
  value: RecordingSettings;
  onChange: (patch: Partial<RecordingSettings>) => void;
}
