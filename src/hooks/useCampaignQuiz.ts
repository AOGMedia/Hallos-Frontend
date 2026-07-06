import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import axios from "axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface QuizStatusPending {
  success: true;
  status: "pending";
  tokenExpiresAt: string;
}

export interface QuizStatusActive {
  success: true;
  status: "active";
  startedAt: string;
  answersSubmitted: number;
  totalQuestions: number;
  secondsPerQuestion: number;
}

export interface QuizStatusCompleted {
  success: true;
  status: "completed";
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  totalTimeMs: number;
  completedAt: string;
}

export type QuizStatusResponse =
  | QuizStatusPending
  | QuizStatusActive
  | QuizStatusCompleted;

export interface QuizQuestion {
  questionIndex: number;
  questionId: string;
  questionText: string;
  shuffledOptions: Record<string, string>;
}

export interface QuizStartResponse {
  success: true;
  sessionId: string;
  startedAt: string;
  status: "active";
  secondsPerQuestion: number;
  totalQuestions: number;
  maxDurationSeconds: number;
  questions: QuizQuestion[];
}

export interface QuizAnswerPayload {
  questionId: string;
  questionIndex: number;
  selectedAnswer: string;
  clientTimestamp: number;
}

export interface QuizAnswerResponse {
  success: boolean;
  message: string;
  answersSubmitted: number;
  totalQuestions: number;
  timedOut: boolean;
}

export interface QuizSubmitResponse {
  success: boolean;
  message: string;
  score: number;
  totalCorrect: number;
  totalQuestions: number;
  totalTimeMs: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

export function useQuizStatus(token: string) {
  return useQuery<QuizStatusResponse>({
    queryKey: ["quiz-status", token],
    queryFn: async () => {
      try {
        const res = await apiClient.get<QuizStatusResponse>(
          `/api/campaigns/quiz/${token}/status`
        );
        return res.data;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data = err.response?.data ?? {};
          // Attach status + server message so callers can branch on it
          throw Object.assign(new Error(data.message || "Request failed"), {
            httpStatus: status,
            data,
          });
        }
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 0,
  });
}

export function useQuizStart() {
  return useMutation<QuizStartResponse, Error, string>({
    mutationFn: async (token: string) => {
      const res = await apiClient.get<QuizStartResponse>(
        `/api/campaigns/quiz/${token}/start`
      );
      return res.data;
    },
  });
}

export function useQuizAnswer() {
  return useMutation<
    QuizAnswerResponse,
    Error,
    { token: string } & QuizAnswerPayload
  >({
    mutationFn: async ({ token, ...body }) => {
      const res = await apiClient.post<QuizAnswerResponse>(
        `/api/campaigns/quiz/${token}/answer`,
        body
      );
      return res.data;
    },
  });
}

export function useQuizSubmit() {
  return useMutation<QuizSubmitResponse, Error, string>({
    mutationFn: async (token: string) => {
      const res = await apiClient.post<QuizSubmitResponse>(
        `/api/campaigns/quiz/${token}/submit`
      );
      return res.data;
    },
  });
}
