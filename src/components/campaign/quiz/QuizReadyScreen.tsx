"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuizStore } from "@/store/useQuizStore";
import { useQuizStart } from "@/hooks/useCampaignQuiz";
import axios from "axios";

interface Props {
  token: string;
  expiresAt: string;
}

function formatExpiry(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const rules = [
  { icon: "⏱", text: "20 questions · 15 seconds each" },
  { icon: "🔇", text: "No feedback per answer — results after submission" },
  { icon: "🔁", text: "No retakes once submitted" },
  { icon: "📧", text: "Results sent to your email automatically" },
];

export function QuizReadyScreen({ token, expiresAt }: Props) {
  const startSession = useQuizStore((s) => s.startSession);
  const { mutateAsync: startQuiz } = useQuizStart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await startQuiz(token);
      startSession({
        sessionId: data.sessionId,
        startedAt: data.startedAt,
        secondsPerQuestion: data.secondsPerQuestion,
        maxDurationSeconds: data.maxDurationSeconds,
        questions: data.questions,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to start. Try again.");
      } else {
        setError("Something went wrong. Please refresh.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Emoji */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <span className="text-[60px] sm:text-[76px] select-none">🎯</span>
        </motion.div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-text-primary mb-2">
          Ready for the{" "}
          <span className="gradient-purple-cyan">Quiz?</span>
        </h1>
        <p className="text-text-gray text-center text-xs sm:text-sm mb-6 sm:mb-8">
          Link expires&nbsp;{formatExpiry(expiresAt)}
        </p>

        {/* Rules card */}
        <div className="glass-effect rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {rules.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg sm:text-xl leading-none mt-0.5 flex-shrink-0">{r.icon}</span>
              <p className="text-text-secondary text-sm leading-relaxed">{r.text}</p>
            </motion.div>
          ))}
        </div>

        {error && (
          <p className="text-accent-red text-sm text-center mb-4">{error}</p>
        )}

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          disabled={loading}
          className="w-full h-13 sm:h-14 rounded-full bg-primary text-white font-bold text-base sm:text-lg shadow-lg shadow-primary/30 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading questions…
            </>
          ) : (
            "Start Quiz →"
          )}
        </motion.button>

        <p className="text-center text-text-gray text-xs mt-3 sm:mt-4">
          Once you start, the timer begins immediately.
        </p>
      </motion.div>
    </div>
  );
}
