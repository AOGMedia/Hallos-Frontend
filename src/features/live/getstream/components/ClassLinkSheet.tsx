"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { tapHaptic } from "../lib/haptics";
import { Sheet } from "./Sheet";

interface ClassLinkSheetProps {
  open: boolean;
  onClose: () => void;
  /** The class's join link (see lib/inviteLink). */
  url: string;
  title: string;
  onNotify: (message: string, tone: "success" | "error") => void;
}

const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * The class link, always at hand for the host (like Meet's meeting details):
 * the link itself, a big Copy button and — on phones — the native Share sheet.
 */
export function ClassLinkSheet({ open, onClose, url, title, onNotify }: ClassLinkSheetProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read once on the client (the room only renders there).
  const [shareSupported] = useState(canNativeShare);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const copy = async () => {
    tapHaptic(10);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify("Couldn't copy the link. Press and hold it to copy instead.", "error");
    }
  };

  const share = async () => {
    tapHaptic(10);
    try {
      await navigator.share({ title, text: `Join "${title}" on Hallos`, url });
    } catch {
      // Cancelled: nothing to do.
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Class link" icon={<Link2 className="h-4 w-4 text-primary" aria-hidden />} mobileHeight="max-h-[60dvh]">
      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-1">
        <p className="mb-3 text-sm text-white/70">Share this link to invite people to the class.</p>

        <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
          <Link2 className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
          {/* Selectable, so it can always be copied by hand too. */}
          <span className="min-w-0 flex-1 select-all truncate font-mono text-[13px] text-white/90" title={url}>
            {url.replace(/^https?:\/\//, "")}
          </span>
        </div>

        <div className={`mt-3 grid gap-2 ${shareSupported ? "grid-cols-2" : "grid-cols-1"}`}>
          <button
            type="button"
            onClick={() => void copy()}
            className={`flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition active:scale-[0.99] ${
              copied ? "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40" : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied ? "Copied" : "Copy link"}
          </button>
          {shareSupported && (
            <button
              type="button"
              onClick={() => void share()}
              className="flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.99]"
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-white/45" aria-live="polite">
          {copied ? "Link copied." : "People still need access to join: paid classes ask for payment, private ones need an invite."}
        </p>
      </div>
    </Sheet>
  );
}
