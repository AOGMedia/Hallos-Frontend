import { create } from "zustand";
import type { QuizQuestion, QuizSubmitResponse } from "@/hooks/useCampaignQuiz";

export type QuizPhase =
  | "idle"
  | "starting"
  | "active"
  | "submitting"
  | "completed";

interface QuizStore {
  // session
  token: string;
  sessionId: string | null;
  startedAt: string | null;
  secondsPerQuestion: number;
  maxDurationSeconds: number;

  // questions
  questions: QuizQuestion[];
  currentIndex: number;
  answeredCount: number;

  // ui phase
  phase: QuizPhase;

  // results
  result: QuizSubmitResponse | null;

  // actions
  setToken: (token: string) => void;
  startSession: (data: {
    sessionId: string;
    startedAt: string;
    secondsPerQuestion: number;
    maxDurationSeconds: number;
    questions: QuizQuestion[];
    answeredCount?: number;
  }) => void;
  advance: () => void;
  setPhase: (phase: QuizPhase) => void;
  setCompleted: (result: QuizSubmitResponse) => void;
  reset: () => void;
}

const defaults = {
  token: "",
  sessionId: null,
  startedAt: null,
  secondsPerQuestion: 15,
  maxDurationSeconds: 300,
  questions: [],
  currentIndex: 0,
  answeredCount: 0,
  phase: "idle" as QuizPhase,
  result: null,
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...defaults,

  setToken: (token) => set({ token }),

  startSession: ({
    sessionId,
    startedAt,
    secondsPerQuestion,
    maxDurationSeconds,
    questions,
    answeredCount = 0,
  }) =>
    set({
      sessionId,
      startedAt,
      secondsPerQuestion,
      maxDurationSeconds,
      questions,
      answeredCount,
      // Resume from the correct question index
      currentIndex: Math.min(answeredCount, questions.length - 1),
      phase: "active",
    }),

  advance: () => {
    const { currentIndex, questions } = get();
    const next = currentIndex + 1;
    set({
      answeredCount: next,
      currentIndex: Math.min(next, questions.length - 1),
    });
  },

  setPhase: (phase) => set({ phase }),

  setCompleted: (result) => set({ phase: "completed", result }),

  reset: () => set(defaults),
}));
