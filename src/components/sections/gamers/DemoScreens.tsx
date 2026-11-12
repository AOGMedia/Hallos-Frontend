'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Lock, Swords, Trophy, Users, Zap } from 'lucide-react';
import type { DemoStepId } from './demoSteps';

/*
 * The screens shown inside the demo phone, one per step. Plain markup with
 * short transform/opacity animations only — no images, no layout animation —
 * so the demo stays light. A screen mounts when its step starts and
 * unmounts when it ends, so nothing runs in the background.
 */

const ease = [0.2, 0.8, 0.2, 1] as const;

function Avatar({ initials, you = false }: { initials: string; you?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        you ? 'bg-primary text-white' : 'bg-white/10 text-white/80'
      }`}
    >
      {initials}
    </span>
  );
}

function ScreenHeader({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 pb-3 pt-1">
      <span className="text-sm font-semibold text-white">{title}</span>
      {aside}
    </div>
  );
}

const ChutaBadge = ({ amount }: { amount: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white">
    <Zap size={11} className="text-yellow-300" /> {amount}
  </span>
);

/* 1 — Lobby: pick an opponent, set a wager, send the challenge. */
const PLAYERS = [
  { initials: 'MB', name: 'MidnightBolt', record: '15 wins' },
  { initials: 'AK', name: 'Adaeze K.', record: '22 wins' },
  { initials: 'TF', name: 'TundeFast', record: '9 wins' },
];

function ChallengeScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Lobby" aside={<ChutaBadge amount="1,250" />} />
      <div className="flex-1 space-y-2 p-3">
        {PLAYERS.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.08, ease }}
            className="relative flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2.5"
          >
            {i === 1 && (
              <motion.span
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.2 }}
                className="absolute inset-0 rounded-2xl ring-2 ring-primary"
              />
            )}
            <Avatar initials={p.initials} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{p.name}</p>
              <p className="text-[11px] text-white/50">{p.record}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white">
              <Swords size={11} /> Challenge
            </span>
          </motion.div>
        ))}
      </div>
      {/* The challenge sheet slides up for the chosen player. */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ delay: 1.4, duration: 0.35, ease }}
        className="rounded-t-3xl border-t border-white/10 bg-[#1F2636] p-4"
      >
        <p className="text-[13px] font-semibold text-white">Challenge Adaeze K.</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['Topic', 'Science'],
            ['Wager', '50 Chuta'],
            ['Questions', '10'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/[0.05] px-1 py-2">
              <p className="text-[10px] text-white/45">{label}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.96, 1] }}
          transition={{ delay: 2.7, duration: 0.3 }}
          className="mt-3 rounded-full bg-primary py-2.5 text-center text-[13px] font-semibold text-white"
        >
          Send challenge
        </motion.div>
      </motion.div>
    </div>
  );
}

/* 2 — Accepted: both wagers are held, then a 3-2-1 countdown. */
function AcceptScreen() {
  return (
    <div className="flex h-full flex-col items-center px-5 pt-6 text-center">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-white/45">Challenge accepted</p>
      <div className="mt-6 flex w-full items-center justify-between">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease }}
          className="flex flex-col items-center gap-2"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-base font-bold text-white">You</span>
          <span className="text-[12px] font-semibold text-white">50 Chuta</span>
        </motion.div>
        <motion.span
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 16 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-white"
        >
          <Swords size={18} />
        </motion.span>
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease }}
          className="flex flex-col items-center gap-2"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-base font-bold text-white/80">AK</span>
          <span className="text-[12px] font-semibold text-white">50 Chuta</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3, ease }}
        className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-white/[0.05] p-3 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-300/15 text-yellow-300">
          <Lock size={16} />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-white">100 Chuta held</p>
          <p className="text-[11px] text-white/50">Released to the winner when the match ends</p>
        </div>
      </motion.div>

      {/* 3, 2, 1 — stacked numbers, each shown in turn (no timers). */}
      <div className="relative mt-auto mb-10 h-16 w-16">
        {['3', '2', '1'].map((n, i) => (
          <motion.span
            key={n}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-white"
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: [0, 1, 1, i === 2 ? 1 : 0], scale: [1.3, 1, 1, i === 2 ? 1 : 0.8] }}
            transition={{ delay: 1.2 + i * 0.7, duration: 0.7, times: [0, 0.25, 0.8, 1] }}
          >
            {n}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* 3 — Match: two questions against the clock. */
interface Question {
  number: number;
  prompt: string;
  options: string[];
  correct: number;
  /** Seconds after this question appears that the answer lands. */
  answerAt: number;
  scoreFrom: number;
  scoreTo: number;
  opponentScore: number;
  rewards: { label: string; bonus?: boolean }[];
}

const QUESTIONS: Question[] = [
  {
    number: 3,
    prompt: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
    answerAt: 1.6,
    scoreFrom: 19,
    scoreTo: 30,
    opponentScore: 14,
    rewards: [{ label: '+8 points' }, { label: '+3 speed bonus', bonus: true }],
  },
  {
    number: 4,
    prompt: 'What gas do plants take in from the air?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'],
    correct: 2,
    answerAt: 1.8,
    scoreFrom: 30,
    scoreTo: 42,
    opponentScore: 22,
    rewards: [{ label: '+12 points (hard)' }],
  },
];

/** When the second question replaces the first, in seconds from the step's start. */
const SECOND_QUESTION_AT = 3.6;

function QuestionCard({ q, startAt }: { q: Question; startAt: number }) {
  const answer = startAt + q.answerAt;
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={`Question ${q.number} of 10`}
        aside={
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/70">
            <Clock size={12} /> 10s
          </span>
        }
      />
      {/* Countdown: one transform animation that stops when the answer lands. */}
      <div className="mx-4 mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full origin-left rounded-full bg-primary"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 1 - q.answerAt / 10 }}
          transition={{ delay: startAt, duration: q.answerAt, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <Avatar initials="You" you />
          <span className="text-lg font-bold text-white">
            <ScoreTick from={q.scoreFrom} to={q.scoreTo} at={answer + 0.4} />
          </span>
        </div>
        <span className="text-[11px] font-semibold text-white/40">VS</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white/80">{q.opponentScore}</span>
          <Avatar initials="AK" />
        </div>
      </div>

      <p className="min-h-[52px] px-4 pt-5 text-[15px] font-semibold leading-snug text-white">{q.prompt}</p>

      <div className="grid grid-cols-2 gap-2 p-4">
        {q.options.map((option, i) => {
          const right = i === q.correct;
          return (
            <motion.div
              key={option}
              className="relative flex min-h-[46px] items-center justify-between overflow-hidden rounded-2xl bg-white/[0.05] px-3 py-2.5 text-[13px] font-medium leading-tight text-white"
              animate={right ? { scale: [1, 0.96, 1] } : { opacity: [1, 1, 0.45] }}
              transition={{ delay: answer, duration: 0.3 }}
            >
              {right && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 bg-green-500/20 ring-2 ring-inset ring-green-500/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: answer + 0.1, duration: 0.2 }}
                />
              )}
              <span className="relative">{option}</span>
              {right && (
                <motion.span
                  className="relative"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: answer + 0.15, duration: 0.2 }}
                >
                  <Check size={15} className="text-green-400" />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="mx-auto mt-auto mb-5 flex items-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: answer + 0.3, duration: 0.25, ease }}
      >
        {q.rewards.map((r) =>
          r.bonus ? (
            <span key={r.label} className="inline-flex items-center gap-1 rounded-full bg-yellow-300/15 px-3 py-1.5 text-[12px] font-semibold text-yellow-200">
              <Zap size={12} /> {r.label}
            </span>
          ) : (
            <span key={r.label} className="rounded-full bg-primary/20 px-3 py-1.5 text-[12px] font-semibold text-white">
              {r.label}
            </span>
          )
        )}
      </motion.div>
    </div>
  );
}

function AnswerScreen() {
  return (
    <div className="relative h-full overflow-hidden">
      {/* First question slides out as the second slides in. */}
      <motion.div
        className="absolute inset-0"
        initial={{ x: 0 }}
        animate={{ x: '-100%', opacity: 0 }}
        transition={{ delay: SECOND_QUESTION_AT, duration: 0.35, ease }}
      >
        <QuestionCard q={QUESTIONS[0]} startAt={0} />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ delay: SECOND_QUESTION_AT, duration: 0.35, ease }}
      >
        <QuestionCard q={QUESTIONS[1]} startAt={SECOND_QUESTION_AT + 0.35} />
      </motion.div>
    </div>
  );
}

/** Swaps a number once, at a given moment (no per-frame counting). */
function ScoreTick({ from, to, at }: { from: number; to: number; at: number }) {
  return (
    <span className="relative inline-block">
      <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: at, duration: 0.01 }}>
        {from}
      </motion.span>
      <motion.span
        className="absolute left-0 top-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: at, duration: 0.01 }}
      >
        {to}
      </motion.span>
    </span>
  );
}

/* 4 — Result: victory, the pot comes to the winner. */
function WinScreen() {
  return (
    <div className="flex h-full flex-col items-center px-5 pt-8 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-300/15 ring-1 ring-yellow-300/30"
      >
        <Trophy size={36} className="text-yellow-300" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.25, ease }}
        className="mt-4 text-2xl font-extrabold tracking-wide text-white"
      >
        Victory!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.25, ease }}
        className="mt-5 flex w-full items-center justify-between rounded-2xl bg-white/[0.05] p-3"
      >
        <div className="flex items-center gap-2">
          <Avatar initials="You" you />
          <span className="text-xl font-bold text-white">82</span>
        </div>
        <span className="text-[11px] font-semibold text-white/40">FINAL</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white/60">64</span>
          <Avatar initials="AK" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.3, ease }}
        className="mt-5 w-full rounded-2xl bg-primary p-4"
      >
        <p className="text-[11px] font-medium text-white/80">You won the pot</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-2xl font-extrabold text-white">
          <Zap size={20} className="text-yellow-300" /> +100 Chuta
        </p>
        <p className="mt-1 text-[11px] text-white/80">Your 50 + their 50</p>
      </motion.div>
    </div>
  );
}

/* 5 — Cash out: Chuta wallet to Hallos wallet (1 Chuta = $0.01, min 1,000, 10% fee). */
function CashoutScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Chuta wallet" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
        className="m-4 rounded-2xl bg-primary p-4"
      >
        <p className="text-[11px] font-medium text-white/80">Balance</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-2xl font-extrabold text-white">
          <Zap size={20} className="text-yellow-300" /> 1,350 Chuta
        </p>
        <p className="mt-0.5 text-[12px] text-white/80">About $13.50</p>
      </motion.div>

      <div className="mx-4 grid grid-cols-2 gap-2">
        <span className="rounded-full bg-white/[0.06] py-2.5 text-center text-[13px] font-semibold text-white/70">Top up</span>
        <motion.span
          animate={{ scale: [1, 0.95, 1] }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="rounded-full bg-white py-2.5 text-center text-[13px] font-semibold text-[#141a29]"
        >
          Withdraw
        </motion.span>
      </div>

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ delay: 1.1, duration: 0.35, ease }}
        className="mt-auto rounded-t-3xl border-t border-white/10 bg-[#1F2636] p-4"
      >
        <p className="text-[13px] font-semibold text-white">Withdraw to your Hallos wallet</p>
        <div className="mt-3 space-y-2 text-[12px]">
          {[
            ['Amount', '1,000 Chuta'],
            ['Fee (10%)', '−100 Chuta'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-white/60">
              <span>{label}</span>
              <span className="text-white">{value}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
            <span>You receive</span>
            <span>$9.00</span>
          </div>
        </div>
        <div className="relative mt-3 h-10 overflow-hidden rounded-full bg-primary text-[13px] font-semibold text-white">
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: [1, 0] }}
            transition={{ delay: 2.6, duration: 0.15 }}
          >
            Confirm withdrawal
          </motion.span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center gap-1.5 bg-green-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.7, duration: 0.2 }}
          >
            <Check size={15} /> Sent to your Hallos wallet
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

/* 6 — Tournaments: the formats, and an event to join or host. */
const FORMATS = ['Classic', 'Speed Run', 'Battle Royale', 'Knockout'];

function TournamentsScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Tournaments" aside={<ChutaBadge amount="1,350" />} />
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {FORMATS.map((f, i) => (
          <motion.span
            key={f}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.2, ease }}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              i === 1 ? 'bg-primary text-white' : 'bg-white/[0.06] text-white/70'
            }`}
          >
            {f}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.3, ease }}
        className="m-4 rounded-2xl bg-white/[0.05] p-4"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">STARTS IN 2H</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-white/60">
            <Users size={12} /> 84/100
          </span>
        </div>
        <p className="mt-2.5 text-[15px] font-semibold text-white">Science Sprint</p>
        <p className="text-[12px] text-white/50">Speed Run · 10 questions a round</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/45">Prize pool</p>
            <p className="inline-flex items-center gap-1 text-[14px] font-bold text-yellow-200">
              <Zap size={13} /> 10,000
            </p>
          </div>
          <motion.span
            initial={{ scale: 1 }}
            animate={{ scale: [1, 0.95, 1] }}
            transition={{ delay: 2, duration: 0.3 }}
            className="rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-white"
          >
            Register
          </motion.span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="mx-4 mt-auto mb-5 rounded-full border border-white/15 py-2.5 text-center text-[13px] font-semibold text-white"
      >
        Host a tournament
      </motion.div>
    </div>
  );
}

export const DEMO_SCREENS: Record<DemoStepId, () => React.JSX.Element> = {
  challenge: ChallengeScreen,
  accept: AcceptScreen,
  answer: AnswerScreen,
  win: WinScreen,
  cashout: CashoutScreen,
  tournaments: TournamentsScreen,
};
