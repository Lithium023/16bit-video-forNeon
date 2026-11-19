import { CLIP_DURATION } from './srtParser';
import { SCENE_CUTS } from './timeline';
import type { TransitionType } from './types';

export type SfxKind =
  | 'crt-boot'
  | 'swoosh'
  | 'zoom-whoosh'
  | 'iris-chime'
  | 'tape-rewind'
  | 'winter-gust'
  | 'ember-swell'
  | 'horizon-bloom'
  | 'pixel-shimmer'
  | 'blip-note'
  | 'crystal-clink'
  | 'slash-buzz'
  | 'tick'
  | 'power-surge'
  | 'finale-chord';

export interface SfxCue {
  id: string;
  time: number; // seconds in [0, CLIP_DURATION]
  kind: SfxKind;
  freq?: number; // optional base frequency (Hz) for melodic blips/chimes
  gain?: number; // relative gain multiplier (0.1..1.2)
}

function transitionToSfx(type: TransitionType): { kind: SfxKind; gain: number } {
  switch (type) {
    case 'aperture-open':
      return { kind: 'crt-boot', gain: 0.72 };
    case 'whip-blinds':
      return { kind: 'zoom-whoosh', gain: 0.42 };
    case 'iris-flash':
      return { kind: 'iris-chime', gain: 0.48 };
    case 'razor-wipe':
      return { kind: 'swoosh', gain: 0.42 };
    case 'invert-strobe':
      return { kind: 'tape-rewind', gain: 0.56 };
    case 'gravity-shatter':
      return { kind: 'winter-gust', gain: 0.55 };
    case 'ember-curtain':
      return { kind: 'ember-swell', gain: 0.5 };
    case 'horizon-burst':
      return { kind: 'horizon-bloom', gain: 0.58 };
    case 'camera-pullback':
    default:
      return { kind: 'pixel-shimmer', gain: 0.34 };
  }
}

/**
 * Hand-crafted animation & story beat SFX cues synced across the entire 314.5s film,
 * including exact musical synchronization for Scenes 50, 51, 52, 53, 54, and 55.
 */
