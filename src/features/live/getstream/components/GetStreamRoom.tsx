"use client";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ArrowLeft, Gift, Heart, Loader2, Users, Volume2, WifiOff } from "lucide-react";
import {
  endGetStreamLive,
  setGetStreamRecording,
  type GetStreamCredentials,
  type GetStreamTarget,
} from "../api";
import { useClassChat } from "../hooks/useClassChat";
import { useSendReaction, type ReactionBus } from "../hooks/useReactions";
import { useRaisedHands, type RaisedHand } from "../hooks/useRaisedHands";
import { useHostHeartbeat } from "../hooks/useHostHeartbeat";
import { describeGiftEvent, giftLook, useGiftEvents, useGiftOverview, useSendGift } from "../hooks/useGifts";
import { useToasts } from "../hooks/useToasts";
import { useMobileRoom } from "../hooks/useMobileRoom";
import { friendlyError } from "../lib/errors";
import { formatMoney } from "../lib/events";
import { playGift, playHandRaised } from "../lib/sounds";
import { tapHaptic } from "../lib/haptics";
import { ClassStage } from "./ClassStage";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "./ChatPanel";
import { ReactionsOverlay } from "./ReactionsOverlay";
import { GiftOverlay } from "./GiftOverlay";
import { GiftSheet } from "./GiftSheet";
import { RaisedHandsPanel } from "./RaisedHandsPanel";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { RoomToasts } from "./RoomToasts";
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

/** Phones and tablets publish a lighter video stream: smoother on modest devices and data. */
const isTouchDevice = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

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
        if (isTouchDevice()) {
          await videoCall.camera.selectTargetResolution({ width: 640, height: 480 }).catch(() => {});
        }
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
        if (!cancelled) {
          setJoinError(friendlyError(error, "We couldn't connect you to the class. Please check your connection and try again."));
        }
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
        <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-primary px-6 py-3 font-semibold text-white">
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

/** Plays everyone else's audio. Its own component: speaking updates don't re-render the room. */
const RemoteAudio = memo(function RemoteAudio() {
  const { useRemoteParticipants } = useCallStateHooks();
  return <ParticipantsAudio participants={useRemoteParticipants()} />;
});

