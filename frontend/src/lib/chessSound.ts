/* ─────────────────────────────────────────────────────────
   Synthesized chess sound effects using the Web Audio API.
   No audio files to host — every sound is generated on the fly.

   Usage:
     import { playMoveSound, playCaptureSound } from "@/lib/chessSound";
     playMoveSound();
     playCaptureSound();

   Call these right where you already know whether a move captured
   a piece, e.g.:
     if (move.captured) playCaptureSound();
     else playMoveSound();
   ───────────────────────────────────────────────────────── */

let audioCtx: AudioContext | null = null;

/** Lazily create (or resume) a single shared AudioContext. Browsers block
 *  audio until it's created/resumed inside a user gesture — a piece
 *  drag/tap counts, so calling this from a move handler is safe. */
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  if (!audioCtx) {
    audioCtx = new Ctor();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/** A short pitched tone with a quick attack and exponential decay —
 *  the basic building block for both the move and capture sounds. */
function tone(
  ctx: AudioContext,
  {
    freq,
    start,
    duration,
    type = "triangle",
    peak = 0.25,
    freqEnd,
  }: {
    freq: number;
    start: number;
    duration: number;
    type?: OscillatorType;
    peak?: number;
    freqEnd?: number;
  },
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** A short burst of filtered noise — gives percussive "click"/"crack"
 *  texture that a pure tone can't. */
function noiseBurst(
  ctx: AudioContext,
  {
    start,
    duration,
    peak = 0.2,
    filterFreq = 2000,
    filterType = "bandpass",
  }: {
    start: number;
    duration: number;
    peak?: number;
    filterFreq?: number;
    filterType?: BiquadFilterType;
  },
) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    // linearly decaying white noise so it doesn't cut off abruptly
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(start);
}

/** Quiet "wooden tock" — for a normal move (no capture). */
export function playMoveSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, { freq: 480, start: now, duration: 0.09, type: "triangle", peak: 0.22 });
  noiseBurst(ctx, { start: now, duration: 0.035, peak: 0.12, filterFreq: 1800 });
}

/** Punchier "impact + crack" — for a capture. Layers a low thud, a sharp
 *  noise crack, and a brief high ping so it reads as satisfying, not harsh. */
export function playCaptureSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, { freq: 200, freqEnd: 90, start: now, duration: 0.18, type: "sine", peak: 0.32 });
  noiseBurst(ctx, { start: now, duration: 0.07, peak: 0.32, filterFreq: 2600 });
  tone(ctx, { freq: 950, start: now + 0.02, duration: 0.07, type: "triangle", peak: 0.14 });
}

/** Soft two-note "denied" buzz — handy for a wrong move (puzzle mode). */
export function playWrongSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, { freq: 220, start: now, duration: 0.14, type: "sawtooth", peak: 0.15 });
  tone(ctx, { freq: 160, start: now + 0.09, duration: 0.16, type: "sawtooth", peak: 0.15 });
}

/** Bright ascending chime — handy for solving a puzzle / winning. */
export function playSuccessSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  [520, 660, 780].forEach((freq, i) => {
    tone(ctx, {
      freq,
      start: now + i * 0.09,
      duration: 0.22,
      type: "triangle",
      peak: 0.18,
    });
  });
}
