import { AUDIO_SRC, CLIP_DURATION } from './srtParser';
import { renderVideoFrame } from './sceneRenderers';
import type { RenderSettings, SrtCue } from './types';

export interface ExportController {
  cancel: () => void;
}

/**
 * Render and record the full 30-second motion-graphics video synced with the MP3 voiceover
 * into a downloadable WebM file using Canvas captureStream + Web Audio MediaStreamDestination.
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
  let audioCtx: AudioContext | null = null;
  let recorder: MediaRecorder | null = null;

  const cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
      audioEl = null;
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

      await new Promise<void>((resolve, reject) => {
        if (!audioEl) return reject(new Error('音频初始化失败'));
        const onReady = () => {
          audioEl?.removeEventListener('canplaythrough', onReady);
          audioEl?.removeEventListener('error', onErr);
          resolve();
        };
        const onErr = () => {
          audioEl?.removeEventListener('canplaythrough', onReady);
          audioEl?.removeEventListener('error', onErr);
          reject(new Error('口播音频加载失败'));
        };
        audioEl.addEventListener('canplaythrough', onReady);
        audioEl.addEventListener('error', onErr);
        audioEl.load();
      });

      if (cancelled) {
        cleanup();
        return;
      }

      audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audioEl);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      const dest = audioCtx.createMediaStreamDestination();
      const gain = audioCtx.createGain();
      gain.gain.value = 1.0;

      source.connect(analyser);
      analyser.connect(gain);
      gain.connect(dest);

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
      recorder.start(250);
      await audioEl.play();

      const tick = () => {
        if (cancelled || !audioEl) return;

        const t = Math.min(audioEl.currentTime, CLIP_DURATION);
        analyser.getByteFrequencyData(freqData);
        let sum = 0;
        for (let i = 0; i < freqData.length; i++) sum += freqData[i];
        const energy = Math.min(1, sum / (freqData.length * 140));

        // Gentle audio fade out during final 0.25s
        if (t > CLIP_DURATION - 0.25 && audioCtx) {
          const rem = Math.max(0, (CLIP_DURATION - t) / 0.25);
          gain.gain.setValueAtTime(rem, audioCtx.currentTime);
        }

        renderVideoFrame(ctx, canvas.width, canvas.height, t, cues, settings, energy);
        onProgress(Math.min(1, t / CLIP_DURATION));

        if (t >= CLIP_DURATION || audioEl.ended) {
          audioEl.pause();
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
