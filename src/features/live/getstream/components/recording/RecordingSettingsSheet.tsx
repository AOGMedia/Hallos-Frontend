"use client";

import { Loader2, SlidersHorizontal } from "lucide-react";
import { Sheet } from "../Sheet";
import { useRecordingSettings } from "../../hooks/useRecordingSettings";
import { friendlyError } from "../../lib/errors";
import { RecordingSettingsForm } from "./RecordingSettingsForm";

interface RecordingSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  /** A recording is running now. */
  recording: boolean;
  /** Room toast, for "saved" / errors. */
  onNotify: (message: string, tone: "success" | "error") => void;
}

/**
 * Recording settings for whoever can record (the creator). Settings are
 * saved to their account and used for every recording they start — and for
 * auto-recording — until they change them.
 */
export default function RecordingSettingsSheet({ open, onClose, recording, onNotify }: RecordingSettingsSheetProps) {
  const { query, save, reset } = useRecordingSettings(open);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Recording settings"
      icon={<SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />}
      mobileHeight="h-[88dvh]"
    >
      {query.isLoading ? (
        <div className="flex h-48 items-center justify-center text-white/60" role="status" aria-label="Loading">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      ) : query.isError || !query.data ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-white/70">{friendlyError(query.error, "We couldn't load your recording settings.")}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-4 min-h-11 rounded-2xl bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Try again
          </button>
        </div>
      ) : (
        <RecordingSettingsForm
          key={`${query.dataUpdatedAt}-${query.data.saved}`}
          initial={query.data.settings}
          saved={query.data.saved}
          recording={recording}
          saving={save.isPending}
          resetting={reset.isPending}
          onSave={(settings) =>
            save.mutate(settings, {
              onSuccess: () => {
                onNotify(recording ? "Saved. Your next recording will use these settings." : "Recording settings saved.", "success");
                onClose();
              },
              onError: (error) => onNotify(friendlyError(error, "We couldn't save your settings. Please try again."), "error"),
            })
          }
          onReset={() =>
            reset.mutate(undefined, {
              onSuccess: () => onNotify("Back to the standard recording settings.", "success"),
              onError: (error) => onNotify(friendlyError(error, "We couldn't reset your settings. Please try again."), "error"),
            })
          }
        />
      )}
    </Sheet>
  );
}
