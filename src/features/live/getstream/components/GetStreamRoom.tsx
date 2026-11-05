"use client";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "../styles/room.css";
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
  useConnectedUser,
  type Call,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { ArrowLeft, Gift, Loader2, SmilePlus, Users, Volume2, WifiOff } from "lucide-react";
import {
  endGetStreamLive,
  setGetStreamCaptions,
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
import { useModeration } from "../hooks/useModeration";
import { useSpotlight } from "../hooks/useSpotlight";
import { useRoomShortcuts } from "../hooks/useRoomShortcuts";
import { useImmersiveChrome } from "../hooks/useImmersiveChrome";
import { friendlyError } from "../lib/errors";
import { formatMoney } from "../lib/events";
import { playGift, playHandLowered, playHandRaised } from "../lib/sounds";
import { tapHaptic } from "../lib/haptics";
import { ClassStage, type StageLayout } from "./ClassStage";
import { ControlBar } from "./ControlBar";
import { ChatPanel } from "./ChatPanel";
import { ReactionsOverlay } from "./ReactionsOverlay";
import { ReactionBar } from "./ReactionBar";
import { GiftOverlay } from "./GiftOverlay";
import { GiftSheet } from "./GiftSheet";
import { ParticipantsPanel } from "./ParticipantsPanel";
import { SettingsSheet } from "./SettingsSheet";
import { EffectsHost, type BlurLevel, type EffectsControls } from "./EffectsHost";
import { PreJoinScreen } from "./PreJoinScreen";
import { RoomToasts } from "./RoomToasts";
import { TileActionsContext, type TileActionsValue } from "./TileActions";
import { CaptionsOverlay, ChatPreview, EmptyRoomCard, RaisedHandsChip } from "./RoomOverlays";
import { AutoLowerHand, ConnectionBanner, JoinSounds, RecordingNotice } from "./RoomWatchers";
import { ClassEndedScreen, HostLeftDialog, LeaveChoiceDialog } from "./RoomDialogs";
import { BrandGlide } from "./BrandGlide";

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

type Phase = "prejoin" | "joining" | "joined";

/**
 * GetStream live class room. Loaded on demand (next/dynamic), so the
 * GetStream SDK is only downloaded by people opening a GetStream class.
 * Starts with a Meet-style pre-join screen; joins when you're ready.
 */
export default function GetStreamRoom({ target, credentials, title, backHref }: GetStreamRoomProps) {
  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [phase, setPhase] = useState<Phase>("prejoin");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const isHost = credentials.userType !== "participant";
  const { apiKey, token, callId, callType, userId, userName } = credentials;

  useEffect(() => {
    const videoClient = new StreamVideoClient({ apiKey, user: { id: userId, name: userName || undefined }, token });
    const videoCall = videoClient.call(callType, callId);

    (async () => {
      try {
        if (isTouchDevice()) {
          await videoCall.camera.selectTargetResolution({ width: 640, height: 480 }).catch(() => {});
        }
        // Attendees arrive with camera and mic off (hosts are switched on by the pre-join screen).
        if (!isHost) {
          await videoCall.camera.disable().catch(() => {});
          await videoCall.microphone.disable().catch(() => {});
        }
      } catch (error) {
        setFatal(friendlyError(error, "We couldn't get the class ready. Please check your connection and try again."));
      }
    })();

    setClient(videoClient);
    setCall(videoCall);
    return () => {
      videoCall.leave().catch(() => {});
      videoClient.disconnectUser().catch(() => {});
      setClient(undefined);
      setCall(undefined);
    };
  }, [apiKey, token, callId, callType, userId, userName, isHost]);

  const join = useCallback(async () => {
    if (!call) return;
    setJoinError(null);
    setPhase("joining");
    try {
      await call.join();
      setPhase("joined");
    } catch (error) {
      setJoinError(friendlyError(error, "We couldn't connect you to the class. Please check your connection and try again."));
      setPhase("prejoin");
    }
  }, [call]);

  if (fatal) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#0d111b] p-6 text-center text-white">
        <WifiOff className="h-10 w-10 text-red-400" />
        <p className="max-w-sm text-white/80">{fatal}</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-primary px-6 py-3 font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  if (!client || !call) return <RoomLoading label="Getting the class ready…" />;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme className="hallos-room h-full">
          {phase === "joined" ? (
            <RoomLayout target={target} credentials={credentials} title={title} backHref={backHref} />
          ) : (
            <PreJoin title={title} name={userName || "You"} isHost={isHost} joining={phase === "joining"} error={joinError} onJoin={join} />
          )}
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

/** Pre-join with your own profile picture (from your GetStream user). */
function PreJoin(props: Omit<React.ComponentProps<typeof PreJoinScreen>, "image">) {
  const me = useConnectedUser();
  return <PreJoinScreen {...props} image={me?.image ?? null} />;
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
  glidePaused,
}: {
  title: string;
  subtitle: string;
  earned: string | null;
  onBack: () => void;
  onOpenParticipants: () => void;
  glidePaused: boolean;
}) {
  const { useParticipantCount, useIsCallRecordingInProgress } = useCallStateHooks();
  const count = useParticipantCount();
  const recording = useIsCallRecordingInProgress();
  return (
    <div className="relative isolate flex items-center gap-2.5 px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)] sm:gap-3 sm:px-4">
      <BrandGlide paused={glidePaused} />
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
        <p className="truncate text-xs text-white/60">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {earned && (
          <span className="hidden items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-200 min-[400px]:flex">
            <Gift className="h-3.5 w-3.5" /> {earned}
          </span>
        )}
        {recording && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-200">
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
    </div>
  );
});

function RoomLayout({ target, credentials, title, backHref }: GetStreamRoomProps) {
  useMobileRoom();
  const router = useRouter();
  const call = useCall();
  const me = useConnectedUser();
  // Only rarely-changing state up here — fast-changing state (who's speaking,
  // reactions, gift animations) lives in the components that show it.
  const {
    useCallCallingState,
    useCallEndedAt,
    useIsCallRecordingInProgress,
    useCallMembers,
    useIsAutoplayBlocked,
    useHasOngoingScreenShare,
    useIsCallCaptioningInProgress,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const endedAt = useCallEndedAt();
  const recording = useIsCallRecordingInProgress();
  const members = useCallMembers();
  const autoplayBlocked = useIsAutoplayBlocked();
  const presenting = useHasOngoingScreenShare();
  const captioning = useIsCallCaptioningInProgress();

  const isCreator = credentials.userType === "creator";
  const isHost = credentials.userType !== "participant";
  const selfId = credentials.userId;
  const selfName = credentials.userName || "You";

  const [chatOpen, setChatOpen] = useState(false);
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [leaveChoice, setLeaveChoice] = useState(false);
  const [hostLeft, setHostLeft] = useState(false);
  const [endedHere, setEndedHere] = useState(false);
  // Set before "end for everyone" is sent, so no heartbeat can reopen the class.
  const [ending, setEnding] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  const [layout, setLayout] = useState<StageLayout>("auto");
  const [effectsRequested, setEffectsRequested] = useState(false);
  const [effects, setEffects] = useState<EffectsControls | null>(null);
  const [blur, setBlur] = useState<BlurLevel | null>(null);
  const [showCaptions, setShowCaptions] = useState(true);
  const [captionsBusy, setCaptionsBusy] = useState(false);
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
  const moderation = useModeration({ selfId, hostUserIds, onNotice: toast });
  const { spotlightUserId, spotlight } = useSpotlight({ isHost, hostUserIds });

  // ---- Raised hands (Google Meet style) -----------------------------------
  const onRaised = useCallback(
    (hand: RaisedHand) => {
      playHandRaised();
      if (isHost) toast(`${hand.name} raised their hand`, "info", { label: "View", onClick: () => setPeopleOpen(true) });
    },
    [isHost, toast]
  );
  const onLoweredByHost = useCallback(() => {
    playHandLowered();
    toast("The host lowered your hand", "info");
  }, [toast]);
  const {
    queue: handQueue,
    positions: handPositions,
    isRaised: handRaised,
    toggleHand: toggleOwnHand,
    lowerOwnHand,
    lowerHand: lowerOneHand,
    lowerAll: lowerEveryHand,
  } = useRaisedHands({ selfId, selfName, selfImage: me?.image ?? null, hostUserIds, onRaised, onLoweredByHost });

  const toggleHand = useCallback(async () => {
    const raising = !handRaised;
    const ok = await toggleOwnHand();
    if (!ok) {
      toast("We couldn't update your hand. Check your connection and try again.", "error");
      return;
    }
    if (raising) playHandRaised();
    else playHandLowered();
  }, [handRaised, toggleOwnHand, toast]);

  const autoLowerHand = useCallback(async () => {
    if (await lowerOwnHand()) {
      playHandLowered();
      toast("Your hand was lowered because you spoke", "info");
    }
  }, [lowerOwnHand, toast]);

  const lowerHand = useCallback(
    async (userId: string) => {
      if (!(await lowerOneHand(userId))) toast("We couldn't lower that hand. Please try again.", "error");
    },
    [lowerOneHand, toast]
  );
  const lowerAll = useCallback(async () => {
    if (!(await lowerEveryHand())) toast("We couldn't lower hands. Please try again.", "error");
  }, [lowerEveryHand, toast]);

  // ---- Gifts ----------------------------------------------------------------
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

  // ---- Lifecycle --------------------------------------------------------------
  const classEnded = endedHere || Boolean(endedAt);
  // Live classes only — series sessions have no heartbeat, same as ZegoCloud.
  useHostHeartbeat({
    liveClassId: target.id,
    callId: credentials.callId,
    enabled: target.kind === "class" && isCreator && !hostLeft && !classEnded && !ending,
  });

  const leaveNow = useCallback(async () => {
    setLeaveChoice(false);
    await call?.leave().catch(() => {});
    if (isCreator) setHostLeft(true);
    else router.push(backHref);
  }, [call, isCreator, router, backHref]);

  // Like Meet, the host is asked first: just leave, or end for everyone.
  const leave = useCallback(() => {
    if (isCreator) setLeaveChoice(true);
    else void leaveNow();
  }, [isCreator, leaveNow]);

  const endForEveryone = useCallback(async () => {
    setEnding(true);
    try {
      await endGetStreamLive(target);
    } catch (error) {
      setEnding(false);
      throw error;
    }
    setLeaveChoice(false);
    setEndedHere(true);
  }, [target]);

  const toggleRecording = useCallback(async () => {
    setRecordingBusy(true);
    try {
      await setGetStreamRecording(target, recording ? "stop" : "start");
      toast(recording ? "Recording stopped. It'll be ready in a few minutes." : "Recording started — everyone has been told.", "success");
    } catch (error) {
      toast(friendlyError(error, "We couldn't change the recording. Please try again."), "error");
    } finally {
      setRecordingBusy(false);
    }
  }, [target, recording, toast]);

  const toggleCaptions = useCallback(async () => {
    setCaptionsBusy(true);
    try {
      await setGetStreamCaptions(target, captioning ? "stop" : "start");
      if (!captioning) setShowCaptions(true);
      toast(captioning ? "Captions turned off" : "Captions are on for everyone", "success");
    } catch (error) {
      toast(friendlyError(error, "We couldn't change captions. Please try again."), "error");
    } finally {
      setCaptionsBusy(false);
    }
  }, [target, captioning, toast]);

  // ---- Background effects (loaded only on request) -------------------------
  const chooseBlur = useCallback(
    (level: BlurLevel | null) => {
      setBlur(level);
      if (!effects) return;
      if (level) effects.applyBlur(level);
      else effects.disable();
    },
    [effects]
  );
  // Apply the chosen blur once the effects engine is ready.
  useEffect(() => {
    if (effects && !effects.isLoading && blur) effects.applyBlur(blur);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when readiness changes
  }, [effects?.isLoading]);

  // ---- Tiles: pin / spotlight / mute / remove ---------------------------------
  const tileActions = useMemo<TileActionsValue>(
    () => ({
      canModerate: isHost,
      spotlightUserId,
      onPin: (p: StreamVideoParticipant) => {
        if (!call) return;
        if (p.pin) call.unpin(p.sessionId);
        else call.pin(p.sessionId);
      },
      onSpotlight: (p: StreamVideoParticipant) => {
        void spotlight(spotlightUserId === p.userId ? null : p.userId).then((ok) => {
          if (!ok) toast("We couldn't update the spotlight. Please try again.", "error");
        });
      },
      onMute: (p: StreamVideoParticipant) => void moderation.muteOne(p),
      onRemove: (p: StreamVideoParticipant) => {
        if (window.confirm(`Remove ${p.name || "this person"} from the class?`)) void moderation.remove(p);
      },
    }),
    [call, isHost, spotlightUserId, spotlight, moderation, toast]
  );

  // ---- Panels & chrome ---------------------------------------------------------
  const toggleChat = useCallback(() => setChatOpen((v) => !v), []);
  const closeChat = useCallback(() => setChatOpen(false), []);
  const openChat = useCallback(() => setChatOpen(true), []);
  const openGifts = useCallback(() => {
    setGiftRecipient(null); // attendees' gift button: to the host
    setGiftsOpen(true);
  }, []);
  const openPeople = useCallback(() => setPeopleOpen(true), []);
  const closePeople = useCallback(() => setPeopleOpen(false), []);
  const openSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);
  const toggleReactions = useCallback(() => setReactionsOpen((v) => !v), []);
  const closeReactions = useCallback(() => setReactionsOpen(false), []);
  const showError = useCallback((message: string) => toast(message, "error"), [toast]);
  const requestEffects = useCallback(() => setEffectsRequested(true), []);

  const anyPanelOpen = chatOpen || giftsOpen || peopleOpen || settingsOpen || reactionsOpen || leaveChoice;
  const chrome = useImmersiveChrome({ autoHide: presenting, blocked: anyPanelOpen });

  useRoomShortcuts({
    toggleMic: () => void call?.microphone.toggle().catch(() => showError("We couldn't turn on your microphone.")),
    toggleCamera: () => void call?.camera.toggle().catch(() => showError("We couldn't turn on your camera.")),
    toggleHand: () => {
      if (!isHost) void toggleHand();
    },
  });

  const inviteUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return target.kind === "class" ? `${window.location.origin}/live/join/${target.id}` : window.location.href;
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

  // Attendees get a gift button (to the host); hosts gift from the People panel.
  const canGift = !isHost && giftOverview.data?.canGift !== false;
  const giftSheetFor = isHost ? giftRecipient : { id: "", name: "the host" };
  const hide = chrome.hidden;

  return (
    <TileActionsContext.Provider value={tileActions}>
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#0d111b] text-white">
        <RemoteAudio />
        <JoinSounds selfId={selfId} />
        {!isHost && <AutoLowerHand raised={handRaised} onLower={autoLowerHand} />}

        {/* Header: in the flow on desktop; floating over the video on phones (Meet app). */}
        <header
          className={`hallos-chrome z-30 shrink-0 max-md:absolute max-md:inset-x-0 max-md:top-0 max-md:bg-gradient-to-b max-md:from-black/80 max-md:via-black/45 max-md:to-transparent max-md:pb-6 ${
            hide ? "max-md:pointer-events-none max-md:-translate-y-full max-md:opacity-0" : ""
          }`}
          onClick={chrome.poke}
        >
          <RoomHeader
            title={title}
            subtitle={isCreator ? "You're hosting" : isHost ? "Co-host" : "Live class"}
            earned={earned}
            onBack={leave}
            onOpenParticipants={openPeople}
            glidePaused={hide}
          />
          {(callingState === CallingState.RECONNECTING || callingState === CallingState.OFFLINE) && (
            <div className="mx-3 mb-1 flex items-center justify-center gap-2 rounded-full bg-amber-400/15 py-1.5 text-xs font-medium text-amber-200">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {callingState === CallingState.OFFLINE ? "You're offline — we'll reconnect when you're back" : "Reconnecting…"}
            </div>
          )}
          <ConnectionBanner />
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="relative min-w-0 flex-1">
            <ClassStage
              hostUserIds={hostUserIds}
              handPositions={handPositions}
              layout={layout}
              spotlightUserId={spotlightUserId}
              onTap={chrome.toggle}
            />
            <ReactionsOverlay bus={reactionBus} selfId={selfId} />
            <GiftOverlay catalog={giftOverview.data?.gifts} selfId={selfId} />

            {/* Centre: "only you here" */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
              <EmptyRoomCard
                inviteUrl={inviteUrl}
                onCopied={(ok) => toast(ok ? "Class link copied" : "Couldn't copy the link", ok ? "success" : "error")}
              />
            </div>

            {/* Bottom: captions, raised hands, chat previews, quick reactions */}
            <div
              className={`pointer-events-none absolute inset-x-0 z-20 flex flex-col gap-2 px-3 transition-[bottom] duration-200 ${
                hide ? "bottom-[max(env(safe-area-inset-bottom),12px)]" : "bottom-3 max-md:bottom-[calc(max(env(safe-area-inset-bottom),10px)+4.5rem)]"
              }`}
            >
              <CaptionsOverlay visible={showCaptions} />
              <div className="flex items-end justify-between gap-2">
                <div className="flex min-w-0 flex-col items-start gap-2">
                  <ChatPreview message={chat.messages[chat.messages.length - 1]} chatOpen={chatOpen} onOpen={openChat} />
                  <RaisedHandsChip queue={handQueue} onOpen={openPeople} />
                </div>
                {/* Phones: quick access to reactions (the bar opens above the controls) */}
                <button
                  type="button"
                  aria-label="Send a reaction"
                  onClick={(e) => {
                    e.stopPropagation();
                    tapHaptic(8);
                    toggleReactions();
                  }}
                  className="pointer-events-auto flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-full bg-black/55 text-white shadow-lg transition active:scale-110 md:hidden"
                >
                  <SmilePlus className="h-6 w-6" />
                </button>
              </div>
              <ReactionBar open={reactionsOpen} onReact={sendReaction} onClose={closeReactions} />
            </div>

            {autoplayBlocked && (
              <button
                type="button"
                onClick={() => void call?.resumeAudio()}
                className="absolute left-1/2 top-20 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold shadow-2xl md:top-4"
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

        {/* Controls: in the flow on desktop; floating over the video on phones. */}
        <div
          className={`hallos-chrome z-30 shrink-0 max-md:absolute max-md:inset-x-0 max-md:bottom-0 ${
            hide ? "max-md:pointer-events-none max-md:translate-y-full max-md:opacity-0" : ""
          }`}
          onClick={chrome.poke}
        >
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
            reactionsOpen={reactionsOpen}
            onToggleChat={toggleChat}
            onToggleReactions={toggleReactions}
            onToggleHand={toggleHand}
            onOpenHands={openPeople}
            onOpenGifts={openGifts}
            onOpenSettings={openSettings}
            onToggleRecording={toggleRecording}
            onLeave={leave}
            onDeviceError={showError}
          />
        </div>

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

        <ParticipantsPanel
          open={peopleOpen}
          onClose={closePeople}
          hostUserIds={hostUserIds}
          handQueue={handQueue}
          handPositions={handPositions}
          canModerate={isHost}
          onMute={moderation.muteOne}
          onMuteAll={moderation.muteAll}
          onRemove={moderation.remove}
          onLowerHand={lowerHand}
          onLowerAll={lowerAll}
          onGift={isHost ? giftParticipant : undefined}
        />

        <SettingsSheet
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          layout={layout}
          onLayout={setLayout}
          effects={effects}
          onRequestEffects={requestEffects}
          blur={blur}
          onBlur={chooseBlur}
          canControlCaptions={isHost}
          captionsBusy={captionsBusy}
          onToggleCaptions={() => void toggleCaptions()}
          showCaptions={showCaptions}
          onShowCaptions={setShowCaptions}
        />
        {effectsRequested && <EffectsHost onChange={setEffects} />}

        <RecordingNotice recording={recording} isCreator={isCreator} />
        {leaveChoice && <LeaveChoiceDialog onLeave={() => void leaveNow()} onEnd={endForEveryone} onCancel={() => setLeaveChoice(false)} />}

        <RoomToasts toasts={toasts} onDismiss={dismiss} />
      </div>
    </TileActionsContext.Provider>
  );
}
