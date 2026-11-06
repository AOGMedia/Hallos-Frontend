"use client";

import { useCallback, useRef, useState } from "react";
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

  const isOpen = useRef(false);

  // Asking again while the prompt is already up keeps the open one as it is
  // (a page reloading its data mustn't restart or flash the prompt).
  const ask = useCallback((next: GoLiveRequest) => {
    if (isOpen.current) return;
    isOpen.current = true;
    setStarting(false);
    setRequest(next);
  }, []);

  const cancel = useCallback(() => {
    if (starting) return;
    const onCancel = request?.onCancel;
    isOpen.current = false;
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
