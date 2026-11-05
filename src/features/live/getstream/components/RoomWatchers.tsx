"use client";

import { memo, useEffect, useRef, useState } from "react";
import { SfuModels, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Circle, WifiOff } from "lucide-react";
import { playJoin } from "../lib/sounds";

/**
 * Small components that each watch one fast-changing thing (your own voice,
 * your connection, people joining) so those updates never re-render the room.
 */

const AUTO_LOWER_AFTER_MS = 1500;

/**
 * Meet lowers your hand once you've spoken. If your hand is up and you talk
 * for a moment with your mic on, we lower it and tell you.
 */
export const AutoLowerHand = memo(function AutoLowerHand({
  raised,
  onLower,
}: {
  raised: boolean;
  onLower: () => void;
}) {
  const { useLocalParticipant, useMicrophoneState } = useCallStateHooks();
  const me = useLocalParticipant();
  const { isMute } = useMicrophoneState();
  const speaking = Boolean(raised && !isMute && me?.isSpeaking);
  const lower = useRef(onLower);
  lower.current = onLower;

  useEffect(() => {
    if (!speaking) return;
    const timer = setTimeout(() => lower.current(), AUTO_LOWER_AFTER_MS);
    return () => clearTimeout(timer);
  }, [speaking]);

  return null;
});

/** A soft chime when someone joins — small classes only, like Meet. */
export const JoinSounds = memo(function JoinSounds({ selfId, maxParticipants = 10 }: { selfId: string; maxParticipants?: number }) {
  const call = useCall();
  useEffect(() => {
    if (!call) return;
    return call.on("call.session_participant_joined", (event) => {
      if (event.participant?.user?.id === selfId) return;
      if (call.state.participantCount <= maxParticipants) playJoin();
    });
  }, [call, selfId, maxParticipants]);
  return null;
});

/** "Your connection is unstable" when your own connection stays weak for a few seconds. */
export const ConnectionBanner = memo(function ConnectionBanner() {
  const { useLocalParticipant } = useCallStateHooks();
  const me = useLocalParticipant();
  const poor = me?.connectionQuality === SfuModels.ConnectionQuality.POOR;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!poor) {
      setShow(false);
      return;
    }
    const timer = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(timer);
  }, [poor]);

  if (!show) return null;
  return (
    <div role="status" className="pointer-events-none flex justify-center px-3">
      <span className="flex items-center gap-2 rounded-full bg-amber-400/15 px-3.5 py-1.5 text-xs font-medium text-amber-200">
        <WifiOff className="h-3.5 w-3.5" /> Your connection is unstable — video may pause to keep audio clear
      </span>
    </div>
  );
});

/**
 * Like Meet, everyone is told when recording starts. The person who started
 * it already knows (they get a toast instead).
 */
export const RecordingNotice = memo(function RecordingNotice({ recording, isCreator }: { recording: boolean; isCreator: boolean }) {
  const [show, setShow] = useState(false);
  const was = useRef(recording);

  useEffect(() => {
    if (recording && !was.current && !isCreator) setShow(true);
    if (!recording) setShow(false);
    was.current = recording;
  }, [recording, isCreator]);

  // Already recording when you join.
  useEffect(() => {
    if (recording && !isCreator) setShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- first render only
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[62] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div role="alertdialog" aria-labelledby="rec-title" className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#161c2b] p-6 text-center text-white shadow-2xl">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
          <Circle className="h-6 w-6 fill-red-500 text-red-500" />
        </span>
        <h2 id="rec-title" className="text-lg font-bold">This class is being recorded</h2>
        <p className="mt-2 text-sm text-white/70">
          The host is recording. Your video, audio and anything you share may be included.
        </p>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="mt-5 w-full rounded-full bg-primary px-6 py-3 font-semibold transition active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
});
