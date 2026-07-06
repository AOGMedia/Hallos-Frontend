"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/store/useQuizStore";
import { useQuizAnswer, useQuizSubmit } from "@/hooks/useCampaignQuiz";

const OPTION_KEYS = ["a", "b", "c", "d", "e"] as const;
const OPTION_LABELS = ["A", "B", "C", "D", "E"];

interface Props {
  token: string;
  isResuming?: boolean;
}

// ── Circular countdown SVG ─────────────────────────────────────────────────
// Smaller on mobile (64px), larger on sm+ (88px)
function CircleTimer({
  seconds,
  total,
  danger,
}: {
  seconds: number;
  total: number;
  danger: boolean;
}) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = circ * (seconds / total);

  return (
    <div className="relative flex items-center justify-center w-14 h-14 sm:w-[72px] sm:h-[72px]">
      <svg
        viewBox="0 0 64 64"
        className="-rotate-90 w-full h-full"
      >
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(234,234,234,0.08)" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke={danger ? "#f5313b" : "#6a57e5"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.25s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className={`absolute text-base sm:text-lg font-bold tabular-nums transition-colors ${
          danger ? "text-accent-red" : "text-text-primary"
        } ${seconds <= 3 ? "animate-pulse" : ""}`}
      >
        {seconds}
      </span>
    </div>
  );
}

// ── Global thin timer bar at top ───────────────────────────────────────────
function GlobalBar({ elapsed, max }: { elapsed: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (1 - elapsed / max) * 100));
  const danger = elapsed >= max - 60;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: danger
            ? "linear-gradient(90deg, #f5313b, #ff7043)"
            : "linear-gradient(90deg, #6a57e5, #8ef1ff)",
          transition: "width 1s linear, background 0.5s",
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function QuizActiveScreen({ token, isResuming = false }: Props) {
  const {
    questions,
    currentIndex,
    answeredCount,
    startedAt,
    secondsPerQuestion,
    maxDurationSeconds,
    advance,
    setCompleted,
    setPhase,
  } = useQuizStore();

  const { mutateAsync: submitAnswer } = useQuizAnswer();
  const { mutateAsync: submitQuiz } = useQuizSubmit();

  const [qSeconds, setQSeconds] = useState(secondsPerQuestion);
  const [globalElapsed, setGlobalElapsed] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(isResuming);

  const submittedRef = useRef(false);
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];

  // ── Submit entire quiz ─────────────────────────────────────────────────
  const handleSubmitQuiz = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    setPhase("submitting");
    try {
      const result = await submitQuiz(token);
      setCompleted(result);
    } catch {
      setCompleted({
        success: true,
        message: "Quiz submitted!",
        score: 0,
        totalCorrect: 0,
        totalQuestions: questions.length,
        totalTimeMs: 0,
      });
    }
  }, [token, submitQuiz, setCompleted, setPhase, questions.length]);

  // ── Answer a question ──────────────────────────────────────────────────
  const advanceQuestion = useCallback(
    (answer: string) => {
      if (locked) return;
      setLocked(true);
      if (qTimerRef.current) clearInterval(qTimerRef.current);

      if (answer !== "timeout") setSelected(answer);

      submitAnswer({
        token,
        questionId: currentQuestion.questionId,
        questionIndex: currentQuestion.questionIndex,
        selectedAnswer: answer,
        clientTimestamp: Date.now(),
      }).catch(() => {});

      const delay = answer === "timeout" ? 200 : 750;

      setTimeout(async () => {
        const nextAnswered = answeredCount + 1;
        if (nextAnswered >= questions.length) {
          advance();
          await handleSubmitQuiz();
        } else {
          advance();
          setSelected(null);
          setQSeconds(secondsPerQuestion);
          setLocked(false);
        }
      }, delay);
    },
    [
      locked, currentQuestion, answeredCount, questions.length,
      secondsPerQuestion, token, advance, submitAnswer, handleSubmitQuiz,
    ]
  );

  // ── Per-question timer ─────────────────────────────────────────────────
  useEffect(() => {
    let initial = secondsPerQuestion;
    if (startedAt) {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const timeIntoQ = elapsed - answeredCount * secondsPerQuestion;
      initial = Math.min(secondsPerQuestion, Math.max(0, Math.round(secondsPerQuestion - timeIntoQ)));
    }
    setQSeconds(initial);
    if (qTimerRef.current) clearInterval(qTimerRef.current);

    if (initial === 0) { advanceQuestion("timeout"); return; }

    qTimerRef.current = setInterval(() => {
      setQSeconds((prev) => {
        if (prev <= 1) { clearInterval(qTimerRef.current!); advanceQuestion("timeout"); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => { if (qTimerRef.current) clearInterval(qTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── Global 300s timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      setGlobalElapsed(elapsed);
      if (elapsed >= maxDurationSeconds) { clearInterval(globalTimerRef.current!); handleSubmitQuiz(); }
    };
    tick();
    globalTimerRef.current = setInterval(tick, 1000);
    return () => { if (globalTimerRef.current) clearInterval(globalTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  // ── Keyboard A–E shortcuts (desktop only) ─────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase() as typeof OPTION_KEYS[number];
      if (OPTION_KEYS.includes(k) && !locked && currentQuestion?.shuffledOptions[k]) {
        advanceQuestion(k);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advanceQuestion, locked, currentQuestion]);

  // ── Resume banner auto-dismiss ─────────────────────────────────────────
  useEffect(() => {
    if (!showResumeBanner) return;
    const t = setTimeout(() => setShowResumeBanner(false), 2800);
    return () => clearTimeout(t);
  }, [showResumeBanner]);

  if (!currentQuestion) return null;

  const optionEntries = Object.entries(currentQuestion.shuffledOptions);
  const selectedText = selected ? currentQuestion.shuffledOptions[selected] : null;

  return (
    <>
      <GlobalBar elapsed={Math.round(globalElapsed)} max={maxDurationSeconds} />

      {/* Resume banner */}
      <AnimatePresence>
        {showResumeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-warning/20 border border-warning/40 text-warning text-xs sm:text-sm font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-full backdrop-blur-md whitespace-nowrap"
          >
            ⚡ Resuming your quiz…
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col items-center pt-4 sm:pt-6 pb-8 px-4">

        {/* Header — question counter · dots · timer */}
        <div className="w-full max-w-xl flex items-center justify-between mt-3 sm:mt-4 mb-5 sm:mb-8">

          {/* Question counter */}
          <div className="flex items-baseline gap-0.5 min-w-[40px]">
            <span className="text-base sm:text-lg font-bold text-text-primary tabular-nums">
              {currentIndex + 1}
            </span>
            <span className="text-text-gray text-xs sm:text-sm">/</span>
            <span className="text-text-gray text-xs sm:text-sm">{questions.length}</span>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 flex-wrap max-w-[160px] sm:max-w-[200px] justify-center">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i < answeredCount
                    ? "bg-primary"
                    : i === currentIndex
                    ? "bg-accent-cyan"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Circle timer */}
          <CircleTimer seconds={qSeconds} total={secondsPerQuestion} danger={qSeconds <= 4} />
        </div>

        {/* Question + options */}
        <div className="w-full max-w-xl flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              {/* Question text */}
              <div className="glass-effect rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5">
                <p className="text-text-primary font-semibold text-sm sm:text-base lg:text-lg leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {optionEntries.map(([key, text], idx) => {
                  const labelIdx = OPTION_KEYS.indexOf(key as typeof OPTION_KEYS[number]);
                  const label = OPTION_LABELS[labelIdx] ?? key.toUpperCase();
                  const isSelected = selected === key;

                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileTap={!locked ? { scale: 0.98 } : {}}
                      onClick={() => advanceQuestion(key)}
                      disabled={locked}
                      className={`relative flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-primary bg-primary/20 shadow-lg shadow-primary/20"
                          : "border-white/10 bg-white/[0.03] hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {/* Label badge */}
                      <span
                        className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                          isSelected ? "bg-primary text-white" : "bg-white/10 text-text-muted"
                        }`}
                      >
                        {label}
                      </span>

                      <span className="text-text-secondary text-sm leading-snug pr-6 sm:pr-8">
                        {text}
                      </span>

                      {/* Keyboard hint — desktop only */}
                      {!locked && (
                        <span className="hidden sm:inline absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-text-gray/40 font-mono uppercase">
                          {key}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* "You selected" strip */}
              <AnimatePresence>
                {selectedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 sm:mt-4 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-primary/10 border border-primary/25"
                  >
                    <span className="text-primary text-sm mt-0.5 flex-shrink-0">✦</span>
                    <p className="text-sm text-text-muted leading-snug">
                      You selected:{" "}
                      <span className="text-text-primary font-semibold">
                        &ldquo;{selectedText}&rdquo;
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Keyboard hint — desktop only */}
        <p className="hidden sm:block mt-6 text-text-gray text-xs">
          Press{" "}
          <kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono">A</kbd>
          {" – "}
          <kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono">E</kbd>{" "}
          to answer with keyboard
        </p>
      </div>
    </>
  );
}
