"use client";

import { useCallback, useRef, useState } from "react";

export type ToastTone = "info" | "success" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

const MAX_VISIBLE = 3;
const DURATION_MS = { info: 3500, success: 3500, error: 5000 } as const;

/** Short-lived messages at the top of the room. The newest replaces the oldest beyond three. */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "info", action?: Toast["action"]) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, message, tone, action }]);
      setTimeout(() => dismiss(id), DURATION_MS[tone] + (action ? 2500 : 0));
    },
    [dismiss]
  );

  return { toasts, show, dismiss };
}
