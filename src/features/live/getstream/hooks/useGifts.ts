"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCall } from "@stream-io/video-react-sdk";
import {
  getGiftOverview,
  InsufficientFundsError,
  sendGift,
  type GetStreamTarget,
  type GiftDefinition,
  type GiftOverview,
} from "../api";
import { GIFT_EVENT, SYSTEM_USER_ID, newEventId, type GiftEventPayload } from "../lib/events";
import { friendlyError } from "../lib/errors";

/** Looks used before the catalogue loads (the server is the source of truth for prices). */
const FALLBACK_LOOKS: Record<string, Pick<GiftDefinition, "name" | "emoji" | "animation">> = {
  spark: { name: "Spark", emoji: "⭐", animation: "pop" },
  love: { name: "Love", emoji: "❤️", animation: "heartbeat" },
  rose: { name: "Rose", emoji: "🌹", animation: "bloom" },
  champion: { name: "Champion", emoji: "🏆", animation: "bounce" },
  rocket: { name: "Rocket", emoji: "🚀", animation: "fly" },
  diamond: { name: "Diamond", emoji: "💎", animation: "shine" },
  crown: { name: "Crown", emoji: "👑", animation: "crown" },
};

export const giftOverviewKey = (target: GetStreamTarget) => ["live", "getstream-gifts", target.kind, target.id];

/** Catalogue, the user's balances and (for the host) what they've received. */
export function useGiftOverview(target: GetStreamTarget, enabled = true) {
  return useQuery<GiftOverview>({
    queryKey: giftOverviewKey(target),
    queryFn: () => getGiftOverview(target),
    enabled,
    staleTime: 30_000,
    // Back from topping up in another tab: show the new balance.
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/** "Ada sent you a Rose", "You sent the host a Rose", "Tola sent Ada a Rose"… */
export function describeGiftEvent(event: GiftEventPayload, selfId: string, giftName: string) {
  const from = event.from.id === selfId ? "You" : event.from.name;
  const to = !event.to ? "" : event.to.id === selfId ? " you" : event.to.isHost ? " the host" : ` ${event.to.name}`;
  return `${from} sent${to} a ${giftName}`;
}

export function giftLook(code: string, catalog?: GiftDefinition[]) {
  const fromCatalog = catalog?.find((g) => g.code === code);
  return fromCatalog ?? { code, ...(FALLBACK_LOOKS[code] ?? { name: "Gift", emoji: "🎁", animation: "pop" }) };
}

export type SendGiftOutcome =
  | { ok: true }
  | { ok: false; reason: "insufficient"; message: string }
  | { ok: false; reason: "error"; message: string };

/** Send a gift. One request per tap; a retried request is never charged twice. */
export function useSendGift(target: GetStreamTarget) {
  const queryClient = useQueryClient();
  const [sendingCode, setSendingCode] = useState<string | null>(null);

  const send = useCallback(
    async (code: string, recipientId?: string): Promise<SendGiftOutcome> => {
      setSendingCode(code);
      try {
        const result = await sendGift(target, code, newEventId(), recipientId);
        queryClient.setQueryData<GiftOverview>(giftOverviewKey(target), (prev) =>
          prev ? { ...prev, balances: result.balances } : prev
        );
        return { ok: true };
      } catch (error) {
        if (error instanceof InsufficientFundsError) {
          void queryClient.invalidateQueries({ queryKey: giftOverviewKey(target) });
          return { ok: false, reason: "insufficient", message: "You don't have enough in your wallet for this gift." };
        }
        return { ok: false, reason: "error", message: friendlyError(error, "Your gift didn't go through. Please try again.") };
      } finally {
        setSendingCode(null);
      }
    },
    [target, queryClient]
  );

  return { send, sendingCode };
}

/** Gifts announced in the room by the server (the only trusted source). */
export function useGiftEvents(onGift: (gift: GiftEventPayload) => void) {
  const call = useCall();
  const handler = useRef(onGift);
  handler.current = onGift;

  useEffect(() => {
    if (!call) return;
    return call.on("custom", (event) => {
      const payload = event.custom as Partial<GiftEventPayload> | undefined;
      if (payload?.kind !== GIFT_EVENT || event.user?.id !== SYSTEM_USER_ID) return;
      if (!payload.id || !payload.code || !payload.from) return;
      handler.current(payload as GiftEventPayload);
    });
  }, [call]);
}
