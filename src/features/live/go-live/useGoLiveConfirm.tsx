"use client";

import { useCallback, useState } from "react";
import { GoLiveDialog } from "./GoLiveDialog";

export interface GoLiveRequest {
  /** The class or session name, shown in the prompt. */
  title: string;
  kind?: "class" | "session";
  /** Opens the room (which starts it). Called only after "Go live". */
  onGoLive: () => void;
  /** Called on "Not now" (default: just close the prompt). */
  onCancel?: () => void;
}

/**
 * Ask "Ready to go live?" before opening a room that would start a class.
 * Render `dialog` once in the component and call `ask` instead of navigating.
 */
export function useGoLiveConfirm() {
  const [request, setRequest] = useState<GoLiveRequest | null>(null);
  const [starting, setStarting] = useState(false);

  const ask = useCallback((next: GoLiveRequest) => {
    setStarting(false);
    setRequest(next);
  }, []);

  const cancel = useCallback(() => {
    if (starting) return;
    const onCancel = request?.onCancel;
    setRequest(null);
    onCancel?.();
  }, [request, starting]);

  const confirm = useCallback(() => {
    if (!request || starting) return;
    setStarting(true);
    request.onGoLive();
  }, [request, starting]);

  const dialog = (
    <GoLiveDialog
      open={request !== null}
      title={request?.title ?? ""}
      kind={request?.kind ?? "class"}
      starting={starting}
      onConfirm={confirm}
      onCancel={cancel}
    />
  );

  return { ask, dialog };
}
