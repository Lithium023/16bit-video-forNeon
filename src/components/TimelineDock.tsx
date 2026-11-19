import { useRef } from 'react';
import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CLIP_DURATION, formatTimecode } from '../video/srtParser';
import { SCENE_CUTS, clamp } from '../video/timeline';
import type { AspectRatio, SrtCue } from '../video/types';

interface TimelineDockProps {
  currentTime: number;
  isPlaying: boolean;
  isMuted: boolean;
  playbackRate: number;
  aspectRatio: AspectRatio;
  cues: SrtCue[];
  onTogglePlay: () => void;
  onRestart: () => void;
  onSeek: (time: number) => void;
  onStep: (delta: number) => void;
  onToggleMute: () => void;
  onChangeRate: (rate: number) => void;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  onToggleFullscreen: () => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25];
const RULER_TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, CLIP_DURATION];

export function TimelineDock({
  currentTime,
  isPlaying,
  isMuted,
  playbackRate,
  aspectRatio,
  cues,
  onTogglePlay,
  onRestart,
  onSeek,
  onStep,
  onToggleMute,
  onChangeRate,
  onChangeAspectRatio,
  onToggleFullscreen,
}: TimelineDockProps) {
  const trackAreaRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const seekFromClientX = (clientX: number) => {
    const el = trackAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const frac = clamp((clientX - rect.left) / rect.width, 0, 1);
    onSeek(frac * CLIP_DURATION);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    seekFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const playheadPercent = clamp((currentTime / CLIP_DURATION) * 100, 0, 100);

  return (
    <section
      aria-label="播放控制与多轨时间轴"
      className="border-t border-zinc-800/90 bg-[#0B0D12] px-4 lg:px-6 py-3.5 shrink-0"
    >
      {/* Transport Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Left: Primary Transport */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? '暂停' : '播放'}
            className="h-9 px-3.5 inline-flex items-center gap-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>暂停</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>播放</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            aria-label="从头重播"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="后退 1 秒"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="前进 1 秒"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <div
            data-testid="timecode-display"
            className="ml-2 font-mono-tabular text-xs sm:text-sm text-zinc-200 whitespace-nowrap"
          >
            <span className="text-amber-400 font-semibold">{formatTimecode(currentTime)}</span>
            <span className="text-zinc-600 mx-1.5">/</span>
            <span className="text-zinc-400">{formatTimecode(CLIP_DURATION)}</span>
          </div>
        </div>

        {/* Right: Speed, Aspect Ratio & Audio */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Speed Selector */}
          <div className="hidden sm:flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800">
            {SPEED_OPTIONS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onChangeRate(rate)}
                aria-label={`倍速 ${rate}x`}
                aria-pressed={playbackRate === rate}
                className={`px-2 py-1 text-[11px] font-mono-tabular font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  playbackRate === rate
                    ? 'bg-zinc-700 text-zinc-50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Aspect Ratio Segmented Control */}
          <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800">
            {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => onChangeAspectRatio(ratio)}
                aria-label={`切换到 ${ratio} 画幅`}
                aria-pressed={aspectRatio === ratio}
                className={`px-2.5 py-1 text-[11px] font-mono-tabular font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                  aspectRatio === ratio
                    ? 'bg-amber-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? '开启口播声音' : '静音口播'}
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label="切换全屏预览"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Track Interactive Scrubber */}
      <div
        ref={trackAreaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        data-testid="timeline-scrubber"
        className="relative rounded-md border border-zinc-800/90 bg-[#07080B] pt-5 pb-2.5 px-0 cursor-ew-resize touch-none select-none overflow-hidden"
      >
        {/* Ruler ticks */}
        <div className="absolute top-0 left-0 right-0 h-5 border-b border-zinc-800/80 pointer-events-none">
          {RULER_TICKS.map((sec) => {
            const left = (sec / CLIP_DURATION) * 100;
            return (
              <div
                key={sec}
                style={{ left: `${left}%` }}
                className="absolute top-0 bottom-0 flex items-center"
              >
                <span
                  className={`font-mono-tabular text-[10px] text-zinc-500 ${
                    sec === 0 ? 'pl-1.5' : sec === CLIP_DURATION ? '-translate-x-full pr-1.5' : '-translate-x-1/2'
                  }`}
                >
                  {String(Math.floor(sec / 60)).padStart(2, '0')}:{String(Math.floor(sec % 60)).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Track 1: 9 Visual Scene Cuts + Transition Markers */}
        <div className="relative h-8 mt-1.5 mx-0">
          {SCENE_CUTS.map((cut) => {
            const leftPct = (cut.start / CLIP_DURATION) * 100;
            const widthPct = ((cut.end - cut.start) / CLIP_DURATION) * 100;
            const isActive =
              currentTime >= cut.start &&
              (currentTime < cut.end || (cut.index === SCENE_CUTS.length && currentTime <= cut.end));

            return (
              <div
                key={cut.id}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                className="absolute top-0 bottom-0 px-[1px]"
              >
                <div
                  className={`h-full rounded-[3px] px-1.5 flex items-center overflow-hidden border transition-colors ${
                    isActive
                      ? 'bg-zinc-800/95 border-amber-500/80 text-zinc-50'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="w-1 h-3.5 rounded-full mr-1.5 shrink-0"
                    style={{ backgroundColor: cut.accentColor }}
                  />
                  <span className="text-[11px] font-medium truncate">{cut.title}</span>
                </div>

                {/* Transition diamond marker on cut boundary */}
                {cut.start > 0 && (
                  <span
                    aria-hidden="true"
                    title={cut.transitionLabel}
                    className="absolute -left-[4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-400 border border-zinc-950 z-10"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Track 2: 14 Synchronized SRT Dialogue Blocks */}
        <div className="relative h-6 mt-1.5">
          {cues.map((cue) => {
            const leftPct = (cue.start / CLIP_DURATION) * 100;
            const widthPct = ((cue.end - cue.start) / CLIP_DURATION) * 100;
            const isActive = currentTime >= cue.start && currentTime < cue.end;
            return (
              <div
                key={cue.id}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                className="absolute top-0 bottom-0 px-[1px]"
              >
                <div
                  className={`h-full rounded-[2px] px-1 flex items-center overflow-hidden text-[10px] truncate transition-colors ${
                    isActive
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
                      : 'bg-zinc-900/60 text-zinc-500 border border-zinc-800/70'
                  }`}
                >
                  {cue.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Draggable Playhead Needle */}
        <div
          aria-hidden="true"
          style={{ left: `${playheadPercent}%` }}
          className="pointer-events-none absolute top-0 bottom-0 z-20 -translate-x-1/2 flex flex-col items-center"
        >
          <div className="w-2.5 h-3 bg-amber-400 rounded-b-sm shadow" />
          <div className="w-[2px] flex-1 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
        </div>
      </div>
    </section>
  );
}