/** Title, LIVE / REC badges, head count and — for the host — gifts received. */
const RoomHeader = memo(function RoomHeader({
  title,
  subtitle,
  earned,
  onBack,
  onOpenParticipants,
}: {
  title: string;
  subtitle: string;
  earned: string | null;
  onBack: () => void;
  onOpenParticipants: () => void;
}) {
  const { useParticipantCount, useIsCallRecordingInProgress } = useCallStateHooks();
  const count = useParticipantCount();
  const recording = useIsCallRecordingInProgress();
  return (
    <header className="z-30 flex shrink-0 items-center gap-2.5 px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)] sm:gap-3 sm:px-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Leave class"
        className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
        <p className="truncate text-xs text-white/50">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {earned && (
          <span className="hidden items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200 min-[400px]:flex">
            <Gift className="h-3.5 w-3.5" /> {earned}
          </span>
        )}
        {recording && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> REC
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Live
        </span>
        <button
          type="button"
          onClick={onOpenParticipants}
          aria-label={`See who's here (${count})`}
          className="flex h-8 touch-manipulation items-center gap-1 rounded-full bg-white/10 px-2.5 text-xs font-medium transition hover:bg-white/15 active:scale-95"
        >
          <Users className="h-3.5 w-3.5" /> {count}
        </button>
      </div>
    </header>
  );
});

function RoomLayout({ target, credentials, title, backHref }: GetStreamRoomProps) {
  useMobileRoom();
  const router = useRouter();
  const call = useCall();
  // Only rarely-changing state up here — fast-changing state (who's speaking,
  // reactions, gift animations) lives in the components that show it.
  const { useCallCallingState, useCallEndedAt, useIsCallRecordingInProgress, useCallMembers, useIsAutoplayBlocked } =
    useCallStateHooks();
  const callingState = useCallCallingState();
  const endedAt = useCallEndedAt();
  const recording = useIsCallRecordingInProgress();
  const members = useCallMembers();
  const autoplayBlocked = useIsAutoplayBlocked();

  const isCreator = credentials.userType === "creator";
  const isHost = credentials.userType !== "participant";
  const selfId = credentials.userId;
  const selfName = credentials.userName || "You";

  const [chatOpen, setChatOpen] = useState(false);
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [handsOpen, setHandsOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [endedHere, setEndedHere] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [reactionBus] = useState<ReactionBus>(() => new EventTarget());
  const { toasts, show: toast, dismiss } = useToasts();

  // Creator and co-hosts are call members with the host role.
  const hostKey = members
    .filter((m) => m.role === HOST_CALL_ROLE)
    .map((m) => m.user_id)
    .sort()
    .join(",");
  const hostUserIds = useMemo(() => new Set(hostKey ? hostKey.split(",") : []), [hostKey]);

  const chat = useClassChat({ target, selfId, selfName, isOpen: chatOpen });
  const sendReaction = useSendReaction(reactionBus);

  const onRaised = useCallback(
    (hand: RaisedHand) => {
      if (!isHost) return;
      playHandRaised();
      toast(`${hand.name} raised their hand`, "info", { label: "View", onClick: () => setHandsOpen(true) });
    },
    [isHost, toast]
  );
  const onLoweredByHost = useCallback(() => toast("The host lowered your hand", "info"), [toast]);
  const {
    queue: handQueue,
    positions: handPositions,
    isRaised: handRaised,
    toggleHand: toggleOwnHand,
    lowerHand: lowerOneHand,
    lowerAll: lowerEveryHand,
  } = useRaisedHands({ selfId, selfName, hostUserIds, onRaised, onLoweredByHost });

  // Gifts
  const giftOverview = useGiftOverview(target);
  const { send: sendGiftRequest, sendingCode } = useSendGift(target);
  const refetchOverview = giftOverview.refetch;
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useGiftEvents((event) => {
    const look = giftLook(event.code, giftOverview.data?.gifts);
    chat.addSystemLine(`gift-${event.id}`, `${describeGiftEvent(event, selfId, look.name)} ${look.emoji}`);
    playGift();
    tapHaptic([10, 40, 10]);
    if (event.to?.id === selfId && event.from.id !== selfId) {
      toast(`${event.from.name} sent you a ${look.name} ${look.emoji} — it's in your wallet.`, "success");
    }
    if (isHost || event.to?.id === selfId) {
      // Batch a burst of gifts into one refresh (host total / own balance).
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => void refetchOverview(), 1500);
    }
  });
  useEffect(() => () => clearTimeout(refreshTimer.current), []);

  // Who the open gift sheet is for: null = the host (attendees); a participant for hosts.
  const [giftRecipient, setGiftRecipient] = useState<{ id: string; name: string } | null>(null);

  const sendGift = useCallback(
    async (code: string) => {
      const result = await sendGiftRequest(code, giftRecipient?.id);
      if (result.ok) setGiftsOpen(false);
      return result;
    },
    [sendGiftRequest, giftRecipient]
  );

  const giftParticipant = useCallback((person: { id: string; name: string }) => {
    setGiftRecipient(person);
    setPeopleOpen(false);
    setGiftsOpen(true);
  }, []);

  const received = giftOverview.data?.received;
  const earned = useMemo(() => {
    if (!isHost || !received || received.count === 0) return null;
    const parts = (["NGN", "USD"] as const).filter((c) => received.totals[c] > 0).map((c) => formatMoney(received.totals[c], c));
    return parts.join(" + ") || null;
  }, [isHost, received]);

  const classEnded = endedHere || Boolean(endedAt);
  // Live classes only — series sessions have no heartbeat, same as ZegoCloud.
  useHostHeartbeat({
    liveClassId: target.id,
    callId: credentials.callId,
    enabled: target.kind === "class" && isCreator && !hostLeft && !classEnded,
  });

  const leave = useCallback(async () => {
    await call?.leave().catch(() => {});
    if (isCreator) setHostLeft(true);
    else router.push(backHref);
  }, [call, isCreator, router, backHref]);

  const toggleRecording = useCallback(async () => {
    setRecordingBusy(true);
    try {
      await setGetStreamRecording(target, recording ? "stop" : "start");
      toast(recording ? "Recording stopped. It'll be ready in a few minutes." : "Recording started.", "success");
    } catch (error) {
      toast(friendlyError(error, "We couldn't change the recording. Please try again."), "error");
    } finally {
      setRecordingBusy(false);
    }
  }, [target, recording, toast]);

  const toggleHand = useCallback(async () => {
    const ok = await toggleOwnHand();
    if (!ok) toast("We couldn't update your hand. Check your connection and try again.", "error");
  }, [toggleOwnHand, toast]);

  const lowerHand = useCallback(
    async (userId: string) => {
      if (!(await lowerOneHand(userId))) toast("We couldn't lower that hand. Please try again.", "error");
    },
    [lowerOneHand, toast]
  );
  const lowerAll = useCallback(async () => {
    if (!(await lowerEveryHand())) toast("We couldn't lower hands. Please try again.", "error");
  }, [lowerEveryHand, toast]);

  const endForEveryone = useCallback(async () => {
    await endGetStreamLive(target);
    setEndedHere(true);
  }, [target]);

  const toggleChat = useCallback(() => setChatOpen((v) => !v), []);
  const closeChat = useCallback(() => setChatOpen(false), []);
  const openGifts = useCallback(() => {
    setGiftRecipient(null); // attendees' gift button: to the host
    setGiftsOpen(true);
  }, []);
  const openHands = useCallback(() => setHandsOpen(true), []);
  const showError = useCallback((message: string) => toast(message, "error"), [toast]);
  const showNotice = useCallback((message: string, tone: "success" | "error") => toast(message, tone), [toast]);
  const openPeople = useCallback(() => setPeopleOpen(true), []);
  const closePeople = useCallback(() => setPeopleOpen(false), []);

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

  // Attendees get a gift button (to the host); hosts gift from the People panel.
  const canGift = !isHost && giftOverview.data?.canGift !== false;
  const giftSheetFor = isHost ? giftRecipient : { id: "", name: "the host" };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#0d111b] text-white">
      <RemoteAudio />

      <RoomHeader
        title={title}
        subtitle={isCreator ? "You're hosting" : isHost ? "Co-host" : "Live class"}
        earned={earned}
        onBack={leave}
        onOpenParticipants={openPeople}
      />

      {(callingState === CallingState.RECONNECTING || callingState === CallingState.OFFLINE) && (
        <div className="mx-3 mb-1 flex items-center justify-center gap-2 rounded-full bg-amber-400/15 py-1.5 text-xs font-medium text-amber-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {callingState === CallingState.OFFLINE ? "You're offline — we'll reconnect when you're back" : "Reconnecting…"}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <ClassStage hostUserIds={hostUserIds} handPositions={handPositions} />
          <ReactionsOverlay bus={reactionBus} selfId={selfId} selfName={selfName} />
          <GiftOverlay catalog={giftOverview.data?.gifts} selfId={selfId} />

          {/* Quick ❤️ on phones (all reactions are in "More") */}
          <button
            type="button"
            aria-label="Send a heart"
            onClick={() => {
              tapHaptic(8);
              sendReaction(":heart:");
            }}
            className="absolute bottom-3 right-3 z-20 flex h-12 w-12 touch-manipulation items-center justify-center rounded-full bg-black/55 text-pink-400 shadow-lg transition active:scale-125 md:hidden"
          >
            <Heart className="h-6 w-6 fill-current" />
          </button>

          {autoplayBlocked && (
            <button
              type="button"
              onClick={() => void call?.resumeAudio()}
              className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold shadow-2xl"
            >
              <Volume2 className="h-4 w-4" /> Tap to turn on sound
            </button>
          )}
        </main>

        <ChatPanel
          open={chatOpen}
          messages={chat.messages}
          onSend={chat.send}
          onSendPhoto={chat.sendPhoto}
          onRetry={chat.retry}
          onClose={closeChat}
          onError={showError}
        />
      </div>

      <ControlBar
        isHost={isHost}
        canRecord={isCreator}
        canGift={canGift}
        chatOpen={chatOpen}
        unread={chat.unread}
        handRaised={handRaised}
        raisedCount={handQueue.length}
        recording={recording}
        recordingBusy={recordingBusy}
        onToggleChat={toggleChat}
        onReact={sendReaction}
        onToggleHand={toggleHand}
        onOpenHands={openHands}
        onOpenGifts={openGifts}
        onToggleRecording={toggleRecording}
        onLeave={leave}
        onDeviceError={showError}
      />

      {giftSheetFor && (
        <GiftSheet
          open={giftsOpen}
          onClose={() => setGiftsOpen(false)}
          overview={giftOverview.data}
          loading={giftOverview.isLoading}
          loadError={giftOverview.error ? friendlyError(giftOverview.error, "We couldn't load gifts right now.") : null}
          onRetryLoad={() => void giftOverview.refetch()}
          sendingCode={sendingCode}
          onSend={sendGift}
          recipientName={giftSheetFor.name}
        />
      )}

      {isHost && (
        <RaisedHandsPanel
          open={handsOpen}
          onClose={() => setHandsOpen(false)}
          queue={handQueue}
          onLower={lowerHand}
          onLowerAll={lowerAll}
        />
      )}

      <ParticipantsPanel
        open={peopleOpen}
        onClose={closePeople}
        hostUserIds={hostUserIds}
        handPositions={handPositions}
        canModerate={isHost}
        onNotice={showNotice}
        onGift={isHost ? giftParticipant : undefined}
      />

      <RoomToasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
