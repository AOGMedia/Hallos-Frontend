/**
 * Small synthesized cues (no audio files to load), in the spirit of Google
 * Meet's gentle notification sounds — our own tones, not Google's assets.
 * Played with Web Audio, which works once the user has interacted with the
 * page (they always have by the time they're in a class).
 */

let ctx: AudioContext | null = null;
const lastPlayed = new Map<string, number>();

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = ctx ?? new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** At most one cue of each kind per `gapMs` — a room full of people never turns into noise. */
function throttled(kind: string, gapMs: number) {
  const now = Date.now();
  if (now - (lastPlayed.get(kind) ?? 0) < gapMs) return true;
  lastPlayed.set(kind, now);
  return false;
}

function tone(freq: number, startIn: number, duration: number, volume = 0.08, type: OscillatorType = "sine", glideTo?: number) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t = ac.currentTime + startIn;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration * 0.6);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** A hand went up: a soft, rounded two-note rise. */
export function playHandRaised() {
  if (throttled("hand-up", 1500)) return;
  tone(587, 0, 0.16, 0.07, "sine", 622);
  tone(880, 0.11, 0.32, 0.07, "sine");
}

/** Your hand was lowered (by you, the host, or after you spoke): one soft falling note. */
export function playHandLowered() {
  if (throttled("hand-down", 800)) return;
  tone(740, 0, 0.26, 0.05, "sine", 494);
}

/** A gift arrived: a bright three-note sparkle. */
export function playGift() {
  if (throttled("gift", 600)) return;
  tone(784, 0, 0.18, 0.07, "triangle");
  tone(988, 0.09, 0.2, 0.07, "triangle");
  tone(1319, 0.18, 0.35, 0.06, "triangle");
}

/**
 * "Test speaker" before joining: a clear, friendly three-note chime, played on
 * the chosen speaker where the browser allows picking one (Chrome/Edge).
 */
export async function playSpeakerTest(deviceId?: string) {
  if (throttled("speaker-test", 900)) return;
  const ac = audio() as (AudioContext & { setSinkId?: (id: string) => Promise<void> }) | null;
  if (!ac) return;
  if (deviceId !== undefined && ac.setSinkId) {
    await ac.setSinkId(deviceId === "default" ? "" : deviceId).catch(() => {});
  }
  tone(523, 0, 0.22, 0.09);
  tone(659, 0.15, 0.22, 0.09);
  tone(784, 0.3, 0.45, 0.09);
}

/** Someone joined (small classes only — the caller decides). */
export function playJoin() {
  if (throttled("join", 2500)) return;
  tone(660, 0, 0.14, 0.045);
  tone(990, 0.08, 0.22, 0.04);
}
