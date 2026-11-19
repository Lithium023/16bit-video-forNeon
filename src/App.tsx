import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorialPanel } from './components/EditorialPanel';
import { TimelineDock } from './components/TimelineDock';
import { TopBar, type PanelTab } from './components/TopBar';
import { VideoStage } from './components/VideoStage';
import { renderVideoFrame } from './video/sceneRenderers';
import { collectTriggeredSfxCues, playSfxCue } from './video/retroSfxEngine';
import {
  AUDIO_SRC,
  BGM_SRC,
  CLIP_DURATION,
  DEFAULT_30S_SRT,
  SRT_SRC,
  parseSrt,
} from './video/srtParser';
import { clamp } from './video/timeline';
import type { ExportStatus, RenderSettings, SrtCue } from './video/types';
import { getExportConfig, startVideoExport, type ExportController } from './video/videoExporter';

function readInitialQueryParams(): {
  initialTime: number;
  autostart: boolean;
} {
  if (typeof window === 'undefined') {
    return { initialTime: 0, autostart: false };
  }
  const params = new URLSearchParams(window.location.search);
  const rawT = params.get('t');
  const parsedT = rawT !== null ? Number(rawT) : 0;
  const initialTime = Number.isFinite(parsedT) ? clamp(parsedT, 0, CLIP_DURATION) : 0;
  const autostart = params.get('autostart') === '1';
  return { initialTime, autostart };
}

