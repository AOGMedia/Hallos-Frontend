"use client";

import { motion } from "framer-motion";

type ErrorKind = "expired" | "invalid" | "claimed" | "completed" | "generic";

interface Props {
  kind: ErrorKind;
  message?: string;
}

const configs: Record<
  ErrorKind,
  { icon: string; title: string; body: string }
> = {
  expired: {
    icon: "⌛",
    title: "Link Expired",
    body: "This quiz link has expired. Quiz links are valid for 72 hours. Please contact support if you believe this is an error.",
  },
  invalid: {
    icon: "🔗",
    title: "Invalid Link",
    body: "This quiz link is invalid or has already been used. Please check your email for a valid link.",
  },
  claimed: {
    icon: "🔒",
    title: "Link Already Claimed",
    body: "This quiz link has already been claimed by another account. Each link is single-use and account-specific.",
  },
  completed: {
    icon: "✅",
    title: "Already Completed",
    body: "You have already completed this quiz. No retakes are allowed. Check your email for your results.",
  },
  generic: {
    icon: "⚠️",
    title: "Something went wrong",
    body: "An unexpected error occurred. Please try refreshing the page or contact support.",
  },
};

export function QuizErrorScreen({ kind, message }: Props) {
  const cfg = configs[kind];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
          className="text-7xl mb-6 select-none"
        >
          {cfg.icon}
        </motion.div>

        <h1 className="text-2xl font-bold text-text-primary mb-3">
          {cfg.title}
        </h1>

        <p className="text-text-gray text-sm leading-relaxed">
          {message || cfg.body}
        </p>
      </motion.div>
    </div>
  );
}
