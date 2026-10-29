"use client";

import { memo, useEffect, useState } from "react";
import { Hand } from "lucide-react";
import type { RaisedHand } from "../hooks/useRaisedHands";
import { RoomAvatar } from "./RoomAvatar";
import { Sheet } from "./Sheet";

function sinceLabel(raisedAt: number, now: number) {
  const secs = Math.max(0, Math.round((now - raisedAt) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  return mins === 1 ? "1 min ago" : `${mins} mins ago`;
}

/** Host's list of raised hands, first raised first (like Google Meet). */
export const RaisedHandsPanel = memo(function RaisedHandsPanel({
  open,
  onClose,
  queue,
  onLower,
  onLowerAll,
}: {
  open: boolean;
  onClose: () => void;
  queue: RaisedHand[];
  onLower: (userId: string) => void;
  onLowerAll: () => void;
}) {
  // Refresh "x mins ago" while open (cheap: one tick per 30s).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!open) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [open]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Raised hands${queue.length ? ` (${queue.length})` : ""}`}
      icon={<Hand className="h-4 w-4 text-amber-300" />}
      headerAction={
        queue.length > 1 ? (
          <button
            type="button"
            onClick={onLowerAll}
            className="rounded-full px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/10"
          >
            Lower all
          </button>
        ) : null
      }
    >
      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-white/50">
            <Hand className="h-8 w-8" />
            <p className="text-sm">No raised hands right now.</p>
            <p className="text-xs">You&apos;ll hear a chime when someone raises theirs.</p>
          </div>
        ) : (
          <ol className="space-y-2">
            {queue.map((hand, index) => (
              <li key={hand.userId} className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2.5">
                <span className="w-5 text-center text-sm font-bold text-amber-300">{index + 1}</span>
                <RoomAvatar name={hand.name} image={hand.image} className="h-9 w-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{hand.name}</p>
                  <p className="text-[11px] text-white/50">{sinceLabel(hand.raisedAt, now)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onLower(hand.userId)}
                  className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/15 active:scale-95"
                >
                  Lower
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Sheet>
  );
});