const SIGNATURE_BEAT_CUES: SfxCue[] = [
  // Prologue & Title highlights
  { id: 'beat-title-arp', time: 8.42, kind: 'iris-chime', freq: 523.25, gain: 0.65 },
  { id: 'beat-rocket-lift', time: 20.85, kind: 'power-surge', freq: 261.63, gain: 0.52 },
  { id: 'beat-turing-spark', time: 52.1, kind: 'blip-note', freq: 659.25, gain: 0.48 },
  { id: 'beat-dartmouth-ai', time: 72.15, kind: 'iris-chime', freq: 587.33, gain: 0.62 },
  // Winter & Hardware highlights
  { id: 'beat-cold-water', time: 101.4, kind: 'winter-gust', gain: 0.6 },
  { id: 'beat-overload', time: 119.8, kind: 'slash-buzz', freq: 180, gain: 0.44 },
  { id: 'beat-deepblue-win', time: 196.2, kind: 'iris-chime', freq: 659.25, gain: 0.58 },
  { id: 'beat-gpu-surge', time: 223.8, kind: 'power-surge', freq: 330, gain: 0.52 },
  { id: 'beat-alexnet-lock', time: 237.2, kind: 'blip-note', freq: 783.99, gain: 0.5 },
  { id: 'beat-alphago-stone', time: 247.1, kind: 'crystal-clink', freq: 880, gain: 0.56 },
  // Scene 49: Transformer -> ChatGPT boot
  { id: 'beat-s49-chatgpt', time: 272.75, kind: 'power-surge', freq: 440, gain: 0.48 },
  // Scene 50 (start 276.533s): 4 Modality Cards (TEXT / IMAGE / VIDEO / AUDIO) ascending pentatonic
  { id: 'beat-s50-text', time: 276.533 + 0.48, kind: 'blip-note', freq: 523.25, gain: 0.48 },
  { id: 'beat-s50-image', time: 276.533 + 1.08, kind: 'blip-note', freq: 587.33, gain: 0.48 },
  { id: 'beat-s50-video', time: 276.533 + 1.68, kind: 'blip-note', freq: 659.25, gain: 0.5 },
  { id: 'beat-s50-audio', time: 276.533 + 2.28, kind: 'blip-note', freq: 783.99, gain: 0.54 },
  // Scene 51 (start 281.200s): Red quiz slash + 4 humanlike capability blooms
  { id: 'beat-s51-slash', time: 281.2 + 0.96, kind: 'slash-buzz', freq: 210, gain: 0.48 },
  { id: 'beat-s51-lang', time: 281.2 + 2.52, kind: 'blip-note', freq: 523.25, gain: 0.5 },
  { id: 'beat-s51-logic', time: 281.2 + 5.02, kind: 'blip-note', freq: 659.25, gain: 0.5 },
  { id: 'beat-s51-art', time: 281.2 + 5.92, kind: 'blip-note', freq: 783.99, gain: 0.52 },
  { id: 'beat-s51-empathy', time: 281.2 + 6.86, kind: 'iris-chime', freq: 880, gain: 0.56 },
  // Scene 52 (start 289.933s): World Tree 4 staggered industry badges + 80 YRS plaque
  { id: 'beat-s52-med', time: 289.933 + 2.78, kind: 'crystal-clink', freq: 659.25, gain: 0.46 },
  { id: 'beat-s52-sci', time: 289.933 + 3.18, kind: 'crystal-clink', freq: 783.99, gain: 0.46 },
  { id: 'beat-s52-code', time: 289.933 + 3.58, kind: 'crystal-clink', freq: 880.0, gain: 0.48 },
  { id: 'beat-s52-art', time: 289.933 + 3.98, kind: 'crystal-clink', freq: 1046.5, gain: 0.5 },
  { id: 'beat-s52-80yrs', time: 289.933 + 4.82, kind: 'iris-chime', freq: 587.33, gain: 0.54 },
  // Scene 53 (start 296.733s): 4 ascending civilization monoliths
  { id: 'beat-s53-steam', time: 296.733 + 0.12, kind: 'blip-note', freq: 293.66, gain: 0.42 },
  { id: 'beat-s53-power', time: 296.733 + 0.52, kind: 'blip-note', freq: 392.0, gain: 0.44 },
  { id: 'beat-s53-info', time: 296.733 + 0.96, kind: 'blip-note', freq: 523.25, gain: 0.48 },
  { id: 'beat-s53-ai', time: 296.733 + 1.52, kind: 'iris-chime', freq: 659.25, gain: 0.6 },
  // Scene 54 (start 301.566s): Winter I & II crystal precipitation + 2012/2026 breakthroughs
  { id: 'beat-s54-w1', time: 301.566 + 1.38, kind: 'crystal-clink', freq: 740, gain: 0.48 },
  { id: 'beat-s54-w2', time: 301.566 + 3.02, kind: 'crystal-clink', freq: 830.6, gain: 0.48 },
  { id: 'beat-s54-2012', time: 301.566 + 4.05, kind: 'power-surge', freq: 440, gain: 0.46 },
  { id: 'beat-s54-2026', time: 301.566 + 5.15, kind: 'horizon-bloom', freq: 523.25, gain: 0.58 },
  // Scene 55 (start 309.000s): Plaque unfold + 80-year odometer ticks + Grand Finale FUTURE chord!
  { id: 'beat-s55-unfold', time: 309.0 + 2.28, kind: 'pixel-shimmer', gain: 0.52 },
  { id: 'beat-s55-tick1', time: 309.0 + 2.98, kind: 'tick', freq: 660, gain: 0.34 },
  { id: 'beat-s55-tick2', time: 309.0 + 3.16, kind: 'tick', freq: 740, gain: 0.34 },
  { id: 'beat-s55-tick3', time: 309.0 + 3.34, kind: 'tick', freq: 830, gain: 0.36 },
  { id: 'beat-s55-tick4', time: 309.0 + 3.52, kind: 'tick', freq: 932, gain: 0.38 },
  { id: 'beat-s55-tick5', time: 309.0 + 3.7, kind: 'tick', freq: 1046.5, gain: 0.4 },
  { id: 'beat-s55-future-chord', time: 309.0 + 3.85, kind: 'finale-chord', freq: 523.25, gain: 0.78 },
];

