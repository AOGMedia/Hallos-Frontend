"use client";

import { useEffect } from "react";
import { sendGetStreamHeartbeat } from "../api";

/** How often the host's browser tells the backend it is still in the class. */
const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * Same recovery as the ZegoCloud room: keeps the class marked live while the
 * host is in it, and lets the backend reopen a class wrongly marked ended.
 */
export function useHostHeartbeat({ liveClassId, callId, enabled }: { liveClassId: string; callId: string; enabled: boolean }) {
  useEffect(() => {
    if (!enabled || !callId) return;

    let cancelled = false;
    const beat = async () => {
      try {
        const result = await sendGetStreamHeartbeat(liveClassId, callId);
        if (!cancelled && result?.recovered) {
          console.info("[GetStreamRoom] Class status recovered to live by host heartbeat");
        }
      } catch {
        // Best-effort: a missed heartbeat is retried on the next tick.
      }
    };

    beat();
    const timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [enabled, liveClassId, callId]);
}
