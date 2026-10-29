"use client";

import { memo } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import type { Toast } from "../hooks/useToasts";

const ICONS = {
  info: <Info className="h-4 w-4 shrink-0 text-sky-300" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />,
  error: <AlertCircle className="h-4 w-4 shrink-0 text-red-300" />,
};

/** Top-of-room messages: friendly, short, dismissible, with an optional action. */
export const RoomToasts = memo(function RoomToasts({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[calc(max(env(safe-area-inset-top),10px)+56px)] z-[65] flex flex-col items-center gap-2 px-3"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className="pointer-events-auto flex w-full max-w-md items-center gap-2.5 rounded-2xl border border-white/10 bg-[#1b2234] px-3.5 py-2.5 text-sm text-white shadow-2xl"
        >
          {ICONS[t.tone]}
          <span className="min-w-0 flex-1">{t.message}</span>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.onClick();
                onDismiss(t.id);
              }}
              className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold"
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => onDismiss(t.id)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
});
