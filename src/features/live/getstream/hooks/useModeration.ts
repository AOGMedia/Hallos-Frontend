"use client";

import { useCallback, useEffect, useRef } from "react";
import { useCall, type StreamVideoParticipant } from "@stream-io/video-react-sdk";
import { MUTE_EVENT, type MuteEventPayload } from "../lib/events";
import { friendlyError } from "../lib/errors";

const HOST_CALL_ROLE = "admin";

const isHostParticipant = (p: StreamVideoParticipant, hostUserIds: ReadonlySet<string>) =>
  hostUserIds.has(p.userId) || Boolean(p.roles?.includes(HOST_CALL_ROLE));

/**
 * Host moderation, Google Meet style:
 *   - mute one person, or "mute all" = everyone except hosts (the host keeps
 *     talking — the old blanket mute also muted the host),
 *   - remove someone from the class.
 * GetStream does the actual mute (the muted browser turns its mic off). We
 * also send a small event so the muted person is told who muted them, and
 * their mic is switched off locally too in case GetStream's signal is missed.
 */
export function useModeration({
  selfId,
  hostUserIds,
  onNotice,
}: {
  selfId: string;
  hostUserIds: ReadonlySet<string>;
  onNotice: (message: string, tone: "info" | "success" | "error") => void;
}) {
  const call = useCall();
  const latest = useRef({ hostUserIds, onNotice });
  latest.current = { hostUserIds, onNotice };

  // Being muted by a host.
  useEffect(() => {
    if (!call) return;
    return call.on("custom", (event) => {
      const payload = event.custom as Partial<MuteEventPayload> | undefined;
      const fromId = event.user?.id;
      if (payload?.kind !== MUTE_EVENT || !fromId || fromId === selfId) return;
      const participants = call.state.participants;
      const fromIsHost =
        latest.current.hostUserIds.has(fromId) ||
        participants.some((p) => p.userId === fromId && p.roles?.includes(HOST_CALL_ROLE));
      if (!fromIsHost) return;

      const me = call.state.localParticipant;
      const meIsHost = me ? isHostParticipant(me, latest.current.hostUserIds) : false;
      const targeted = payload.targets === "*" ? !meIsHost : Array.isArray(payload.targets) && payload.targets.includes(selfId);
      if (!targeted) return;

      const micWasOn = call.microphone.state.status === "enabled";
      call.microphone.disable().catch(() => {});
      if (micWasOn) {
        const name = (event.user as { name?: string } | undefined)?.name || "The host";
        latest.current.onNotice(`${name} muted you. You can unmute when you need to speak.`, "info");
      }
    });
  }, [call, selfId]);

  const announce = useCallback(
    (targets: MuteEventPayload["targets"]) => {
      const payload: MuteEventPayload = { kind: MUTE_EVENT, targets };
      call?.sendCustomEvent(payload).catch(() => {});
    },
    [call]
  );

  const muteOne = useCallback(
    async (p: StreamVideoParticipant) => {
      if (!call) return;
      try {
        await call.muteUser(p.userId, "audio");
        announce([p.userId]);
        latest.current.onNotice(`${p.name || "They"} ${p.name ? "is" : "are"} muted`, "success");
      } catch (error) {
        latest.current.onNotice(friendlyError(error, "We couldn't mute them. Please try again."), "error");
      }
    },
    [call, announce]
  );

  /** Mute everyone except hosts. Returns how many were muted. */
  const muteAll = useCallback(async () => {
    if (!call) return 0;
    const ids = [
      ...new Set(
        call.state.participants
          .filter((p) => !p.isLocalParticipant && p.userId !== selfId && !isHostParticipant(p, latest.current.hostUserIds))
          .map((p) => p.userId)
      ),
    ];
    if (ids.length === 0) {
      latest.current.onNotice("There's no one to mute.", "info");
      return 0;
    }
    try {
      await call.muteUser(ids, "audio");
      announce("*");
      latest.current.onNotice("Everyone is muted. They can unmute when they need to speak.", "success");
      return ids.length;
    } catch (error) {
      latest.current.onNotice(friendlyError(error, "We couldn't mute everyone. Please try again."), "error");
      return 0;
    }
  }, [call, selfId, announce]);

  /** Remove someone from this class (they can't rejoin this session). */
  const remove = useCallback(
    async (p: StreamVideoParticipant) => {
      if (!call) return;
      try {
        await call.blockUser(p.userId);
        latest.current.onNotice(`${p.name || "They"} ${p.name ? "was" : "were"} removed from the class`, "success");
      } catch (error) {
        latest.current.onNotice(friendlyError(error, "We couldn't remove them. Please try again."), "error");
      }
    },
    [call]
  );

  return { muteOne, muteAll, remove };
}
