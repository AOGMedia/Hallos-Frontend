"use client";

import { useEffect, useState } from "react";
import { createSoundDetector, useCall, useCallStateHooks, VideoPreview } from "@stream-io/video-react-sdk";
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  Loader2,
  Mic,
  MicOff,
  User,
  Users,
  Video,
  VideoOff,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { GetStreamUserType } from "../api";
import { RoomAvatar } from "./RoomAvatar";
import { SpeakingBars } from "./RoomIndicators";
import { tapHaptic } from "../lib/haptics";
import { playSpeakerTest } from "../lib/sounds";

export interface ClassSchedule {
  start?: string | null;
  end?: string | null;
}

interface PreJoinScreenProps {
  title: string;
  name: string;
  image?: string | null;
  isHost: boolean;
  userType: GetStreamUserType;
  schedule?: ClassSchedule;
  joining: boolean;
  error: string | null;
  onJoin: () => void;
  onBack: () => void;
}

const ROLE_LABEL: Record<GetStreamUserType, string> = {
  creator: "You're hosting",
  cohost: "Co-host",
  participant: "Attendee",
};

/** "Saturday, Dec 6 · 2:50 PM–3:50 PM GMT+1", in the viewer's own time zone. */
function scheduleLabel(schedule?: ClassSchedule): string | null {
  if (!schedule?.start) return null;
  const start = new Date(schedule.start);
  if (Number.isNaN(start.getTime())) return null;
  const day = start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const time = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const end = schedule.end ? new Date(schedule.end) : null;
  const zone =
    new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(start).find((p) => p.type === "timeZoneName")
      ?.value ?? "";
  const range = end && !Number.isNaN(end.getTime()) ? `${time(start)}–${time(end)}` : time(start);
  return `${day} · ${range}${zone ? ` ${zone}` : ""}`;
}

/** Shown in the preview when the camera is off: your avatar, Meet style. */
function CameraOffPreview({ name, image }: { name: string; image?: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#1b2030]">
      <RoomAvatar name={name} image={image} className="h-24 w-24 text-3xl ring-1 ring-white/10" />
    </div>
  );
}

/** Dark slate fields; on phones they sit on the gradient, so they're a touch more solid. */
const fieldBox =
  "flex h-12 w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#1f2533]/80 px-4 text-[15px] text-white md:bg-white/[0.05]";

/** One settings row: label above, a rounded field with an icon (Name, Camera, Microphone, Speaker). */
function Field({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-[13px] font-medium text-white/60">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        {children}
      </div>
    </div>
  );
}

