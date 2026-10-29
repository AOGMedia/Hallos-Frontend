"use client";

import { memo, useEffect, useState } from "react";
import { Gift, Loader2, Wallet } from "lucide-react";
import type { Balances, GiftDefinition, GiftOverview, WalletCurrency } from "../api";
import { formatMoney } from "../lib/events";
import { tapHaptic } from "../lib/haptics";
import { Sheet } from "./Sheet";

const CURRENCIES: WalletCurrency[] = ["NGN", "USD"];

/** Which wallet would pay for this gift — the class currency first — or null if neither can. */
export function payingCurrency(gift: GiftDefinition, balances: Balances, classCurrency: WalletCurrency) {
  const order = [classCurrency, ...CURRENCIES.filter((c) => c !== classCurrency)];
  return order.find((c) => balances[c] >= gift.prices[c]) ?? null;
}

interface GiftSheetProps {
  open: boolean;
  onClose: () => void;
  overview: GiftOverview | undefined;
  loading: boolean;
  loadError: string | null;
  onRetryLoad: () => void;
  sendingCode: string | null;
  /** Resolves to a message to show inside the sheet if the gift didn't go through. */
  onSend: (code: string) => Promise<{ ok: true } | { ok: false; reason: "insufficient" | "error"; message: string }>;
  /** Who it's for — "the host" for attendees, a participant's name for hosts. */
  recipientName: string;
}

export const GiftSheet = memo(function GiftSheet({
  open,
  onClose,
  overview,
  loading,
  loadError,
  onRetryLoad,
  sendingCode,
  onSend,
  recipientName,
}: GiftSheetProps) {
  const [problem, setProblem] = useState<{ message: string; insufficient: boolean } | null>(null);

  // A different recipient (or reopening) starts clean.
  useEffect(() => {
    if (open) setProblem(null);
  }, [open, recipientName]);

  const send = async (gift: GiftDefinition) => {
    tapHaptic(12);
    setProblem(null);
    const result = await onSend(gift.code);
    if (!result.ok) setProblem({ message: result.message, insufficient: result.reason === "insufficient" });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Send a gift to ${recipientName}`}
      icon={<Gift className="h-4 w-4 text-primary" />}
      mobileHeight="max-h-[78dvh]"
    >
      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        {loading && !overview ? (
          <div className="flex items-center justify-center py-12 text-white/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : loadError && !overview ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-white/70">{loadError}</p>
            <button type="button" onClick={onRetryLoad} className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold">
              Try again
            </button>
          </div>
        ) : overview ? (
          <>
            {/* Wallet */}
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Wallet className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 text-sm">
                  <p className="text-[11px] uppercase tracking-wide text-white/50">Your wallet</p>
                  <p className="truncate font-semibold">
                    {formatMoney(overview.balances.NGN, "NGN")}
                    <span className="mx-1.5 text-white/30">·</span>
                    {formatMoney(overview.balances.USD, "USD")}
                  </p>
                </div>
              </div>
              <a
                href="/dashboard/wallet"
                target="_blank"
                rel="noopener"
                className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white active:scale-95"
              >
                Top up
              </a>
            </div>

            {problem && (
              <div
                role="alert"
                className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                  problem.insufficient ? "bg-amber-400/10 text-amber-100" : "bg-red-500/10 text-red-200"
                }`}
              >
                {problem.message}
                {problem.insufficient && (
                  <>
                    {" "}
                    <a href="/dashboard/wallet" target="_blank" rel="noopener" className="font-semibold underline">
                      Top up your wallet
                    </a>{" "}
                    and come back — you won&apos;t miss the class.
                  </>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {overview.gifts.map((gift) => {
                const currency = payingCurrency(gift, overview.balances, overview.currency);
                const affordable = currency !== null;
                const shownCurrency = currency ?? overview.currency;
                const sending = sendingCode === gift.code;
                return (
                  <button
                    key={gift.code}
                    type="button"
                    disabled={sendingCode !== null}
                    onClick={() => void send(gift)}
                    aria-label={`Send ${gift.name} for ${formatMoney(gift.prices[shownCurrency], shownCurrency)}`}
                    className={`relative flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 transition active:scale-95 disabled:cursor-wait ${
                      affordable ? "border-white/10 bg-white/5 hover:border-primary/60" : "border-white/5 bg-white/[0.02] opacity-50"
                    }`}
                  >
                    <span className="text-3xl leading-none sm:text-4xl">{gift.emoji}</span>
                    <span className="text-xs font-semibold">{gift.name}</span>
                    <span className="text-[11px] text-white/60">{formatMoney(gift.prices[shownCurrency], shownCurrency)}</span>
                    {sending && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-[11px] text-white/40">
              Paid from your Hallos wallet. {recipientName === "the host" ? "The host receives" : `${recipientName} receives`} 80%
              of every gift.
            </p>
          </>
        ) : null}
      </div>
    </Sheet>
  );
});
