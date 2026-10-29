/**
 * Small synthesized cues (no audio files to load). Played with Web Audio, so
 * they only work after the user has interacted with the page — which they
 * always have by the time they're in a class.
 */

let ctx: AudioContext | null = null;

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

function tone(freq: number, startIn: number, duration: number, volume = 0.08, type: OscillatorType = "sine") {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t = ac.currentTime + startIn;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** Two soft rising notes — someone raised their hand (Meet-style). */
export function playHandRaised() {
  tone(660, 0, 0.18);
  tone(880, 0.12, 0.26);
}

/** A bright three-note sparkle — a gift arrived. */
export function playGift() {
  tone(784, 0, 0.18, 0.07, "triangle");
  tone(988, 0.09, 0.2, 0.07, "triangle");
  tone(1319, 0.18, 0.35, 0.06, "triangle");
}
