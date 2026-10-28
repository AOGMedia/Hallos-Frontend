"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { RecordingsList } from "./RecordingsList";
import { recordingsHref, type GetStreamTarget } from "../api";

const panel = "w-full max-w-md rounded-3xl border border-white/10 bg-[#161c2b] p-6 text-center shadow-2xl";
const primaryBtn =
  "w-full rounded-full bg-primary px-6 py-3.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60";
const ghostBtn =
  "w-full rounded-full border border-white/15 px-6 py-3.5 font-semibold text-white/80 transition hover:bg-white/5 disabled:opacity-50";

/**
 * Host left the class. Like the ZegoCloud room, leaving never ends the class
 * on its own — attendees may still be inside — the host decides explicitly.
 */
export function HostLeftDialog({ onRejoin, onEnd }: { onRejoin: () => void; onEnd: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const end = async () => {
    setEnding(true);
    setError(null);
    try {
      await onEnd();
    } catch {
      setError("Couldn't end the class. Please try again.");
      setEnding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className={panel}>
        {!confirming ? (
          <>
            <h2 className="text-xl font-bold text-white">You left the class</h2>
            <p className="mt-2 text-sm text-white/70">
              Your class is still live for attendees. Rejoin to keep teaching, or end the class for everyone.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button type="button" onClick={onRejoin} className={primaryBtn}>
                Rejoin class
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="w-full rounded-full border border-red-500/50 px-6 py-3.5 font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                End class for everyone
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white">End this class for everyone?</h2>
            <p className="mt-2 text-sm text-white/70">
              Everyone in the class will be disconnected, and any recording in progress stops.
            </p>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setConfirming(false)} disabled={ending} className={ghostBtn}>
                Cancel
              </button>
              <button
                type="button"
                onClick={end}
                disabled={ending}
                className="w-full rounded-full bg-red-500 px-6 py-3.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                {ending ? "Ending…" : "End class"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Shown when the class (or series session) has ended. Hosts also get its recordings. */
export function ClassEndedScreen({
  target,
  showRecordings,
  backHref,
}: {
  target: GetStreamTarget;
  showRecordings: boolean;
  backHref: string;
}) {
  const noun = target.kind === "session" ? "session" : "class";
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#0d111b] p-4">
      <div className={`${panel} max-w-lg`}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-3 text-2xl font-bold text-white">This {noun} has ended</h2>
        <p className="mt-2 text-sm text-white/70">
          {showRecordings ? "Great session! Your recordings are below." : `Thanks for joining the ${noun}.`}
        </p>
        {showRecordings && (
          <div className="mt-6">
            <RecordingsList target={target} />
            <p className="mt-3 text-xs text-white/50">
              Come back any time at{" "}
              <Link href={recordingsHref(target)} className="text-primary underline-offset-2 hover:underline">
                this {noun}&apos;s recordings page
              </Link>
              .
            </p>
          </div>
        )}
        <Link href={backHref} className={`${primaryBtn} mt-6 inline-block`}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
