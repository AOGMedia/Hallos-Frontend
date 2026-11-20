"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MyFeedbackPage } from "@/features/class-feedback/results/MyFeedbackPage";

/**
 * Feedback on a live class, or on a series session (?type=series).
 * The server only shows it to the class's creator.
 */
export default function LiveClassFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const isSeries = searchParams.get("type") === "series";
  const selfHref = `/live/${id}/feedback${isSeries ? "?type=series" : ""}`;

  useEffect(() => {
    if (!loading && !user) router.replace(`/signin?redirect=${encodeURIComponent(selfHref)}`);
  }, [loading, user, selfHref, router]);

  if (loading || !user) return <div className="min-h-[100dvh] bg-[#0d111b]" />;
  return <MyFeedbackPage kind={isSeries ? "session" : "class"} id={id} />;
}
