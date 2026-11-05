"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Download, Film, Loader2, RefreshCw, Store } from "lucide-react";
import { loadGetStreamRecordings, serverMessage, type GetStreamRecording, type GetStreamTarget } from "../api";
import { PublishRecordingSheet } from "./PublishRecordingSheet";

function formatDuration(start: string, end: string) {
  const secs = Math.max(0, Math.round((Date.parse(end) - Date.parse(start)) / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s).padStart(2, "0")}`;
}

const isImporting = (rec: GetStreamRecording) =>
  rec.publication?.status === "uploading" || rec.publication?.status === "processing";

const pill = "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95";

/** What the creator can do with one recording once it's published (or not). */
function PublishState({
  rec,
  canPublish,
  onPublish,
}: {
  rec: GetStreamRecording;
  canPublish: boolean;
  onPublish: () => void;
}) {
  const pub = rec.publication;
  if (pub?.status === "ready") {
    return (
      <Link href={`/dashboard/video/${pub.videoId}`} className={`${pill} bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25`}>
        <CheckCircle2 className="h-4 w-4" /> Published
      </Link>
    );
  }
  if (pub && isImporting(rec)) {
    return (
      <span className={`${pill} bg-white/10 text-white/70`}>
        <Loader2 className="h-4 w-4 animate-spin" /> Processing…
      </span>
    );
  }
  if (!canPublish) return null;
  if (pub?.status === "failed") {
    return (
      <button type="button" onClick={onPublish} className={`${pill} bg-red-500/15 text-red-300 hover:bg-red-500/25`}>
        <AlertCircle className="h-4 w-4" /> Retry publish
      </button>
    );
  }
  return (
    <button type="button" onClick={onPublish} className={`${pill} bg-primary text-white`}>
      <Store className="h-4 w-4" /> Sell
    </button>
  );
}

/**
 * Recordings of a GetStream class or series session. GetStream takes a few
 * minutes to process a recording after it stops, so this can be refreshed.
 * The creator can download each one or publish it as a video for sale.
 */
export function RecordingsList({ target }: { target: GetStreamTarget }) {
  const queryClient = useQueryClient();
  const queryKey = ["live", "getstream-recordings", target.kind, target.id];
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => loadGetStreamRecordings(target),
    staleTime: 30_000,
    // Follow a publish until Mux has finished importing it.
    refetchInterval: (query) => (query.state.data?.recordings.some(isImporting) ? 20_000 : false),
  });
  const [publishing, setPublishing] = useState<GetStreamRecording | null>(null);

  const recordings = data?.recordings ?? [];
  const sessions = new Set(recordings.map((r) => r.session)).size;
  const suggestedTitle = (rec: GetStreamRecording) => {
    const base = data?.title || "Class recording";
    return target.kind === "class" && sessions > 1 ? `${base} — Session ${rec.session}` : base;
  };

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
      ) : recordings.length === 0 ? (
        <p className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/60">
          No recordings yet. A recording appears here a few minutes after it stops.
        </p>
      ) : (
        <ul className="space-y-2">
          {recordings.map((rec) => (
            <li
              key={`${rec.callId}-${rec.filename}`}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-white/5 px-4 py-3"
            >
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate text-sm font-medium text-white">
                  {target.kind === "class" ? `Session ${rec.session} · ` : ""}
                  {new Date(rec.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                </p>
                <p className="text-xs text-white/50">{formatDuration(rec.startTime, rec.endTime)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={rec.url}
                  download={rec.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${pill} bg-white/10 text-white hover:bg-white/15`}
                >
                  <Download className="h-4 w-4" /> Download
                </a>
                <PublishState rec={rec} canPublish={data?.canPublish ?? false} onPublish={() => setPublishing(rec)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {publishing && (
        <PublishRecordingSheet
          target={target}
          recording={publishing}
          suggestedTitle={suggestedTitle(publishing)}
          onClose={() => setPublishing(null)}
          onPublished={() => {
            setPublishing(null);
            void queryClient.invalidateQueries({ queryKey });
          }}
        />
      )}
    </div>
  );
}
