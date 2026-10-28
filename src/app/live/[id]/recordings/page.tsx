"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { RecordingsList, type GetStreamTarget } from "@/features/live/getstream";

/**
 * Recordings of a GetStream live class, or of a series session (?type=series).
 * The server only shows them to the creator (and live class co-hosts).
 */
export default function LiveClassRecordingsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const isSeries = searchParams.get("type") === "series";
  const target: GetStreamTarget = { kind: isSeries ? "session" : "class", id };
  const selfHref = `/live/${id}/recordings${isSeries ? "?type=series" : ""}`;

  useEffect(() => {
    if (!loading && !user) router.replace(`/signin?redirect=${encodeURIComponent(selfHref)}`);
  }, [loading, user, selfHref, router]);

  if (loading || !user) {
    return <div className="min-h-[100dvh] bg-[#0d111b]" />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#0d111b] px-4 pb-10 pt-[max(env(safe-area-inset-top),16px)] text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/schedule"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mb-1 text-2xl font-bold">{isSeries ? "Session recordings" : "Class recordings"}</h1>
        <p className="mb-6 text-sm text-white/60">
          Recordings appear a few minutes after recording stops. Links expire, so open them from this page.
        </p>
        <div className="rounded-3xl border border-white/10 bg-[#161c2b] p-5">
          <RecordingsList target={target} />
        </div>
      </div>
    </div>
  );
}
