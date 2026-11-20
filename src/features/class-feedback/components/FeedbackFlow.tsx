"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { submitFeedback, type FeedbackForm } from "../api";
import { answersOf, draftFrom, stepsFor, visibleSteps, type FeedbackDraft, type FeedbackStep } from "../questions";
import { FeedbackShell, PrimaryButton } from "./FeedbackShell";
import { RatingFaces } from "./RatingFaces";
import { ChoiceList } from "./ChoiceList";
import { IssueChips } from "./IssueChips";
import { CommentBox } from "./CommentBox";
import { ThankYou } from "./StatusScreens";

/** How long a chosen answer stays on screen before the next question slides in. */
const ADVANCE_DELAY_MS = 320;

/**
 * One question per screen. A tap on a face or an option answers it and moves
 * on; the overall rating is saved straight away (so a single tap counts even
 * if they stop there); the rest is sent at the end.
 */
export function FeedbackFlow({ token, form, startAt = 0 }: { token: string; form: FeedbackForm; startAt?: number }) {
  const steps = useMemo(() => stepsFor(form), [form]);
  const [draft, setDraft] = useState<FeedbackDraft>(() => draftFrom(form));
  const [index, setIndex] = useState(startAt);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = visibleSteps(steps, draft);
  const position = Math.min(index, visible.length - 1);
  const step = visible[position];
  const isLast = position === visible.length - 1;

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  // Screen readers: announce each new question by moving focus to it.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [step.id]);

  const goTo = useCallback((next: number, dir: 1 | -1) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setDirection(dir);
    setIndex(next);
  }, []);

  const next = () => goTo(position + 1, 1);
  const back = () => goTo(Math.max(0, position - 1), -1);

  /** Answer a one-tap question, then move on after a short beat. */
  const answerAndAdvance = (patch: Partial<FeedbackDraft>, isOverall = false) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
    if (isOverall && typeof patch.overall === "number") {
      // Saved now: one tap is a complete answer. If this fails, the end saves it.
      void submitFeedback(token, { overall: patch.overall }).catch(() => {});
    }
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setDirection(1);
      setIndex((i) => i + 1);
    }, ADVANCE_DELAY_MS);
  };

  const send = async () => {
    if (!draft.overall) {
      goTo(0, -1);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitFeedback(token, {
        overall: draft.overall,
        answers: answersOf(draft, steps),
        comment: draft.comment.trim(),
        anonymous: form.role === "participant" && draft.anonymous,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn’t send your feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (done) return <ThankYou form={form} anonymous={form.role === "participant" && draft.anonymous} />;

  const context = [form.title, form.sessionLabel, form.role === "host" ? "Your session" : `with ${form.hostName}`]
    .filter(Boolean)
    .join(" · ");

  const footer = renderFooter(step, draft, { isLast, sending, onNext: next, onSend: () => void send() });

  return (
    <FeedbackShell progress={{ current: position + 1, total: visible.length }} onBack={position > 0 ? back : undefined} footer={footer}>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.section
          key={step.id}
          custom={direction}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: direction * -28 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          aria-labelledby="feedback-question"
        >
          <p className="truncate text-[13px] font-medium text-white/50">{context}</p>
          <h1
            id="feedback-question"
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-[28px] font-extrabold leading-[1.15] tracking-tight outline-none sm:text-[34px]"
          >
            {step.title}
          </h1>
          {step.kind === "chips" && <p className="mt-2 text-[15px] text-white/55">{step.subtitle}</p>}

          <div className="mt-8">{renderAnswer(step, draft, setDraft, answerAndAdvance)}</div>

          {error && (
            <p role="alert" className="mt-5 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </motion.section>
      </AnimatePresence>
    </FeedbackShell>
  );
}

function renderAnswer(
  step: FeedbackStep,
  draft: FeedbackDraft,
  setDraft: React.Dispatch<React.SetStateAction<FeedbackDraft>>,
  answerAndAdvance: (patch: Partial<FeedbackDraft>, isOverall?: boolean) => void
) {
  switch (step.kind) {
    case "rating":
      return (
        <RatingFaces
          label={step.title}
          labels={step.labels}
          value={draft[step.field]}
          onChange={(v) => answerAndAdvance({ [step.field]: v }, step.field === "overall")}
        />
      );
    case "choice":
      return (
        <ChoiceList label={step.title} choices={step.choices} value={draft[step.field]} onChange={(v) => answerAndAdvance({ [step.field]: v })} />
      );
    case "chips":
      return (
        <IssueChips
          label={step.title}
          choices={step.choices}
          exclusive={step.exclusive}
          value={draft[step.field] ?? []}
          onChange={(update) => setDraft((d) => ({ ...d, [step.field]: update(d[step.field] ?? []) }))}
        />
      );
    case "comment":
      return (
        <CommentBox
          label={step.title}
          value={draft.comment}
          onChange={(comment) => setDraft((d) => ({ ...d, comment }))}
          placeholder={step.placeholder}
          note={step.note}
          allowAnonymous={step.allowAnonymous}
          anonymous={draft.anonymous}
          onAnonymous={(anonymous) => setDraft((d) => ({ ...d, anonymous }))}
        />
      );
  }
}

function renderFooter(
  step: FeedbackStep,
  draft: FeedbackDraft,
  { isLast, sending, onNext, onSend }: { isLast: boolean; sending: boolean; onNext: () => void; onSend: () => void }
) {
  if (isLast) {
    return (
      <PrimaryButton onClick={onSend} busy={sending}>
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {sending ? "Sending…" : "Send feedback"}
      </PrimaryButton>
    );
  }
  // The first question needs an answer; the rest can be skipped.
  const required = step.kind === "rating" && step.field === "overall";
  const answered =
    step.kind === "chips" ? (draft[step.field]?.length ?? 0) > 0 : step.kind === "comment" ? true : draft[step.field] !== undefined;
  if (required && !answered) return null;
  return (
    <div className="flex items-center gap-3">
      {!required && !answered && <span className="flex-1 text-sm text-white/45">Optional</span>}
      <div className={!required && !answered ? "w-36" : "flex-1"}>
        <PrimaryButton onClick={onNext}>{answered ? "Next" : "Skip"}</PrimaryButton>
      </div>
    </div>
  );
}