export default function App() {
  const [{ initialTime, autostart }] = useState(readInitialQueryParams);

  const [cues, setCues] = useState<SrtCue[]>(() => parseSrt(DEFAULT_30S_SRT, CLIP_DURATION));
  const [currentTime, setCurrentTime] = useState<number>(initialTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('storyboard');
  const [settings, setSettings] = useState<RenderSettings>({
    aspectRatio: '16:9',
    exportResolution: '1080p',
    showSubtitles: true,
    motionIntensity: 1.0,
    bgmVolume: 0.36,
    sfxVolume: 0.55,
  });
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    state: 'idle',
    progress: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqBufRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const liveEnergyRef = useRef<number | undefined>(undefined);
  const isMutedRef = useRef(false);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const exportCtrlRef = useRef<ExportController | null>(null);

  // Refs for smooth 60fps direct canvas loop without forcing 60Hz React DOM reconciliation
  const isPlayingRef = useRef(false);
  const currentTimeRef = useRef(initialTime);
  const playbackRateRef = useRef(1);
  const cuesRef = useRef(cues);
  const settingsRef = useRef(settings);
  const usingAudioClockRef = useRef(false);
  const lastFrameMsRef = useRef(0);
  const lastUiSyncMsRef = useRef(0);
  const lastAudioTimeRef = useRef(-1);
  const audioStallMsRef = useRef(0);

  useEffect(() => {
    cuesRef.current = cues;
  }, [cues]);

  useEffect(() => {
    settingsRef.current = settings;
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = clamp(settings.bgmVolume * 0.58, 0, 1);
    }
  }, [settings]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Load actual uploaded SRT file from /assets/aistudio/ai____416e1634.srt
  useEffect(() => {
    let active = true;
    fetch(SRT_SRC)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error('SRT fetch failed'))))
      .then((text) => {
        if (!active) return;
        const parsed = parseSrt(text, CLIP_DURATION);
        if (parsed.length > 0) setCues(parsed);
      })
      .catch(() => {
        // Fallback DEFAULT_30S_SRT is already active
      });
    return () => {
      active = false;
    };
  }, []);

  // Safely attach Web Audio Analyser ONLY after a real user gesture & running AudioContext
  const tryAttachAudioAnalyser = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current ?? new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state !== 'running') return;

      const src = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
      freqBufRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
    } catch {
      // Keep native <audio> playback working cleanly with deterministic rhythm envelope
    }
  }, []);

  const pausePlayback = useCallback(() => {
    isPlayingRef.current = false;
    usingAudioClockRef.current = false;
    liveEnergyRef.current = undefined;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.pause();
    }
    setCurrentTime(currentTimeRef.current);
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(
    async (fromTime?: number, isUserGesture = true) => {
      const startAt =
        fromTime !== undefined
          ? clamp(fromTime, 0, CLIP_DURATION)
          : currentTimeRef.current >= CLIP_DURATION - 0.08
            ? 0
            : currentTimeRef.current;

      currentTimeRef.current = startAt;
      setCurrentTime(startAt);
      isPlayingRef.current = true;
      lastFrameMsRef.current = performance.now();
      lastUiSyncMsRef.current = performance.now();
      lastAudioTimeRef.current = startAt;
      audioStallMsRef.current = 0;
      setIsPlaying(true);

      const audio = audioRef.current;
      const bgm = bgmAudioRef.current;
      if (audio && isUserGesture) {
        audio.playbackRate = playbackRateRef.current;
        audio.muted = isMuted;
        audio.volume = 1;
        if (bgm) {
          bgm.playbackRate = playbackRateRef.current;
          bgm.muted = isMuted;
          bgm.volume = clamp(settingsRef.current.bgmVolume * 0.58, 0, 1);
        }
        try {
          audio.currentTime = startAt;
          if (bgm) {
            try {
              bgm.currentTime = startAt;
            } catch {
              // Ignore seek before metadata ready
            }
          }
          await audio.play();
          bgm?.play().catch(() => {});
          usingAudioClockRef.current = true;
          tryAttachAudioAnalyser().catch(() => {});
        } catch {
          usingAudioClockRef.current = false;
        }
      } else {
        // Programmatic ?autostart=1 uses crisp visual clock without blocked AudioContext warnings
        usingAudioClockRef.current = false;
      }
    },
    [isMuted, tryAttachAudioAnalyser]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pausePlayback();
    } else {
      startPlayback(undefined, true);
    }
  }, [pausePlayback, startPlayback]);

  const handleSeek = useCallback((nextTime: number) => {
    const clamped = clamp(nextTime, 0, CLIP_DURATION);
    currentTimeRef.current = clamped;
    lastAudioTimeRef.current = clamped;
    audioStallMsRef.current = 0;
    setCurrentTime(clamped);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = clamped;
      } catch {
        // Ignore seek errors before metadata loads
      }
    }
    if (bgmAudioRef.current) {
      try {
        bgmAudioRef.current.currentTime = clamped;
      } catch {
        // Ignore seek errors before metadata loads
      }
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (isPlayingRef.current) {
      startPlayback(0, true);
    } else {
      handleSeek(0);
    }
  }, [handleSeek, startPlayback]);

  const handleStep = useCallback(
    (delta: number) => {
      handleSeek(currentTimeRef.current + delta);
    },
    [handleSeek]
  );

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      if (bgmAudioRef.current) {
        bgmAudioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const target = stageContainerRef.current;
    if (!target) return;
    if (!document.fullscreenElement) {
      target.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Optional ?autostart=1 support for seamless automated/demo playback
  useEffect(() => {
    if (autostart) {
      startPlayback(initialTime, false);
    }
  }, [autostart, initialTime, startPlayback]);

  // Direct 60fps Canvas render loop with stall-resilient audio clock & throttled ~20Hz React UI sync
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;

    const tick = (now: number) => {
      if (!isPlayingRef.current) return;

      const dtMs = Math.min(100, Math.max(0, now - lastFrameMsRef.current));
      const dt = dtMs / 1000;
      lastFrameMsRef.current = now;

      const audio = audioRef.current;
      let nextTime = currentTimeRef.current;

      if (usingAudioClockRef.current && audio && !audio.paused && Number.isFinite(audio.currentTime)) {
        const aTime = audio.currentTime;
        if (Math.abs(aTime - lastAudioTimeRef.current) < 0.002) {
          audioStallMsRef.current += dtMs;
          // Auto-fallback to smooth visual clock if browser audio sink stalls
          if (audioStallMsRef.current > 180) {
            usingAudioClockRef.current = false;
            nextTime = currentTimeRef.current + dt * playbackRateRef.current;
          } else {
            nextTime = aTime;
          }
        } else {
          audioStallMsRef.current = 0;
          lastAudioTimeRef.current = aTime;
          nextTime = aTime;
        }

        if (nextTime > CLIP_DURATION - 0.25) {
          audio.volume = clamp((CLIP_DURATION - nextTime) / 0.25, 0, 1);
        } else if (audio.volume < 1) {
          audio.volume = 1;
        }
      } else {
        nextTime = currentTimeRef.current + dt * playbackRateRef.current;
      }

      if (analyserRef.current && freqBufRef.current && usingAudioClockRef.current) {
        analyserRef.current.getByteFrequencyData(freqBufRef.current);
        let sum = 0;
        for (let i = 0; i < freqBufRef.current.length; i++) {
          sum += freqBufRef.current[i];
        }
        liveEnergyRef.current = clamp(sum / (freqBufRef.current.length * 135), 0, 1);
      } else {
        liveEnergyRef.current = undefined;
      }

      const prevTime = currentTimeRef.current;

      // Sync 5-act 16-bit BGM clock & gentle voice-over ducking
      const bgm = bgmAudioRef.current;
      if (bgm && usingAudioClockRef.current) {
        if (bgm.paused && nextTime < CLIP_DURATION - 0.1) {
          bgm.currentTime = nextTime;
          bgm.play().catch(() => {});
        } else if (Math.abs(bgm.currentTime - nextTime) > 0.28) {
          try {
            bgm.currentTime = nextTime;
          } catch {
            // Ignore drift resync errors
          }
        }
        const duckFactor = 1 - (liveEnergyRef.current ?? 0.25) * 0.22;
        const tailFade = nextTime > CLIP_DURATION - 1.5 ? clamp((CLIP_DURATION - nextTime) / 1.5, 0, 1) : 1;
        bgm.volume = clamp(settingsRef.current.bgmVolume * 0.58 * duckFactor * tailFade, 0, 1);
      }

      // Trigger synchronized 16-bit transition & animation-beat SFX
      const sfxCtx = audioCtxRef.current;
      if (sfxCtx && sfxCtx.state === 'running' && !isMutedRef.current && settingsRef.current.sfxVolume > 0.01) {
        const sfxHits = collectTriggeredSfxCues(prevTime, nextTime);
        for (let i = 0; i < sfxHits.length; i++) {
          playSfxCue(sfxCtx, sfxCtx.destination, sfxHits[i], settingsRef.current.sfxVolume);
        }
      }

      if (nextTime >= CLIP_DURATION) {
        currentTimeRef.current = CLIP_DURATION;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          renderVideoFrame(
            ctx,
            canvas.width,
            canvas.height,
            CLIP_DURATION,
            cuesRef.current,
            settingsRef.current,
            liveEnergyRef.current
          );
        }
        pausePlayback();
        return;
      }

      currentTimeRef.current = nextTime;

      // Paint directly to Canvas at full 60fps
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        renderVideoFrame(
          ctx,
          canvas.width,
          canvas.height,
          nextTime,
          cuesRef.current,
          settingsRef.current,
          liveEnergyRef.current
        );
      }

      // Sync React UI (timecode, timeline playhead, active cue highlight) cleanly at ~20Hz
      if (now - lastUiSyncMsRef.current >= 50) {
        lastUiSyncMsRef.current = now;
        setCurrentTime(nextTime);
      }

      rafId = requestAnimationFrame(tick);
    };

    lastFrameMsRef.current = performance.now();
    lastUiSyncMsRef.current = performance.now();
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, pausePlayback]);

  // Keyboard shortcuts (Space, Left/Right arrows, R, M)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStep(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStep(1);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleRestart();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRestart, handleStep, handleToggleMute, handleTogglePlay]);

  // Video export handler
  const handleStartExport = useCallback(() => {
    if (isPlayingRef.current) pausePlayback();
    if (exportStatus.downloadUrl) {
      URL.revokeObjectURL(exportStatus.downloadUrl);
    }

    const exportCfg = getExportConfig(settings.aspectRatio, settings.exportResolution);
    setExportStatus({
      state: 'recording',
      progress: 0,
      message: '准备 MP4',
      resolutionLabel: exportCfg.resolutionTag,
    });
    exportCtrlRef.current = startVideoExport(
      cues,
      settings,
      (progress, stage) =>
        setExportStatus({
          state: 'recording',
          progress,
          message: stage,
          resolutionLabel: exportCfg.resolutionTag,
        }),
      (url, filename) => {
        setExportStatus({
          state: 'done',
          progress: 1,
          downloadUrl: url,
          filename,
          resolutionLabel: exportCfg.resolutionTag,
        });
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
      },
      (message) => {
        setExportStatus({ state: 'error', progress: 0, message });
      }
    );
  }, [cues, exportStatus.downloadUrl, pausePlayback, settings]);

  const handleCancelExport = useCallback(() => {
    exportCtrlRef.current?.cancel();
    exportCtrlRef.current = null;
    setExportStatus({ state: 'idle', progress: 0 });
  }, []);

  const handleUpdateSettings = useCallback((patch: Partial<RenderSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#07080B] text-zinc-100 overflow-x-hidden lg:overflow-hidden">
      {/* Real Uploaded Voiceover + 5-Act 16-Bit Soundtrack Audio Elements */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        crossOrigin="anonymous"
        muted={isMuted}
      />
      <audio
        ref={bgmAudioRef}
        src={BGM_SRC}
        preload="auto"
        crossOrigin="anonymous"
        muted={isMuted}
      />

      <TopBar
        currentTime={currentTime}
        onJumpChapter={handleSeek}
        exportResolution={settings.exportResolution}
        exportStatus={exportStatus}
        onStartExport={handleStartExport}
        onCancelExport={handleCancelExport}
      />

      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Primary 16-Bit Cinema Stage + Nonlinear Timeline Column */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <VideoStage
            currentTime={currentTime}
            isPlaying={isPlaying}
            isMuted={isMuted}
            isFullscreen={isFullscreen}
            cues={cues}
            settings={settings}
            canvasRef={canvasRef}
            liveEnergyRef={liveEnergyRef}
            currentTimeRef={currentTimeRef}
            containerRef={stageContainerRef}
            onTogglePlay={handleTogglePlay}
            onToggleMute={handleToggleMute}
            onToggleFullscreen={handleToggleFullscreen}
          />

          <TimelineDock
            currentTime={currentTime}
            isPlaying={isPlaying}
            isMuted={isMuted}
            playbackRate={playbackRate}
            aspectRatio={settings.aspectRatio}
            cues={cues}
            onTogglePlay={handleTogglePlay}
            onRestart={handleRestart}
            onSeek={handleSeek}
            onStep={handleStep}
            onToggleMute={handleToggleMute}
            onChangeRate={setPlaybackRate}
            onChangeAspectRatio={(ratio) => handleUpdateSettings({ aspectRatio: ratio })}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>

        {/* Right Editorial Storyboard / SRT / Tuning Panel */}
        <EditorialPanel
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentTime={currentTime}
          cues={cues}
          settings={settings}
          exportStatus={exportStatus}
          onSeek={handleSeek}
          onUpdateSettings={handleUpdateSettings}
        />
      </main>
    </div>
  );
}
