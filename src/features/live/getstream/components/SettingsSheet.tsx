"use client";

import { memo, useState, type ReactNode } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Captions, Check, Keyboard, LayoutGrid, Loader2, Mic, Settings, Sparkles, Speaker, Video } from "lucide-react";
import type { StageLayout } from "./ClassStage";
import type { BlurLevel, EffectsControls } from "./EffectsHost";
import { Sheet } from "./Sheet";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  layout: StageLayout;
  onLayout: (layout: StageLayout) => void;
  /** Background effects — null until requested (then the model loads). */
  effects: EffectsControls | null;
  onRequestEffects: () => void;
  blur: BlurLevel | null;
  onBlur: (level: BlurLevel | null) => void;
  /** Captions: hosts switch them on for everyone; anyone can hide them locally. */
  canControlCaptions: boolean;
  captionsBusy: boolean;
  onToggleCaptions: () => void;
  showCaptions: boolean;
  onShowCaptions: (show: boolean) => void;
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/50">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Choice({ selected, onClick, children, disabled }: { selected: boolean; onClick: () => void; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition disabled:opacity-50 ${
        selected ? "bg-primary/20 text-white ring-1 ring-primary/60" : "bg-white/5 text-white/85 hover:bg-white/10"
      }`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
    </button>
  );
}

function DeviceList({
  devices,
  selected,
  onSelect,
  empty,
}: {
  devices: MediaDeviceInfo[];
  selected?: string;
  onSelect: (id: string) => void;
  empty: string;
}) {
  if (devices.length === 0) return <p className="px-1 text-sm text-white/50">{empty}</p>;
  return (
    <div className="space-y-1.5">
      {devices.map((d, i) => (
        <Choice key={d.deviceId || i} selected={d.deviceId === selected || (!selected && i === 0)} onClick={() => onSelect(d.deviceId)}>
          {d.label || `Device ${i + 1}`}
        </Choice>
      ))}
    </div>
  );
}

/**
 * Room settings: microphone / camera / speaker, background blur, layout and
 * captions. Device lists come from the browser via the SDK.
 */
export const SettingsSheet = memo(function SettingsSheet(props: SettingsSheetProps) {
  const call = useCall();
  const { useMicrophoneState, useCameraState, useSpeakerState, useIsCallCaptioningInProgress } = useCallStateHooks();
  const mic = useMicrophoneState();
  const cam = useCameraState();
  const speaker = useSpeakerState();
  const captioning = useIsCallCaptioningInProgress();
  const [error, setError] = useState<string | null>(null);

  const select = (fn?: Promise<void>) => {
    setError(null);
    fn?.catch(() => setError("We couldn't switch to that device. It may be in use by another app."));
  };

  const { effects } = props;
  const isDesktop = typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  return (
    <Sheet open={props.open} onClose={props.onClose} title="Settings" icon={<Settings className="h-4 w-4 text-primary" />} mobileHeight="max-h-[85dvh]">
      <div className="px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        {error && <p className="mb-3 rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>}

        <Section icon={<Mic className="h-3.5 w-3.5" />} title="Microphone">
          <DeviceList devices={mic.devices} selected={mic.selectedDevice} onSelect={(id) => select(call?.microphone.select(id))} empty="No microphone found." />
        </Section>

        {speaker.isDeviceSelectionSupported && speaker.devices.length > 0 && (
          <Section icon={<Speaker className="h-3.5 w-3.5" />} title="Speaker">
            <DeviceList devices={speaker.devices} selected={speaker.selectedDevice} onSelect={(id) => call?.speaker.select(id)} empty="Default speaker" />
          </Section>
        )}

        <Section icon={<Video className="h-3.5 w-3.5" />} title="Camera">
          <DeviceList devices={cam.devices} selected={cam.selectedDevice} onSelect={(id) => select(call?.camera.select(id))} empty="No camera found." />
        </Section>

        <Section icon={<Sparkles className="h-3.5 w-3.5" />} title="Background">
          {!effects ? (
            <Choice selected={false} onClick={props.onRequestEffects}>
              Set up background blur
            </Choice>
          ) : !effects.isSupported ? (
            <p className="px-1 text-sm text-white/50">Background blur isn&apos;t supported on this device.</p>
          ) : (
            <div className="space-y-1.5">
              {effects.isLoading && (
                <p className="flex items-center gap-2 px-1 pb-1 text-xs text-white/60">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Getting background effects ready…
                </p>
              )}
              <Choice selected={props.blur === null} onClick={() => props.onBlur(null)}>
                No effect
              </Choice>
              <Choice selected={props.blur === "low"} onClick={() => props.onBlur("low")}>
                Slight blur
              </Choice>
              <Choice selected={props.blur === "high"} onClick={() => props.onBlur("high")}>
                Strong blur
              </Choice>
              {effects.degraded && (
                <p className="px-1 pt-1 text-xs text-amber-300">This device is struggling with the effect — turn it off for smoother video.</p>
              )}
            </div>
          )}
        </Section>

        <Section icon={<LayoutGrid className="h-3.5 w-3.5" />} title="Layout">
          <div className="space-y-1.5">
            <Choice selected={props.layout === "auto"} onClick={() => props.onLayout("auto")}>
              Auto — the speaker large, others alongside
            </Choice>
            <Choice selected={props.layout === "tiled"} onClick={() => props.onLayout("tiled")}>
              Tiled — everyone the same size
            </Choice>
            <Choice selected={props.layout === "spotlight"} onClick={() => props.onLayout("spotlight")}>
              Spotlight — one person full screen
            </Choice>
          </div>
        </Section>

        <Section icon={<Captions className="h-3.5 w-3.5" />} title="Captions">
          <div className="space-y-1.5">
            {props.canControlCaptions && (
              <Choice selected={captioning} disabled={props.captionsBusy} onClick={props.onToggleCaptions}>
                {props.captionsBusy ? "Updating…" : captioning ? "Captions are on for everyone — turn off" : "Turn on captions for everyone"}
              </Choice>
            )}
            {captioning ? (
              <Choice selected={props.showCaptions} onClick={() => props.onShowCaptions(!props.showCaptions)}>
                Show captions on my screen
              </Choice>
            ) : (
              !props.canControlCaptions && <p className="px-1 text-sm text-white/50">The host hasn&apos;t turned on captions.</p>
            )}
          </div>
        </Section>

        {isDesktop && (
          <Section icon={<Keyboard className="h-3.5 w-3.5" />} title="Keyboard shortcuts">
            <ul className="space-y-1 rounded-2xl bg-white/5 p-3 text-sm text-white/75">
              <li className="flex justify-between"><span>Microphone</span><kbd className="text-white/50">Ctrl + D</kbd></li>
              <li className="flex justify-between"><span>Camera</span><kbd className="text-white/50">Ctrl + E</kbd></li>
              <li className="flex justify-between"><span>Raise / lower hand</span><kbd className="text-white/50">Ctrl + Alt + H</kbd></li>
            </ul>
          </Section>
        )}
      </div>
    </Sheet>
  );
});
