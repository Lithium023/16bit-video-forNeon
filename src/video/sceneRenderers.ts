import { FONT_DISPLAY, drawVignette } from './canvasPrimitives';
import { renderRetroPixelScene } from './retroPixelRenderer';
import { CLIP_DURATION, getActiveCue } from './srtParser';
import {
  clamp01,
  easeOutCubic,
  getActiveTransition,
  getSceneAtTime,
  getSyntheticVoiceEnergy,
  lerp,
} from './timeline';
import type { RenderSettings, SrtCue } from './types';

// ============================================================================
// LOWER-THIRD BROADCAST SUBTITLE BAR (Clean Original Typography)
// ============================================================================
function drawBroadcastSubtitles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isPortrait: boolean,
  cue: SrtCue | null,
  time: number
): void {
  if (!cue) return;
  const elapsed = time - cue.start;
  const remaining = cue.end - time;
  const fadeIn = easeOutCubic(clamp01(elapsed / 0.16));
  const fadeOut = clamp01(remaining / 0.12);
  const alpha = Math.min(fadeIn, Math.max(0.2, fadeOut));

  const fontSize = isPortrait ? Math.round(w * 0.038) : Math.round(h * 0.032);
  const y = h * (isPortrait ? 0.885 : 0.905);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${fontSize}px ${FONT_DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxW = w * 0.86;
  const measured = Math.min(ctx.measureText(cue.text).width, maxW);
  const padX = fontSize * 0.85;
  const padY = fontSize * 0.42;
  const boxW = measured + padX * 2;
  const boxH = fontSize + padY * 2;
  const bx = w * 0.5 - boxW / 2;
  const by = y - boxH / 2;

  ctx.fillStyle = 'rgba(7, 8, 11, 0.74)';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 8);
  ctx.fill();

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#F4F4F5';
  ctx.fillText(cue.text, w * 0.5, y, maxW);
  ctx.restore();
}

// ============================================================================
// MASTER 16-BIT FRAME COMPOSITOR (1920x1080 or 1080x1920)
// ============================================================================
export function renderVideoFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  cues: SrtCue[],
  settings: RenderSettings,
  liveAudioEnergy?: number
): void {
  const isPortrait = h > w;
  const { scene, localTime, progress } = getSceneAtTime(time);
  const synthetic = getSyntheticVoiceEnergy(time);
  const energy = liveAudioEnergy !== undefined ? lerp(synthetic, liveAudioEnergy, 0.65) : synthetic;
  const activeTransition = getActiveTransition(time);

  ctx.save();

  renderRetroPixelScene({
    ctx,
    w,
    h,
    isPortrait,
    time,
    localTime,
    progress,
    energy,
    intensity: settings.motionIntensity,
    scene,
    activeTransition,
  });

  // Subtle CRT edge vignette
  drawVignette(ctx, w, h, 0.14);

  // Clean original lower-third broadcast subtitles
  if (settings.showSubtitles) {
    const activeCue = getActiveCue(cues, time);
    drawBroadcastSubtitles(ctx, w, h, isPortrait, activeCue, time);
  }

  // Ultra-clean hairline progress filament along the very bottom edge
  const overallFrac = clamp01(time / CLIP_DURATION);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(0, h - 4, w, 4);
  ctx.fillStyle = '#F2B44B';
  ctx.fillRect(0, h - 4, w * overallFrac, 4);

  // Gentle fade-out at the very final 0.25s
  if (time > CLIP_DURATION - 0.25) {
    const fade = clamp01((time - (CLIP_DURATION - 0.25)) / 0.25);
    ctx.fillStyle = `rgba(7, 8, 11, ${fade * 0.45})`;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}
