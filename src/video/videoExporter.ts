import { collectTriggeredSfxCues, playSfxCue } from './retroSfxEngine';
import { AUDIO_SRC, BGM_SRC, CLIP_DURATION } from './srtParser';
import { renderVideoFrame } from './sceneRenderers';
import type { RenderSettings, SrtCue } from './types';

export interface ExportController {
  cancel: () => void;
}

/**
 * Render and record the full 5m14.5s 16-bit motion-graphics video synced with the MP3 voiceover,
 * 5-act 16-bit chiptune soundtrack, and synchronized retro SFX into a downloadable WebM file.
 */
export function startVideoExport(
  cues: SrtCue[],
  settings: RenderSettings,
  onProgress: (progress: number) => void,
  onComplete: (url: string, filename: string) => void,
  onError: (message: string) => void
): ExportController {
  let cancelled = false;
  let rafId = 0;
  let audioEl: HTMLAudioElement | null = null;
  let bgmEl: HTMLAudioElement | null = null;
  let audioCtx: AudioContext | null = null;
  let recorder: MediaRecorder | null = null;

  const cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
      audioEl = null;
    }
    if (bgmEl) {
      bgmEl.pause();
      bgmEl.src = '';
      bgmEl = null;
    }
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  };

  const run = async () => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('当前浏览器不支持 MediaRecorder 视频录制导出');
      }

      const canvas = document.createElement('canvas');
      const isPortrait = settings.aspectRatio === '9:16';
      canvas.width = isPortrait ? 720 : 1280;
      canvas.height = isPortrait ? 1280 : 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建导出画布上下文');

      // Prepare voiceover audio routed into MediaStreamDestination
      audioEl = new Audio(AUDIO_SRC);
      audioEl.crossOrigin = 'anonymous';
      audioEl.preload = 'auto';

      const loadAudio = (el: HTMLAudioElement, errMsg: string) =>
        new Promise<void>((resolve, reject) => {
          const onReady = () => {
            el.removeEventListener('canplaythrough', onReady);
            el.removeEventListener('error', onErr);
            resolve();
          };
          const onErr = () => {
            el.removeEventListener('canplaythrough', onReady);
            el.removeEventListener('error', onErr);
            reject(new Error(errMsg));
          };
          el.addEventListener('canplaythrough', onReady);
          el.addEventListener('error', onErr);
          el.load();
        });

      await loadAudio(audioEl, '口播音频加载失败');

      // Optionally load mastered 5-act 16-bit BGM track if bgmVolume > 0
      let bgmReady = false;
      if (settings.bgmVolume > 0.01) {
        bgmEl = new Audio(BGM_SRC);
        bgmEl.crossOrigin = 'anonymous';
        bgmEl.preload = 'auto';
        try {
          await loadAudio(bgmEl, '配乐加载失败');
          bgmReady = true;
        } catch {
          bgmEl = null;
          bgmReady = false;
        }
      }

      if (cancelled) {
        cleanup();
        return;
      }

      audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const source = audioCtx.createMediaElementSource(audioEl);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const dest = audioCtx.createMediaStreamDestination();
      const voiceGain = audioCtx.createGain();
      voiceGain.gain.value = 1.0;

      source.connect(analyser);
      analyser.connect(voiceGain);
      voiceGain.connect(dest);

      let bgmGain: GainNode | null = null;
      if (bgmEl && bgmReady) {
        const bgmSource = audioCtx.createMediaElementSource(bgmEl);
        bgmGain = audioCtx.createGain();
        bgmGain.gain.value = Math.max(0, Math.min(1, settings.bgmVolume * 0.58));
        bgmSource.connect(bgmGain);
        bgmGain.connect(dest);
      }

      const videoStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      const mimeCandidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';

      const chunks: BlobPart[] = [];
      recorder = mimeType
        ? new MediaRecorder(combinedStream, { mimeType, videoBitsPerSecond: 6_000_000 })
        : new MediaRecorder(combinedStream);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };

      recorder.onstop = () => {
        if (cancelled) {
          cleanup();
          return;
        }
        const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const ratioLabel = isPortrait ? '9x16' : '16x9';
        cleanup();
        onComplete(url, `AI发展史_16bit完整成片_${ratioLabel}.webm`);
      };

      recorder.onerror = () => {
        cleanup();
        onError('视频编码过程中出现错误');
      };

      const freqData = new Uint8Array(analyser.frequencyBinCount);
      audioEl.currentTime = 0;
      if (bgmEl && bgmReady) bgmEl.currentTime = 0;
      recorder.start(250);
      await audioEl.play();
      if (bgmEl && bgmReady) {
        bgmEl.play().catch(() => {});
      }

      let prevT = 0;
      const tick = () => {
        if (cancelled || !audioEl) return;

        const t = Math.min(audioEl.currentTime, CLIP_DURATION);
        analyser.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) sum += freqData[i];
        const energy = Math.min(1, sum / (freqData.length * 140));

        // Subtle dynamic ducking on BGM + final fade-out
        if (bgmGain && audioCtx) {
          const duck = 1 - energy * 0.22;
          const tail = t > CLIP_DURATION - 1.5 ? Math.max(0, (CLIP_DURATION - t) / 1.5) : 1;
          bgmGain.gain.setValueAtTime(
            Math.max(0, Math.min(1, settings.bgmVolume * 0.58 * duck * tail)),
            audioCtx.currentTime
          );
        }

        // Mix synchronized 16-bit SFX directly into exported audio stream
        if (audioCtx && settings.sfxVolume > 0.01) {
          const sfxHits = collectTriggeredSfxCues(prevT, t);
          for (let i = 0; i < sfxHits.length; i++) {
            playSfxCue(audioCtx, dest, sfxHits[i], settings.sfxVolume);
          }
        }
        prevT = t;

        // Gentle voiceover fade out during final 0.25s
        if (t > CLIP_DURATION - 0.25 && audioCtx) {
          const rem = Math.max(0, (CLIP_DURATION - t) / 0.25);
          voiceGain.gain.setValueAtTime(rem, audioCtx.currentTime);
        }

        renderVideoFrame(ctx, canvas.width, canvas.height, t, cues, settings, energy);
        onProgress(Math.min(1, t / CLIP_DURATION));

        if (t >= CLIP_DURATION || audioEl.ended) {
          audioEl.pause();
          bgmEl?.pause();
          if (recorder && recorder.state === 'recording') {
            recorder.stop();
          }
          return;
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);
    } catch (err) {
      cleanup();
      onError(err instanceof Error ? err.message : '导出失败');
    }
  };

  run();

  return {
    cancel: () => {
      cancelled = true;
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
      }
      cleanup();
    },
  };
}