function buildAllSoundCues(): SfxCue[] {
  const cues: SfxCue[] = [];
  for (const scene of SCENE_CUTS) {
    const mapped = transitionToSfx(scene.transitionIn);
    cues.push({
      id: `cut-${scene.index}-${scene.id}`,
      time: scene.index === 1 ? 0.04 : scene.start,
      kind: mapped.kind,
      gain: mapped.gain,
    });
  }
  cues.push(...SIGNATURE_BEAT_CUES);
  cues.sort((a, b) => a.time - b.time);
  return cues;
}

export const SOUND_CUES: SfxCue[] = buildAllSoundCues();

/**
 * Pure deterministic window lookup: returns cues falling in (prevTime, nextTime]
 * during normal forward playback. Returns [] when scrubbing/seeking or paused.
 */
export function collectTriggeredSfxCues(prevTime: number, nextTime: number): SfxCue[] {
  const delta = nextTime - prevTime;
  if (delta <= 0 || delta > 0.35) return [];
  const triggered: SfxCue[] = [];
  for (let i = 0; i < SOUND_CUES.length; i++) {
    const cue = SOUND_CUES[i];
    if (cue.time > prevTime && cue.time <= nextTime) {
      triggered.push(cue);
    }
  }
  return triggered;
}

// Reusable cached short white-noise buffer per AudioContext
const noiseBufferCache = new WeakMap<AudioContext, AudioBuffer>();

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const existing = noiseBufferCache.get(ctx);
  if (existing) return existing;
  const length = Math.floor(ctx.sampleRate * 0.8);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // 16-bit stepped pseudo-random noise (authentic SNES/Genesis texture)
  let hold = 0;
  for (let i = 0; i < length; i++) {
    if (i % 3 === 0) {
      hold = Math.round((Math.random() * 2 - 1) * 16) / 16;
    }
    data[i] = hold;
  }
  noiseBufferCache.set(ctx, buffer);
  return buffer;
}

/**
 * Synthesize an authentic, warm, non-fatiguing 16-bit retro SFX directly into `destination`.
 * Works identically during live browser playback AND offline/realtime WebM video export!
 */
