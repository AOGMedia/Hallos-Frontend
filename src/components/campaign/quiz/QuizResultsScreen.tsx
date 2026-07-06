"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  totalTimeMs: number;
  completedAt?: string;
}

function formatTime(ms: number) {
  const secs = Math.round(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function CountUp({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const duration = 1200;

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    const delay = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 600);
    return () => {
      clearTimeout(delay);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  return <>{val}</>;
}

const COLORS = ["#6a57e5", "#8ef1ff", "#5099f8", "#ffd42a", "#14c877", "#f5313b"];

function Particles({ count = 36 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + Math.random() * 20;
    const speed = 55 + Math.random() * 75;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      color: COLORS[i % COLORS.length],
      size: 4 + Math.random() * 5,
      tx: Math.cos(rad) * speed,
      ty: Math.sin(rad) * speed,
      delay: 0.35 + Math.random() * 0.3,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: "50%", y: "25%", opacity: 1, scale: 1 }}
          animate={{ x: `calc(50% + ${p.tx}%)`, y: `calc(25% + ${p.ty}%)`, opacity: 0, scale: 0 }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

function gradeFor(correct: number, total: number) {
  const pct = correct / total;
  if (pct >= 0.9) return { label: "Outstanding!", color: "#14c877" };
  if (pct >= 0.75) return { label: "Excellent!", color: "#8ef1ff" };
  if (pct >= 0.5) return { label: "Good job!", color: "#6a57e5" };
  return { label: "Keep going!", color: "#ffd42a" };
}

export function QuizResultsScreen({
  score,
  totalCorrect,
  totalQuestions,
  totalTimeMs,
}: Props) {
  const [burst, setBurst] = useState(false);
  const grade = gradeFor(totalCorrect, totalQuestions);

  useEffect(() => {
    const t = setTimeout(() => setBurst(true), 300);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { label: "Correct", value: totalCorrect, color: "#14c877" },
    { label: "Wrong / Timeout", value: totalQuestions - totalCorrect, color: "#f5313b" },
    { label: "Total Time", value: formatTime(totalTimeMs), color: "#8ef1ff" },
    { label: "Accuracy", value: `${Math.round((totalCorrect / totalQuestions) * 100)}%`, color: "#ffd42a" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative">
      <AnimatePresence>{burst && <Particles />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-sm sm:max-w-md text-center"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-5xl sm:text-6xl mb-4 sm:mb-6 select-none"
        >
          🏆
        </motion.div>

        {/* Grade */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="text-base sm:text-lg font-bold mb-1"
          style={{ color: grade.color }}
        >
          {grade.label}
        </motion.p>

        {/* Score count-up */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="mb-1 leading-none"
        >
          <span className="text-6xl sm:text-7xl font-bold text-text-primary tabular-nums">
            <CountUp target={totalCorrect} />
          </span>
          <span className="text-2xl sm:text-3xl text-text-gray font-semibold">
            /{totalQuestions}
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58 }}
          className="text-text-gray text-xs sm:text-sm mb-6 sm:mb-8"
        >
          Score: {score} · Time: {formatTime(totalTimeMs)}
        </motion.p>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68 }}
          className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8"
        >
          {stats.map((s) => (
            <div key={s.label} className="glass-effect rounded-xl p-3 sm:p-4 text-left">
              <p className="text-[11px] sm:text-xs text-text-gray mb-1">{s.label}</p>
              <p className="text-lg sm:text-xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Email notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="flex items-start sm:items-center justify-center gap-2 text-text-gray text-xs sm:text-sm px-2"
        >
          <span className="flex-shrink-0 mt-0.5 sm:mt-0">📧</span>
          <span>Your detailed results have been sent to your email.</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