function DeviceField({
  label,
  icon,
  devices,
  selected,
  emptyText,
  onSelect,
}: {
  label: string;
  icon: LucideIcon;
  devices: MediaDeviceInfo[];
  selected?: string;
  emptyText: string;
  onSelect: (id: string) => void;
}) {
  const options = devices.filter((d) => d.deviceId);
  return (
    <Field label={label} icon={icon}>
      <select
        value={selected && options.some((d) => d.deviceId === selected) ? selected : options[0]?.deviceId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={options.length === 0}
        className={`${fieldBox} appearance-none truncate pl-11 pr-10 focus:border-primary/60 focus:outline-none disabled:text-white/40`}
      >
        {options.length === 0 ? (
          <option value="">{emptyText}</option>
        ) : (
          options.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId} className="bg-[#1b2234]">
              {d.label || `${label} ${i + 1}`}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
    </Field>
  );
}

/** Round toggle with its label underneath (Video on / Mic off / Speaker). */
function ToggleButton({
  on,
  label,
  icon: Icon,
  onPress,
}: {
  on: boolean;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={on}
      className="group flex w-[76px] touch-manipulation flex-col items-center gap-1.5"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full transition group-active:scale-90 md:h-12 md:w-12 ${
          on ? "bg-primary text-white shadow-[0_8px_20px_-8px_var(--primary)]" : "bg-white/10 text-white/80"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[12px] font-medium text-white/65">{label}</span>
    </button>
  );
}

/**
 * The "ready to join?" screen: see yourself, check your mic and speaker, pick
 * devices, then join. Hosts start with camera and mic on; attendees off.
 * Phones: a full-screen app view with the Join button pinned to the bottom.
 * Larger screens: preview and settings side by side in one card.
 */
export function PreJoinScreen({
  title,
  name,
  image,
  isHost,
  userType,
  schedule,
  joining,
  error,
  onJoin,
  onBack,
}: PreJoinScreenProps) {
  const call = useCall();
  const { useMicrophoneState, useCameraState, useSpeakerState } = useCallStateHooks();
  const mic = useMicrophoneState();
  const cam = useCameraState();
  const speaker = useSpeakerState();
  const [hearing, setHearing] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const when = scheduleLabel(schedule);

  // Hosts arrive ready to teach.
  useEffect(() => {
    if (!call || !isHost) return;
    call.camera.enable().catch(() => {});
    call.microphone.enable().catch(() => {});
  }, [call, isHost]);

  // "Is my mic working?" — bars move when it hears you.
  useEffect(() => {
    if (mic.isMute || !mic.mediaStream) {
      setHearing(false);
      return;
    }
    const stop = createSoundDetector(mic.mediaStream, ({ isSoundDetected }) => setHearing(isSoundDetected), {
      detectionFrequencyInMs: 150,
      // The stream is the real microphone we're about to publish — never stop it.
      destroyStreamOnStop: false,
    });
    return () => {
      void stop().catch(() => {});
    };
  }, [mic.isMute, mic.mediaStream]);

  const toggle = (which: "mic" | "cam") => {
    tapHaptic();
    setDeviceError(null);
    const action = which === "mic" ? call?.microphone.toggle() : call?.camera.toggle();
    action?.catch(() =>
      setDeviceError(`We couldn't turn on your ${which === "mic" ? "microphone" : "camera"}. Allow access in your browser settings and try again.`)
    );
  };

  const testSpeaker = () => {
    tapHaptic();
    void playSpeakerTest(speaker.isDeviceSelectionSupported ? speaker.selectedDevice : undefined);
  };

  const camOn = !cam.optimisticIsMute;
  const micOn = !mic.optimisticIsMute;
  // The creator starts the class; everyone else (co-hosts too) joins it.
  const verb = userType === "creator" ? "Start" : "Join";
  const message = error || deviceError;

  const joinButton = (
    <button
      type="button"
      onClick={() => {
        tapHaptic(12);
        onJoin();
      }}
      disabled={joining}
      className="group relative flex h-14 w-full touch-manipulation items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.03] text-base font-semibold text-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.8)] transition active:scale-[0.98] disabled:opacity-70 md:h-16"
    >
      {joining ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" /> {verb === "Start" ? "Starting…" : "Joining…"}
        </>
      ) : (
        <>
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
            <span className="absolute h-3 w-3 animate-ping rounded-full bg-red-500/60" />
            <span className="relative h-3 w-3 rounded-full bg-red-500" />
          </span>
          {verb} Now
        </>
      )}
    </button>
  );

  return (
    // overflow-x-clip (not hidden): keeps the phone top bar sticky.
    <div className="relative min-h-[100dvh] overflow-x-clip bg-[#3d2f63] text-white md:flex md:items-center md:justify-center md:p-8">
      {/* Plum-to-indigo backdrop, fixed so it stays put while the page scrolls
          (one static gradient — cheap on phones). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "linear-gradient(115deg, #6b3163 0%, #4b2f66 42%, #343a74 75%, #2c3a78 100%)" }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col md:rounded-[24px] md:border md:border-white/[0.06] md:bg-[#1f2533] md:p-8 md:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
        {/* Top bar (a frosted app header on phones) */}
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-white/[0.06] bg-black/25 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-xl md:static md:border-0 md:bg-transparent md:p-0 md:pb-6 md:backdrop-blur-none">
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="mt-0.5 flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/10 transition active:scale-90 md:bg-transparent md:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="line-clamp-2 text-lg font-bold leading-snug md:text-[26px]">
              {verb} Class – {title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {ROLE_LABEL[userType]}
              </span>
              {when && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" /> {when}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 px-4 pb-32 md:grid md:grid-cols-[1.1fr_1fr] md:gap-8 md:p-0">
          {/* Preview + toggles */}
          <section className="md:rounded-2xl md:bg-[#272f45] md:p-4">
            <div className="relative aspect-[4/5] max-h-[52dvh] w-full overflow-hidden rounded-3xl bg-[#151a27] shadow-2xl ring-1 ring-white/10 sm:aspect-video md:max-h-none md:rounded-2xl">
              <VideoPreview
                className="!h-full !w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
                mirror
                DisabledVideoPreview={() => <CameraOffPreview name={name} image={image} />}
                NoCameraPreview={() => <CameraOffPreview name={name} image={image} />}
                StartingCameraPreview={() => (
                  <div className="flex h-full w-full items-center justify-center bg-[#1b2030]">
                    <Loader2 className="h-7 w-7 animate-spin text-white/60" />
                  </div>
                )}
              />
              <div className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-black/60 px-3 py-1 text-xs font-medium">
                {name}
              </div>
              {micOn && (
                <div className="absolute right-3 top-3 flex h-7 items-center rounded-full bg-black/60 px-2.5">
                  {hearing ? <SpeakingBars className="text-primary" /> : <Mic className="h-3.5 w-3.5 text-white/70" />}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <ToggleButton
                on={camOn}
                label={camOn ? "Video on" : "Video off"}
                icon={camOn ? Video : VideoOff}
                onPress={() => toggle("cam")}
              />
              <ToggleButton
                on={micOn}
                label={micOn ? "Mic on" : "Mic off"}
                icon={micOn ? Mic : MicOff}
                onPress={() => toggle("mic")}
              />
              <ToggleButton on label="Speaker" icon={Volume2} onPress={testSpeaker} />
            </div>
            <p className="mt-2 text-center text-[11px] text-white/40">Tap Speaker to hear a test sound</p>
          </section>

          {/* Settings + join */}
          <section className="flex flex-col gap-4">
            <Field label="Name" icon={User}>
              <div className={`${fieldBox} pl-11 font-medium`}>
                <span className="truncate">{name}</span>
              </div>
            </Field>
            <DeviceField
              label="Camera"
              icon={Video}
              devices={cam.devices}
              selected={cam.selectedDevice}
              emptyText="No camera found"
              onSelect={(id) => void call?.camera.select(id)}
            />
            <DeviceField
              label="Microphone"
              icon={Mic}
              devices={mic.devices}
              selected={mic.selectedDevice}
              emptyText="No microphone found"
              onSelect={(id) => void call?.microphone.select(id)}
            />
            {/* Choosing an output device only works in some browsers (not iPhone/Safari). */}
            {speaker.isDeviceSelectionSupported && speaker.devices.length > 0 && (
              <DeviceField
                label="Speaker"
                icon={Volume2}
                devices={speaker.devices}
                selected={speaker.selectedDevice}
                emptyText="System default"
                onSelect={(id) => call?.speaker.select(id)}
              />
            )}

            {message && (
              <p role="alert" className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {message}
              </p>
            )}

            {/* Larger screens: the button sits under the settings. */}
            <div className="mt-auto hidden pt-2 md:block">
              {joinButton}
              <p className="mt-3 text-center text-xs text-white/40">
                {!micOn && !camOn
                  ? "You'll join with your camera and mic off."
                  : "You can change your camera and mic any time in the class."}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Phones: the button is pinned to the bottom, in thumb reach. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.08] bg-black/30 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-4 backdrop-blur-xl md:hidden">
        {joinButton}
        <p className="mt-2 text-center text-[11px] text-white/40">
          {!micOn && !camOn ? "You'll join with your camera and mic off." : "You can change these any time in the class."}
        </p>
      </div>
    </div>
  );
}