export function playSfxCue(
  ctx: AudioContext,
  destination: AudioNode,
  cue: SfxCue,
  masterSfxVolume: number
): void {
  if (masterSfxVolume <= 0.005 || ctx.state !== 'running') return;
  const now = ctx.currentTime;
  const vol = Math.min(1, masterSfxVolume * (cue.gain ?? 0.5)) * 0.24;
  if (vol <= 0.001) return;

  const playTone = (
    type: OscillatorType,
    startFreq: number,
    endFreq: number,
    startOffset: number,
    duration: number,
    peakGain: number
  ) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4200, now + startOffset);

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now + startOffset);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + startOffset + duration);
    }

    g.gain.setValueAtTime(0.0001, now + startOffset);
    g.gain.linearRampToValueAtTime(peakGain, now + startOffset + Math.min(0.015, duration * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

    osc.connect(filter);
    filter.connect(g);
    g.connect(destination);

    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.02);
  };

  const playFilteredNoise = (
    filterType: BiquadFilterType,
    startFreq: number,
    endFreq: number,
    q: number,
    duration: number,
    peakGain: number
  ) => {
    const src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.Q.setValueAtTime(q, now);
    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, endFreq), now + duration);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(peakGain, now + Math.min(0.04, duration * 0.25));
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(destination);

    src.start(now);
    src.stop(now + duration + 0.02);
  };

  switch (cue.kind) {
    case 'crt-boot':
      // Classic warm CRT degauss thump + phosphor power-up shimmer
      playTone('triangle', 110, 52, 0, 0.24, vol * 1.1);
      playTone('sine', 1650, 2650, 0.05, 0.22, vol * 0.32);
      playTone('square', 523.25, 1046.5, 0.14, 0.22, vol * 0.28);
      break;

    case 'swoosh':
      playFilteredNoise('bandpass', 520, 2400, 1.8, 0.22, vol * 0.72);
      playTone('triangle', 260, 480, 0, 0.16, vol * 0.25);
      break;

    case 'zoom-whoosh':
      playFilteredNoise('bandpass', 340, 2800, 2.2, 0.28, vol * 0.75);
      playTone('triangle', 220, 620, 0, 0.22, vol * 0.3);
      break;

    case 'iris-chime': {
      const root = cue.freq ?? 523.25;
      playTone('square', root, root, 0, 0.12, vol * 0.34);
      playTone('square', root * 1.25, root * 1.25, 0.06, 0.14, vol * 0.32);
      playTone('triangle', root * 1.5, root * 1.5, 0.12, 0.28, vol * 0.5);
      playTone('sine', root * 2, root * 2, 0.16, 0.34, vol * 0.35);
      break;
    }

    case 'tape-rewind':
      playTone('sawtooth', 980, 280, 0, 0.14, vol * 0.42);
      playTone('square', 320, 1240, 0.08, 0.12, vol * 0.36);
      playFilteredNoise('highpass', 1800, 3200, 1.2, 0.16, vol * 0.45);
      break;

    case 'winter-gust':
      playFilteredNoise('bandpass', 1500, 460, 2.4, 0.48, vol * 0.85);
      playTone('sine', 1318.5, 880, 0.04, 0.28, vol * 0.28);
      break;

    case 'ember-swell':
      playTone('triangle', 293.66, 440, 0, 0.34, vol * 0.48);
      playTone('sine', 587.33, 880, 0.08, 0.36, vol * 0.36);
      break;

    case 'horizon-bloom': {
      const base = cue.freq ?? 440;
      playTone('triangle', base * 0.5, base, 0, 0.42, vol * 0.55);
      playTone('sine', base * 1.5, base * 2, 0.08, 0.45, vol * 0.38);
      playFilteredNoise('bandpass', 700, 2600, 1.4, 0.34, vol * 0.45);
      break;
    }

    case 'pixel-shimmer':
      playTone('triangle', 659.25, 783.99, 0, 0.14, vol * 0.32);
      playTone('sine', 987.77, 1318.5, 0.06, 0.2, vol * 0.26);
      break;

    case 'blip-note': {
      const f = cue.freq ?? 587.33;
      playTone('square', f, f * 1.01, 0, 0.11, vol * 0.34);
      playTone('triangle', f * 2, f * 2, 0.02, 0.18, vol * 0.36);
      break;
    }

    case 'crystal-clink': {
      const f = cue.freq ?? 880;
      playTone('sine', f, f * 1.5, 0, 0.14, vol * 0.44);
      playTone('triangle', f * 2, f * 2, 0.03, 0.2, vol * 0.28);
      break;
    }

    case 'slash-buzz': {
      const f = cue.freq ?? 200;
      playTone('sawtooth', f * 1.4, f * 0.65, 0, 0.18, vol * 0.45);
      playFilteredNoise('bandpass', 1200, 400, 1.5, 0.16, vol * 0.55);
      break;
    }

    case 'tick': {
      const f = cue.freq ?? 780;
      playTone('square', f, f * 0.96, 0, 0.045, vol * 0.38);
      break;
    }

    case 'power-surge': {
      const f = cue.freq ?? 330;
      playTone('triangle', f * 0.75, f * 2, 0, 0.32, vol * 0.48);
      playTone('square', f, f * 2.5, 0.05, 0.24, vol * 0.26);
      break;
    }

    case 'finale-chord': {
      // Shimmering 16-bit Major-9th RPG Victory / Dawn Chord (C5 - E5 - G5 - B5 - D6)
      const notes = [261.63, 523.25, 659.25, 783.99, 987.77, 1174.66];
      notes.forEach((hz, idx) => {
        playTone(idx === 0 ? 'triangle' : idx % 2 === 0 ? 'sine' : 'square', hz, hz, idx * 0.055, 1.15 - idx * 0.08, vol * (idx === 0 ? 0.55 : 0.32));
      });
      playFilteredNoise('bandpass', 1200, 3400, 2.0, 0.55, vol * 0.36);
      break;
    }
  }
}

export const SFX_DURATION_GUARD = CLIP_DURATION;
