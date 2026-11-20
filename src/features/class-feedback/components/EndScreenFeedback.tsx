"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { submitFeedback } from "../api";
import { OVERALL_LABELS } from "../questions";
import { useEndScreenLink } from "../useEndScreenLink";
import { tap } from "../haptics";
import { RatingFaces } from "./RatingFaces";

/**
 * "How was it?" on the class-ended screen (GetStream and ZegoCloud rooms).
 * Only ever after the class: the backend gives a link once it has ended,
 * and only to people who were in it, so for anyone else this shows nothing.
 *
 * One tap on a face saves the rating straight away (so they won't be emailed
 * about it later); "Add more detail" carries on in the full form from the
 * next question.
 */
export function EndScreenFeedback({ kind, id }: { kind: "class" | "session"; id: string }) {
  const { data: link } = useEndScreenLink(kind, id);
  const reduceMotion = useReducedMotion();
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!link) return null;

  const noun = kind === "session" ? "session" : "class";
  const isHost = link.role === "host";
  const alreadyShared = link.responded && !saved;
  const fullFormHref = `/feedback/${link.token}`;

  const rate = async (value: number) => {
    if (saving) return;
    setRating(value);
    setSaving(true);
    setError(null);
    try {
      await submitFeedback(link.token, { overall: value });
      tap(18);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn’t save that. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const view = alreadyShared ? "shared" : saved ? "thanks" : "ask";

  return (
    <motion.section
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      aria-labelledby="end-feedback-title"
      className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left"
    >
      <AnimatePresence mode="wait" initial={false}>
        {view === "ask" && (
          <motion.div key="ask" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <p className="text-[13px] font-medium text-white/50">Quick feedback · takes a second</p>
            <h3 id="end-feedback-title" className="mt-1 text-lg font-bold text-white">
              {isHost ? `How did your ${noun} go?` : `How was the ${noun}?`}
            </h3>
            <div className={`mt-4 ${saving ? "pointer-events-none" : ""}`} aria-busy={saving}>
              <RatingFaces
                label={isHost ? `How did your ${noun} go?` : `How was the ${noun}?`}
                labels={OVERALL_LABELS[link.role]}
                value={rating}
                onChange={(v) => void rate(v)}
              />
            </div>
            {saving && (
              <p className="mt-1 flex items-center justify-center gap-2 text-xs text-white/50">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Saving…
              </p>
            )}
            {error && (
              <p role="alert" className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
                {error}
              </p>
            )}
          </motion.div>
        )}

        {view !== "ask" && (
          <motion.div
            key="done"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 id="end-feedback-title" className="text-base font-bold text-white" aria-live="polite">
                  {view === "thanks" ? "Thanks, that helps" : "You’ve shared feedback"}
                </h3>
                <p className="mt-0.5 text-sm text-white/60">
                  {view === "thanks"
                    ? isHost
                      ? "A few more answers help us make your next class smoother."
                      : "Got a minute? Tell us what worked and what could be better."
                    : `Thanks for telling us about this ${noun}.`}
                </p>
              </div>
            </div>
            <Link
              href={view === "thanks" ? `${fullFormHref}?continue=1` : fullFormHref}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 active:scale-[0.98]"
            >
              {view === "thanks" ? "Add more detail" : "See or change your answers"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
