"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuizStatus, useQuizStart } from "@/hooks/useCampaignQuiz";
import { useQuizStore } from "@/store/useQuizStore";
import { QuizReadyScreen } from "@/components/campaign/quiz/QuizReadyScreen";
import { QuizActiveScreen } from "@/components/campaign/quiz/QuizActiveScreen";
import { QuizResultsScreen } from "@/components/campaign/quiz/QuizResultsScreen";
import { QuizErrorScreen } from "@/components/campaign/quiz/QuizErrorScreen";

// ── Loading spinner ─────────────────────────────────────────────────────────
function QuizLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
      />
    </div>
  );
}

// ── Resume loader — fetches questions then hands off to ActiveScreen ─────
interface ResumeProps {
  token: string;
  answersSubmitted: number;
  secondsPerQuestion: number;
  startedAt: string;
  maxDurationSeconds?: number;
}

function QuizResume({
  token,
  answersSubmitted,
  secondsPerQuestion,
  startedAt,
}: ResumeProps) {
  const phase = useQuizStore((s) => s.phase);
  const startSession = useQuizStore((s) => s.startSession);
  const { mutateAsync: startQuiz } = useQuizStart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await startQuiz(token);
        if (cancelled) return;
        startSession({
          sessionId: data.sessionId,
          startedAt,
          secondsPerQuestion,
          maxDurationSeconds: data.maxDurationSeconds,
          questions: data.questions,
          answeredCount: answersSubmitted,
        });
      } catch {
        // swallow — QuizLoading stays until phase changes
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase !== "active") return <QuizLoading />;
  return <QuizActiveScreen token={token} isResuming />;
}

// ── Inner page (needs Suspense boundary for useSearchParams) ────────────
function QuizInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { phase, result, setToken } = useQuizStore();

  useEffect(() => {
    if (token) setToken(token);
  }, [token, setToken]);

  const { data: statusData, isLoading, error: statusError } = useQuizStatus(token);

  // No token in URL
  if (!token) return <QuizErrorScreen kind="invalid" />;

  // Fetching status
  if (isLoading) return <QuizLoading />;

  // HTTP error responses
  if (statusError) {
    const httpStatus = (statusError as Error & { httpStatus?: number }).httpStatus;
    if (httpStatus === 410) return <QuizErrorScreen kind="expired" />;
    if (httpStatus === 403) return <QuizErrorScreen kind="claimed" />;
    if (httpStatus === 404) return <QuizErrorScreen kind="invalid" />;
    return (
      <QuizErrorScreen kind="generic" message={(statusError as Error).message} />
    );
  }

  // Store says completed (just finished this session)
  if (phase === "completed" && result) {
    return (
      <QuizResultsScreen
        score={result.score}
        totalCorrect={result.totalCorrect}
        totalQuestions={result.totalQuestions}
        totalTimeMs={result.totalTimeMs}
      />
    );
  }

  // Submitting in progress
  if (phase === "submitting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        />
        <p className="text-text-gray text-sm">Submitting your quiz…</p>
      </div>
    );
  }

  // Store already has an active session (e.g. page refresh within same session)
  if (phase === "active") {
    return <QuizActiveScreen token={token} />;
  }

  if (!statusData) return <QuizLoading />;

  // Previously completed
  if (statusData.status === "completed") {
    return (
      <QuizResultsScreen
        score={statusData.score}
        totalCorrect={statusData.totalCorrect}
        totalQuestions={statusData.totalQuestions}
        totalTimeMs={statusData.totalTimeMs}
        completedAt={statusData.completedAt}
      />
    );
  }

  // Ready to start
  if (statusData.status === "pending") {
    return (
      <QuizReadyScreen token={token} expiresAt={statusData.tokenExpiresAt} />
    );
  }

  // Mid-quiz resume
  if (statusData.status === "active") {
    return (
      <QuizResume
        token={token}
        answersSubmitted={statusData.answersSubmitted}
        secondsPerQuestion={statusData.secondsPerQuestion}
        startedAt={statusData.startedAt}
      />
    );
  }

  return <QuizErrorScreen kind="generic" />;
}

// ── Page export ─────────────────────────────────────────────────────────────
export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizInner />
    </Suspense>
  );
}
