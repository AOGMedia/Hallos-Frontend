"use client";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CallingState,
  ParticipantsAudio,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import { ArrowLeft, Loader2, Users, Volume2, WifiOff } from "lucide-react";
import {
  endGetStreamLive,
  serverMessage,
  setGetStreamRecording,
  type GetStreamCredentials,
  type GetStreamTarget,
} from "../api";
import { useClassChat } from "../hooks/useClassChat";
import { useReactions } from "../hooks/useReactions";
import { useRaisedHands } from "../hooks/useRaisedHands";
import { useHostHeartbeat } from "../hooks/useHostHeartbeat";
import { ClassStage } from "./ClassStage";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "./ChatPanel";
import { ReactionsOverlay } from "./ReactionsOverlay";
import { ClassEndedScreen, HostLeftDialog } from "./RoomDialogs";

export interface GetStreamRoomProps {
  /** The live class, or the series session, in this room. */
  target: GetStreamTarget;
  credentials: GetStreamCredentials;
  title: string;
  /** Where "back"/"leave" goes (dashboard or the community the class came from). */
  backHref: string;
}

/** Call role the backend gives hosts (creator and co-hosts) — see getStreamService. */
const HOST_CALL_ROLE = "admin";

/**
 * GetStream live class room. Loaded on demand (next/dynamic), so the
 * GetStream SDK is only downloaded by people opening a GetStream class.
 */
export default function GetStreamRoom({ target, credentials, title, backHref }: GetStreamRoomProps) {
  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [joinError, setJoinError] = useState<string | null>(null);
  const isHost = credentials.userType !== "participant";
  const { apiKey, token, callId, callType, userId, userName } = credentials;

  useEffect(() => {
    const videoClient = new StreamVideoClient({ apiKey, user: { id: userId, name: userName || undefined }, token });
    const videoCall = videoClient.call(callType, callId);
    let cancelled = false;

    (async () => {
      try {
        // Attendees arrive with camera and mic off; hosts arrive ready to teach.
        if (!isHost) {
          await videoCall.camera.disable();
          await videoCall.microphone.disable();
        }
        await videoCall.join();
        if (cancelled) return;
        if (isHost) {
          videoCall.camera.enable().catch(() => {});
          videoCall.microphone.enable().catch(() => {});
        }
      } catch (error) {
        if (!cancelled) setJoinError(serverMessage(error, "Couldn't connect to the class."));
      }
    })();

    setClient(videoClient);
    setCall(videoCall);
    return () => {
      cancelled = true;
      videoCall.leave().catch(() => {});
      videoClient.disconnectUser().catch(() => {});
      setClient(undefined);
      setCall(undefined);
    };
  }, [apiKey, token, callId, callType, userId, userName, isHost]);

  if (joinError) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#0d111b] p-6 text-center text-white">
        <WifiOff className="h-10 w-10 text-red-400" />
        <p className="max-w-sm text-white/80">{joinError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!client || !call) return <RoomLoading label="Joining the class…" />;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme className="h-full">
          <RoomLayout target={target} credentials={credentials} title={title} backHref={backHref} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

function RoomLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#0d111b] text-white">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-base text-white/80">{label}</p>
    </div>
  );
}

