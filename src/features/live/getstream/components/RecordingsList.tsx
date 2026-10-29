"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Film, Loader2, RefreshCw } from "lucide-react";
import { listGetStreamRecordings, serverMessage, type GetStreamTarget } from "../api";

function formatDuration(start: string, end: string) {
  const secs = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Recordings of a GetStream class or series session. GetStream takes a few
 * minutes to process a recording after it stops, so this can be refreshed.
 */
export function RecordingsList({ target }: { target: GetStreamTarget }) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["live", "getstream-recordings", target.kind, target.id],
    queryFn: () => listGetStreamRecordings(target),
    staleTime: 30_000,
  });

  return (
    <div className="w-full text-left">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Film className="h-4 w-4 text-primary" /> Recordings
        </h3>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {serverMessage(error, "Couldn't load recordings.")}
        </p>
      ) : !data || data.length === 0 ? (
        <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/60">
          No recordings yet. A recording appears here a few minutes after it stops.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.map((rec) => (
            <li key={`${rec.callId}-${rec.filename}`} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {target.kind === "class" ? `Session ${rec.session} · ` : ""}{new Date(rec.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="text-xs text-white/50">{formatDuration(rec.startTime, rec.endTime)}</p>
              </div>
              <a
                href={rec.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-white transition active:scale-95"
              >
                <Download className="h-4 w-4" /> Open
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
