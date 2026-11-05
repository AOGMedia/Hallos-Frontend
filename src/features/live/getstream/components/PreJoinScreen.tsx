"use client";

import { useEffect, useState } from "react";
import { createSoundDetector, useCall, useCallStateHooks, VideoPreview } from "@stream-io/video-react-sdk";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { RoomAvatar } from "./RoomAvatar";
import { SpeakingBars } from "./RoomIndicators";
import { tapHaptic } from "../lib/haptics";

interface PreJoinScreenProps {
  title: string;
  name: string;
  image?: string | null;
  isHost: boolean;
  joining: boolean;
  error: string | null;
  onJoin: () => void;
}

/** Shown in the preview when the camera is off: your avatar, Meet style. */
function CameraOffPreview({ name, image }: { name: string; image?: string | null }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#1b2030]">
      <RoomAvatar name={name} image={image} className="h-24 w-24 text-3xl ring-1 ring-white/10" />
    </div>
  );
}

function DeviceSelect({
  label,
  devices,
  selected,
  onSelect,
}: {
  label: string;
  devices: MediaDeviceInfo[];
  selected?: string;
  onSelect: (id: string) => void;
}) {
  if (devices.length < 2) return null;
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/50">{label}</span>
      <select
        value={selected ?? devices[0]?.deviceId}
        onChange={(e) => onSelect(e.target.value)}
        className="h-11 w-full truncate rounded-xl border border-white/10 bg-white/5 px-3 text-base text-white focus:border-primary/60 focus:outline-none sm:text-sm"
      >
        {devices.map((d, i) => (
          <option key={d.deviceId || i} value={d.deviceId} className="bg-[#1b2234]">
            {d.label || `${label} ${i + 1}`}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Google Meet's "ready to join?" screen: see yourself, check your mic, pick
 * devices, then join. Hosts start with camera and mic on; attendees off.
 */
export function PreJoinScreen({ title, name, image, isHost, joining, error, onJoin }: PreJoinScreenProps) {
  const call = useCall();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const mic = useMicrophoneState();
  const cam = useCameraState();
  const [hearing, setHearing] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0d111b] px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-[max(env(safe-area-inset-top),16px)] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-6 md:flex-row md:gap-12">
        {/* Preview */}
        <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl bg-[#151a27] shadow-2xl ring-1 ring-white/10 md:aspect-video md:max-w-xl">
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
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium">{name}</div>
          {!mic.isMute && (
            <div className="absolute right-3 top-3 flex h-7 items-center rounded-full bg-black/60 px-2.5">
              {hearing ? <SpeakingBars className="text-primary" /> : <Mic className="h-3.5 w-3.5 text-white/70" />}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => toggle("mic")}
              aria-label={mic.optimisticIsMute ? "Turn microphone on" : "Turn microphone off"}
              className={`flex h-12 w-12 touch-manipulation items-center justify-center rounded-full transition active:scale-90 ${
                mic.optimisticIsMute ? "bg-red-500 text-white" : "bg-white/15 text-white backdrop-blur"
              }`}
            >
              {mic.optimisticIsMute ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={() => toggle("cam")}
              aria-label={cam.optimisticIsMute ? "Turn camera on" : "Turn camera off"}
              className={`flex h-12 w-12 touch-manipulation items-center justify-center rounded-full transition active:scale-90 ${
                cam.optimisticIsMute ? "bg-red-500 text-white" : "bg-white/15 text-white backdrop-blur"
              }`}
            >
              {cam.optimisticIsMute ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Join */}
        <div className="flex w-full max-w-sm flex-col items-center text-center md:items-start md:text-left">
          <p className="text-sm text-white/50">{isHost ? "Ready to start?" : "Ready to join?"}</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{title}</h1>

          <div className="mt-5 flex w-full gap-3">
            <DeviceSelect label="Microphone" devices={mic.devices} selected={mic.selectedDevice} onSelect={(id) => void call?.microphone.select(id)} />
            <DeviceSelect label="Camera" devices={cam.devices} selected={cam.selectedDevice} onSelect={(id) => void call?.camera.select(id)} />
          </div>

          {(deviceError || error) && (
            <p role="alert" className="mt-4 w-full rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error || deviceError}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              tapHaptic(12);
              onJoin();
            }}
            disabled={joining}
            className="mt-6 flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold shadow-lg shadow-primary/25 transition active:scale-[0.98] disabled:opacity-70"
          >
            {joining ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Joining…
              </>
            ) : isHost ? (
              "Start class"
            ) : (
              "Join now"
            )}
          </button>
          <p className="mt-3 text-xs text-white/40">
            {mic.optimisticIsMute && cam.optimisticIsMute
              ? "You'll join with your camera and mic off."
              : "You can change your camera and mic any time in the class."}
          </p>
        </div>
      </div>
    </div>
  );
}
