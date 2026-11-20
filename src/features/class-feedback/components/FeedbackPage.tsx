"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FeedbackLinkError, getFeedbackForm } from "../api";
import { FeedbackFlow } from "./FeedbackFlow";
import { FeedbackLoading, LinkProblemScreen, WelcomeBack } from "./StatusScreens";

/**
 * Opens the form behind a personal feedback link, or explains why it can't.
 * `resume`: they just rated on the class-ended screen, so go straight on to
 * the next question rather than "you've already shared feedback".
 */
export function FeedbackPage({ token, resume = false }: { token: string; resume?: boolean }) {
  const query = useQuery({
    queryKey: ["class-feedback", token],
    queryFn: () => getFeedbackForm(token),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  // Someone coming back after answering sees "already shared" first.
  const [editing, setEditing] = useState(false);

  if (query.isLoading) return <FeedbackLoading />;

  if (query.isError || !query.data) {
    const error = query.error;
    return (
      <LinkProblemScreen
        problem={error instanceof FeedbackLinkError ? error.problem : "network"}
        message={error instanceof Error ? error.message : "Please check your connection and try again."}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resuming = resume && Boolean(query.data.response);
  if (query.data.response && !editing && !resuming) {
    return <WelcomeBack form={query.data} onChange={() => setEditing(true)} />;
  }

  // Resuming: the overall rating (question 1) is already saved.
  return <FeedbackFlow token={token} form={query.data} startAt={resuming && !editing ? 1 : 0} />;
}
