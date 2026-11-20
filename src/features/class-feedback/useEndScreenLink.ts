"use client";

import { useQuery } from "@tanstack/react-query";
import { FeedbackLinkError, getEndScreenLink } from "./api";

/** How long to keep asking while the class is still being closed (~15s). */
const NOT_ENDED_RETRIES = 6;
const RETRY_DELAY_MS = 2500;

/**
 * The person's feedback link on the class-ended screen. The backend only
 * gives one once the class has ended and only to people who were in it, so
 * `data` being set also means "the class is over and this is for you".
 */
export function useEndScreenLink(kind: "class" | "session", id: string, enabled = true) {
  return useQuery({
    queryKey: ["class-feedback-link", kind, id],
    queryFn: () => getEndScreenLink(kind, id),
    enabled: enabled && Boolean(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    // The end can reach the room a moment before the class is marked ended:
    // keep asking briefly. Network blips get a couple of retries; nothing else.
    retry: (count, error) => {
      if (!(error instanceof FeedbackLinkError)) return false;
      if (error.problem === "not_ended") return count < NOT_ENDED_RETRIES;
      return (error.problem === "network" || error.problem === "unavailable") && count < 2;
    },
    retryDelay: RETRY_DELAY_MS,
  });
}