function RoomLayout({ target, credentials, title, backHref }: GetStreamRoomProps) {
  const router = useRouter();
  const call = useCall();
  const {
    useCallCallingState,
    useCallEndedAt,
    useIsCallRecordingInProgress,
    useParticipantCount,
    useParticipants,
    useRemoteParticipants,
    useIsAutoplayBlocked,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const endedAt = useCallEndedAt();
  const recording = useIsCallRecordingInProgress();
  const participantCount = useParticipantCount();
  const participants = useParticipants();
  const remoteParticipants = useRemoteParticipants();
  const autoplayBlocked = useIsAutoplayBlocked();

  const isCreator = credentials.userType === "creator";
  const isHost = credentials.userType !== "participant";
  const selfName = credentials.userName || "You";

  const [chatOpen, setChatOpen] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [endedHere, setEndedHere] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const chat = useClassChat({ selfId: credentials.userId, selfName, isOpen: chatOpen });
  const reactions = useReactions({ selfId: credentials.userId, selfName });
  const hands = useRaisedHands({ selfId: credentials.userId });

  const classEnded = endedHere || Boolean(endedAt);
  // Live classes only — series sessions have no heartbeat, same as ZegoCloud.
  useHostHeartbeat({
    liveClassId: target.id,
    callId: credentials.callId,
    enabled: target.kind === "class" && isCreator && !hostLeft && !classEnded,
  });

  const hostUserIds = useMemo(
    () => new Set(participants.filter((p) => p.roles?.includes(HOST_CALL_ROLE)).map((p) => p.userId)),
    [participants]
  );

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const leave = useCallback(async () => {
    await call?.leave().catch(() => {});
    if (isCreator) setHostLeft(true);
    else router.push(backHref);
  }, [call, isCreator, router, backHref]);

  const toggleRecording = useCallback(async () => {
    setRecordingBusy(true);
    try {
      await setGetStreamRecording(target, recording ? "stop" : "start");
      setNotice(recording ? "Recording stopped. It will be ready in a few minutes." : "Recording started.");
    } catch (error) {
      setNotice(serverMessage(error, "Couldn't change recording."));
    } finally {
      setRecordingBusy(false);
    }
  }, [target, recording]);

  const endForEveryone = useCallback(async () => {
    await endGetStreamLive(target);
    setEndedHere(true);
  }, [target]);

  if (classEnded) {
    // Recordings: the creator, plus co-hosts of live classes (series have none).
    const showRecordings = isCreator || (target.kind === "class" && isHost);
    return <ClassEndedScreen target={target} showRecordings={showRecordings} backHref={backHref} />;
  }

  if (hostLeft) {
    return (
      <div className="min-h-[100dvh] bg-[#0d111b]">
        <HostLeftDialog onRejoin={() => window.location.reload()} onEnd={endForEveryone} />
      </div>
    );
  }

  if (callingState === CallingState.IDLE || callingState === CallingState.JOINING) {
    return <RoomLoading label="Joining the class…" />;
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0d111b] text-white">
      <ParticipantsAudio participants={remoteParticipants} />

      {/* Top bar */}
      <header className="z-30 flex shrink-0 items-center gap-3 px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)] sm:px-4">
        <button
          type="button"
          onClick={leave}
          aria-label="Leave class"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
          <p className="text-xs text-white/50">{isCreator ? "You're hosting" : isHost ? "Co-host" : "Live class"}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {recording && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
            <Users className="h-3.5 w-3.5" /> {participantCount}
          </span>
        </div>
      </header>

      {callingState === CallingState.RECONNECTING && (
        <div className="mx-3 mb-1 flex items-center justify-center gap-2 rounded-full bg-amber-400/15 py-1.5 text-xs font-medium text-amber-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reconnecting…
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <ClassStage hostUserIds={hostUserIds} raisedHands={hands.raised} />
          <ReactionsOverlay reactions={reactions.floating} durationMs={reactions.durationMs} />

          {autoplayBlocked && (
            <button
              type="button"
              onClick={() => call?.resumeAudio()}
              className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold shadow-2xl"
            >
              <Volume2 className="h-4 w-4" /> Tap to turn on sound
            </button>
          )}

          {notice && (
            <div
              role="status"
              className="absolute bottom-4 left-1/2 z-30 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-black/75 px-4 py-2.5 text-center text-sm backdrop-blur-md"
            >
              {notice}
            </div>
          )}
        </main>

        <ChatPanel
          open={chatOpen}
          messages={chat.messages}
          onSend={chat.send}
          onRetry={chat.retry}
          onClose={() => setChatOpen(false)}
        />
      </div>

      <ControlBar
        isHost={isHost}
        canRecord={isCreator}
        chatOpen={chatOpen}
        unread={chat.unread}
        handRaised={hands.isRaised}
        raisedCount={hands.raised.size}
        recording={recording}
        recordingBusy={recordingBusy}
        onToggleChat={() => setChatOpen((v) => !v)}
        onReact={reactions.react}
        onToggleHand={hands.toggleHand}
        onToggleRecording={toggleRecording}
        onLeave={leave}
      />
    </div>
  );
}
