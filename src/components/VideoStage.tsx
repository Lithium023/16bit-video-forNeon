import { useEffect } from 'react';
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { renderVideoFrame } from '../video/sceneRenderers';
import { CLIP_DURATION, formatTimecode } from '../video/srtParser';
import { getSceneAtTime } from '../video/timeline';
import type { RenderSettings, SrtCue } from '../video/types';

interface VideoStageProps {
  currentTime: number;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  cues: SrtCue[];
  settings: RenderSettings;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  liveEnergyRef: React.MutableRefObject<number | undefined>;
  currentTimeRef: React.MutableRefObject<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
}

export function VideoStage({
  currentTime,
  isPlaying,
  isMuted,
  isFullscreen,
  cues,
  settings,
  canvasRef,
  liveEnergyRef,
  currentTimeRef,
  containerRef,
  onTogglePlay,
  onToggleMute,
  onToggleFullscreen,
}: VideoStageProps) {
  const { scene } = getSceneAtTime(currentTime);
  const isPortrait = settings.aspectRatio === '9:16';

  // Render static/scrubbed frame whenever paused time, cues, or visual settings change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = isPortrait ? 1080 : 1920;
    const targetH = isPortrait ? 1920 : 1080;
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    renderVideoFrame(ctx, targetW, targetH, currentTime, cues, settings, liveEnergyRef.current);
  }, [canvasRef, currentTime, cues, settings, isPortrait, liveEnergyRef]);

  // Run once on mount: repaint as soon as Google CJK fonts finish loading
  useEffect(() => {
    let active = true;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        renderVideoFrame(
          ctx,
          canvas.width,
          canvas.height,
          currentTimeRef.current,
          cues,
          settings,
          liveEnergyRef.current
        );
      });
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowAccent = '#F2B44B';

  return (
    <div
      ref={containerRef}
      data-testid="video-stage-container"
      data-scene={scene.id}
      data-style="retro-pixel"
      data-playing={String(isPlaying)}
      className={`relative flex-1 min-h-0 flex flex-col items-center justify-center bg-[#07080B] overflow-hidden select-none ${
        isFullscreen ? 'p-4' : 'px-4 pt-3.5 pb-3 lg:px-6 lg:pt-4 lg:pb-3.5'
      }`}
    >
      {/* Subtle 16-bit warm amber ambient backdrop glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 transition-colors duration-500"
        style={{
          background: `radial-gradient(ellipse 68% 58% at 50% 48%, ${glowAccent}26, transparent 74%)`,
        }}
      />

      {/* Video Frame Shell */}
      <div
        className={`relative group flex items-center justify-center rounded-lg overflow-hidden border border-zinc-800 bg-black shadow-2xl transition-all duration-300 ${
          isPortrait
            ? 'h-full max-h-[64vh] lg:max-h-[calc(100vh-270px)] aspect-[9/16]'
            : 'w-full max-w-[1060px] max-h-[60vh] lg:max-h-[calc(100vh-270px)] aspect-video'
        }`}
      >
        <canvas
          ref={canvasRef}
          data-testid="video-stage-canvas"
          width={isPortrait ? 1080 : 1920}
          height={isPortrait ? 1920 : 1080}
          className="w-full h-full block object-contain"
        />

        {/* Full-frame accessible Play/Pause toggle surface */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? '暂停视频播放' : '开始播放 16-Bit 动效成片'}
          className="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400"
        />

        {/* High-contrast top-left editorial scene cue (readable on both dark and ivory scenes) */}
        <div
          className={`pointer-events-none absolute top-3 left-3.5 flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-100 transition-opacity duration-200 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}
        >
          <span className="font-mono-tabular text-amber-400 font-semibold">
            {String(scene.index).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="text-zinc-500">/</span>
          <span className="font-medium whitespace-nowrap">{scene.title}</span>
          <span aria-hidden="true" className="text-zinc-500">·</span>
          <span className="text-zinc-300 whitespace-nowrap">{scene.transitionLabel}</span>
        </div>

        {/* Clean corner quick-actions (never covering center kinetic typography) */}
        <div
          className={`absolute bottom-3.5 right-3.5 flex items-center gap-2 transition-opacity duration-200 ${
            isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            aria-label={isMuted ? '取消静音' : '静音'}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-700/80 text-zinc-200 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFullscreen();
            }}
            aria-label={isFullscreen ? '退出全屏' : '全屏播放'}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-zinc-950/85 hover:bg-zinc-900 border border-zinc-700/80 text-zinc-200 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Bottom-left compact Play CTA when paused so center kinetic type stays 100% unobstructed */}
        {!isPlaying && (
          <div className="absolute bottom-3.5 left-3.5 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              aria-label="播放动效视频"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>{currentTime > 0.1 && currentTime < CLIP_DURATION - 0.1 ? '继续播放' : '播放成片'}</span>
            </button>
            <span className="hidden sm:inline-block font-mono-tabular text-xs text-zinc-200 bg-zinc-950/80 px-2.5 py-1.5 rounded-md border border-zinc-800 whitespace-nowrap">
              {formatTimecode(currentTime)} / {formatTimecode(CLIP_DURATION)}
            </span>
          </div>
        )}

        {/* Brief playing hover Pause cue */}
        {isPlaying && (
          <div className="pointer-events-none absolute bottom-3.5 left-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-200">
              <Pause className="w-3 h-3" aria-hidden="true" />
              <span>点击画面暂停</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
