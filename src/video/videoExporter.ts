import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import { SOUND_CUES, collectTriggeredSfxCues, playSfxCue } from './retroSfxEngine';
import { AUDIO_SRC, BGM_SRC, CLIP_DURATION } from './srtParser';
import { renderVideoFrame } from './sceneRenderers';
import type { AspectRatio, ExportResolution, RenderSettings, SrtCue } from './types';

export interface ExportController {
  cancel: () => void;
}

export interface ExportVideoConfig {
  width: number;
  height: number;
  fps: number;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
  resolutionTag: string;
}

export function getExportConfig(
  aspectRatio: AspectRatio,
  resolution: ExportResolution = '1080p'
): ExportVideoConfig {
  const isPortrait = aspectRatio === '9:16';
  const is1080p = resolution === '1080p';
  const longEdge = is1080p ? 1920 : 1280;
  const shortEdge = is1080p ? 1080 : 720;
  const width = isPortrait ? shortEdge : longEdge;
  const height = isPortrait ? longEdge : shortEdge;
  return {
    width,
    height,
    fps: 30,
    videoBitsPerSecond: is1080p ? 14_000_000 : 6_500_000,
    audioBitsPerSecond: is1080p ? 192_000 : 160_000,
    resolutionTag: `${width}x${height}`,
  };
}

export interface MediaRecorderFormatChoice {
  mimeType: string;
  extension: 'mp4' | 'webm';
}

export function selectSupportedMediaRecorderMime(
  isSupported: (mime: string) => boolean
): MediaRecorderFormatChoice {
  const mp4Candidates = [
    'video/mp4;codecs=avc1.640028,mp4a.40.2',
    'video/mp4;codecs=avc1.4d002a,mp4a.40.2',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
  ];
  for (const mime of mp4Candidates) {
    if (isSupported(mime)) {
      return { mimeType: mime, extension: 'mp4' };
    }
  }
  const webmCandidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const mime of webmCandidates) {
    if (isSupported(mime)) {
      return { mimeType: mime, extension: 'webm' };
    }
  }
  return { mimeType: '', extension: 'webm' };
}

/**
 * Compute per-frame normalized voice energy [0..1] directly from decoded voiceover PCM samples.
 * Used both for frame-accurate canvas reactivity and automatic BGM ducking during offline MP4 render.
 */
export function computeVoiceEnergyTimeline(
  channelData: Float32Array,
  sampleRate: number,
  totalFrames: number,
  fps: number
): Float32Array {
  const energies = new Float32Array(totalFrames);
  const samplesPerFrame = Math.max(1, Math.floor(sampleRate / fps));
  let smoothed = 0;
  for (let f = 0; f < totalFrames; f++) {
    const start = f * samplesPerFrame;
    const end = Math.min(channelData.length, start + samplesPerFrame);
    let sumSq = 0;
    const stride = Math.max(1, Math.floor((end - start) / 160));
    let count = 0;
    for (let i = start; i < end; i += stride) {
      const s = channelData[i];
      sumSq += s * s;
      count++;
    }
    const rms = count > 0 ? Math.sqrt(sumSq / count) : 0;
    const norm = Math.min(1, rms * 3.8);
    smoothed = smoothed * 0.55 + norm * 0.45;
    energies[f] = smoothed;
  }
  return energies;
}

interface WebCodecsMp4Profile {
  videoCodec: string;
  muxerVideoCodec: 'avc' | 'vp9';
  audioCodec: string;
  muxerAudioCodec: 'aac' | 'opus';
  audioSampleRate: number;
  audioChannels: number;
}

async function probeWebCodecsMp4Profile(
  cfg: ExportVideoConfig,
  allowVp9Fallback: boolean
): Promise<WebCodecsMp4Profile | null> {
  if (
    typeof VideoEncoder === 'undefined' ||
    typeof AudioEncoder === 'undefined' ||
    typeof VideoFrame === 'undefined' ||
    typeof AudioData === 'undefined' ||
    typeof OfflineAudioContext === 'undefined'
  ) {
    return null;
  }

  const audioSampleRate = 48_000;
  const audioChannels = 2;

  const findVideo = async (
    candidates: Array<{ codec: string; muxer: 'avc' | 'vp9' }>
  ): Promise<{ codec: string; muxer: 'avc' | 'vp9' } | null> => {
    for (const item of candidates) {
      try {
        const support = await VideoEncoder.isConfigSupported({
          codec: item.codec,
          width: cfg.width,
          height: cfg.height,
          bitrate: cfg.videoBitsPerSecond,
          framerate: cfg.fps,
          ...(item.muxer === 'avc' ? { avc: { format: 'avc' } } : {}),
        });
        if (support.supported) return item;
      } catch {
        // Try next codec
      }
    }
    return null;
  };

  const findAudio = async (
    candidates: Array<{ codec: string; muxer: 'aac' | 'opus' }>
  ): Promise<{ codec: string; muxer: 'aac' | 'opus' } | null> => {
    for (const item of candidates) {
      try {
        const support = await AudioEncoder.isConfigSupported({
          codec: item.codec,
          sampleRate: audioSampleRate,
          numberOfChannels: audioChannels,
          bitrate: cfg.audioBitsPerSecond,
        });
        if (support.supported) return item;
      } catch {
        // Try next codec
      }
    }
    return null;
  };

  // Prefer universal H.264 (AVC) + AAC-LC first (plays on macOS QuickTime, Windows, iPhone, Premiere, Jianying, Bilibili)
  const avcCandidates: Array<{ codec: string; muxer: 'avc' | 'vp9' }> = [
    { codec: 'avc1.64002a', muxer: 'avc' },
    { codec: 'avc1.640028', muxer: 'avc' },
    { codec: 'avc1.4d002a', muxer: 'avc' },
    { codec: 'avc1.42002a', muxer: 'avc' },
  ];
  const aacAudio = await findAudio([{ codec: 'mp4a.40.2', muxer: 'aac' }]);
  const avcVideo = await findVideo(avcCandidates);

  if (avcVideo && aacAudio) {
    return {
      videoCodec: avcVideo.codec,
      muxerVideoCodec: 'avc',
      audioCodec: aacAudio.codec,
      muxerAudioCodec: 'aac',
      audioSampleRate,
      audioChannels,
    };
  }

  const opusAudio = await findAudio([{ codec: 'opus', muxer: 'opus' }]);
  if (avcVideo && opusAudio) {
    return {
      videoCodec: avcVideo.codec,
      muxerVideoCodec: 'avc',
      audioCodec: opusAudio.codec,
      muxerAudioCodec: 'opus',
      audioSampleRate,
      audioChannels,
    };
  }

  if (allowVp9Fallback) {
    const vp9Video = await findVideo([
      { codec: 'vp09.00.41.08', muxer: 'vp9' },
      { codec: 'vp09.00.31.08', muxer: 'vp9' },
    ]);
    const anyAudio = aacAudio ?? opusAudio;
    if (vp9Video && anyAudio) {
      return {
        videoCodec: vp9Video.codec,
        muxerVideoCodec: 'vp9',
        audioCodec: anyAudio.codec,
        muxerAudioCodec: anyAudio.muxer,
        audioSampleRate,
        audioChannels,
      };
    }
  }

  return null;
}

async function waitForEncoderDrain(
  encoder: VideoEncoder | AudioEncoder,
  maxQueue: number
): Promise<void> {
  if (encoder.encodeQueueSize <= maxQueue) return;
  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      encoder.removeEventListener('dequeue', onDequeue);
      resolve();
    };
    const onDequeue = () => {
      if (encoder.encodeQueueSize <= Math.max(2, Math.floor(maxQueue / 2))) {
        finish();
      }
    };
    encoder.addEventListener('dequeue', onDequeue);
    setTimeout(finish, 20);
  });
}

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function decodeUrlToAudioBuffer(
  ctx: BaseAudioContext,
  url: string,
  errMsg: string
): Promise<AudioBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${errMsg} (HTTP ${res.status})`);
  }
  const raw = await res.arrayBuffer();
  return await ctx.decodeAudioData(raw);
}

/**
 * Offline faster-than-real-time WebCodecs + mp4-muxer renderer.
 * Produces a frame-accurate, zero-drop 1920x1080 (or 720p) MP4 with voiceover + ducked 5-act BGM + all 16-bit SFX.
 */
async function exportViaWebCodecsMp4(
  cues: SrtCue[],
  settings: RenderSettings,
  cfg: ExportVideoConfig,
  profile: WebCodecsMp4Profile,
  isCancelled: () => boolean,
  onProgress: (progress: number, stage?: string) => void,
  onComplete: (url: string, filename: string) => void,
  registerCleanup: (fn: () => void) => void
): Promise<void> {
  let videoEncoder: VideoEncoder | null = null;
  let audioEncoder: AudioEncoder | null = null;

  registerCleanup(() => {
    try {
      if (videoEncoder && videoEncoder.state !== 'closed') videoEncoder.close();
    } catch {
      // Ignore cleanup errors
    }
    try {
      if (audioEncoder && audioEncoder.state !== 'closed') audioEncoder.close();
    } catch {
      // Ignore cleanup errors
    }
  });

  const totalFrames = Math.ceil(CLIP_DURATION * cfg.fps);
  const sampleRate = profile.audioSampleRate;
  const totalAudioSamples = Math.ceil(CLIP_DURATION * sampleRate);

  // Phase 1: Decode audio tracks in parallel at target 48kHz sample rate
  onProgress(0.01, '混音音轨');
  const decodeCtx = new OfflineAudioContext(profile.audioChannels, 1, sampleRate);

  const [voiceBuffer, bgmBuffer] = await Promise.all([
    decodeUrlToAudioBuffer(decodeCtx, AUDIO_SRC, '口播音频加载失败'),
    settings.bgmVolume > 0.01
      ? decodeUrlToAudioBuffer(decodeCtx, BGM_SRC, '配乐加载失败').catch(() => null)
      : Promise.resolve(null),
  ]);
  if (isCancelled()) return;

  onProgress(0.04, '混音音轨');

  // Precompute frame-accurate voice energy for both canvas reactivity and smooth BGM ducking
  const voiceEnergies = computeVoiceEnergyTimeline(
    voiceBuffer.getChannelData(0),
    voiceBuffer.sampleRate,
    totalFrames,
    cfg.fps
  );

  // Ultra-fast direct stereo Float32 PCM mix (Voiceover + dynamically ducked 5-act BGM)
  const mixedL = new Float32Array(totalAudioSamples);
  const mixedR = new Float32Array(totalAudioSamples);

  const vL = voiceBuffer.getChannelData(0);
  const vR = voiceBuffer.numberOfChannels > 1 ? voiceBuffer.getChannelData(1) : vL;
  const bL = bgmBuffer ? bgmBuffer.getChannelData(0) : null;
  const bR = bgmBuffer
    ? bgmBuffer.numberOfChannels > 1
      ? bgmBuffer.getChannelData(1)
      : bL
    : null;

  const baseBgm = settings.bgmVolume > 0.01 ? Math.max(0, Math.min(1, settings.bgmVolume * 0.58)) : 0;
  const samplesPerFrame = sampleRate / cfg.fps;
  const voiceFadeStart = Math.max(0, Math.floor((CLIP_DURATION - 0.25) * sampleRate));
  const bgmFadeStart = Math.max(0, Math.floor((CLIP_DURATION - 1.5) * sampleRate));
  const voiceFadeLen = Math.max(1, totalAudioSamples - voiceFadeStart);
  const bgmFadeLen = Math.max(1, totalAudioSamples - bgmFadeStart);

  for (let i = 0; i < totalAudioSamples; i++) {
    let l = 0;
    let r = 0;
    if (i < vL.length) {
      const vFade = i >= voiceFadeStart ? (totalAudioSamples - i) / voiceFadeLen : 1;
      l += vL[i] * vFade;
      r += vR[i] * vFade;
    }
    if (baseBgm > 0 && bL && bR && i < bL.length) {
      const frameIdx = Math.min(totalFrames - 1, Math.floor(i / samplesPerFrame));
      const duck = 1 - voiceEnergies[frameIdx] * 0.22;
      const bFade = i >= bgmFadeStart ? (totalAudioSamples - i) / bgmFadeLen : 1;
      const g = baseBgm * duck * bFade;
      l += bL[i] * g;
      r += bR[i] * g;
    }
    mixedL[i] = l;
    mixedR[i] = r;
  }

  onProgress(0.06, '合成音效');
  await yieldToMainThread();
  if (isCancelled()) return;

  // Render & cache each distinct short 16-bit SFX cue into a tiny OfflineAudioContext (~0.6-1.5s)
  // and stamp it cleanly into mixedL/mixedR at its exact timeline timestamp (~40ms total!)
  if (settings.sfxVolume > 0.01) {
    const sfxClipCache = new Map<string, Float32Array>();
    for (let idx = 0; idx < SOUND_CUES.length; idx++) {
      if (isCancelled()) return;
      const cue = SOUND_CUES[idx];
      if (cue.time < 0 || cue.time >= CLIP_DURATION - 0.05) continue;

      const cacheKey = `${cue.kind}|${cue.freq ?? ''}|${cue.gain ?? ''}`;
      let sfxSamples = sfxClipCache.get(cacheKey);
      if (!sfxSamples) {
        const clipDur = cue.kind === 'finale-chord' ? 1.55 : cue.kind === 'winter-gust' ? 0.65 : 0.55;
        const sfxCtx = new OfflineAudioContext(1, Math.ceil(clipDur * sampleRate), sampleRate);
        playSfxCue(sfxCtx, sfxCtx.destination, cue, settings.sfxVolume, 0);
        const rendered = await sfxCtx.startRendering();
        sfxSamples = rendered.getChannelData(0);
        sfxClipCache.set(cacheKey, sfxSamples);
      }

      const startSample = Math.floor(cue.time * sampleRate);
      const copyLen = Math.min(sfxSamples.length, totalAudioSamples - startSample);
      for (let j = 0; j < copyLen; j++) {
        const s = sfxSamples[j];
        mixedL[startSample + j] += s;
        mixedR[startSample + j] += s;
      }
    }
  }

  // Gentle master ceiling clamp so mixed peaks never clip in AAC/Opus
  for (let i = 0; i < totalAudioSamples; i++) {
    mixedL[i] = Math.max(-0.98, Math.min(0.98, mixedL[i] * 0.95));
    mixedR[i] = Math.max(-0.98, Math.min(0.98, mixedR[i] * 0.95));
  }

  if (isCancelled()) return;
  onProgress(0.09, '编码音频');

  // Prepare MP4 muxer with Fast Start so exported MP4 plays immediately on all players & editors
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: profile.muxerVideoCodec,
      width: cfg.width,
      height: cfg.height,
      frameRate: cfg.fps,
    },
    audio: {
      codec: profile.muxerAudioCodec,
      numberOfChannels: profile.audioChannels,
      sampleRate: profile.audioSampleRate,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;

  audioEncoder = new AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: (err) => {
      encoderError = err instanceof Error ? err : new Error(String(err));
    },
  });
  audioEncoder.configure({
    codec: profile.audioCodec,
    numberOfChannels: profile.audioChannels,
    sampleRate: profile.audioSampleRate,
    bitrate: cfg.audioBitsPerSecond,
  });

  // Phase 2: Encode offline mixed stereo PCM audio into AAC / Opus chunks (1.0s batches = ~315 calls)
  const audioChunkSize = profile.audioSampleRate;
  let audioChunkIndex = 0;

  for (let offset = 0; offset < totalAudioSamples; offset += audioChunkSize) {
    if (isCancelled()) return;
    if (encoderError) throw encoderError;

    const frameCount = Math.min(audioChunkSize, totalAudioSamples - offset);
    const planar = new Float32Array(frameCount * 2);
    planar.set(mixedL.subarray(offset, offset + frameCount), 0);
    planar.set(mixedR.subarray(offset, offset + frameCount), frameCount);

    const audioData = new AudioData({
      format: 'f32-planar',
      sampleRate: profile.audioSampleRate,
      numberOfFrames: frameCount,
      numberOfChannels: 2,
      timestamp: Math.round((offset / profile.audioSampleRate) * 1_000_000),
      data: planar,
    });
    audioEncoder.encode(audioData);
    audioData.close();

    if (audioEncoder.encodeQueueSize > 24) {
      await waitForEncoderDrain(audioEncoder, 16);
      if (isCancelled()) return;
    }
    audioChunkIndex++;
    if (audioChunkIndex % 20 === 0) {
      onProgress(0.09 + 0.05 * (offset / totalAudioSamples), '编码音频');
      await yieldToMainThread();
    }
  }

  await audioEncoder.flush();
  audioEncoder.close();
  audioEncoder = null;
  if (isCancelled()) return;
  if (encoderError) throw encoderError;

  // Phase 3: Frame-accurate 1920x1080 (or 720p) canvas rendering + H.264 / VP9 encoding
  onProgress(0.14, '渲染 MP4');

  const canvas = document.createElement('canvas');
  canvas.width = cfg.width;
  canvas.height = cfg.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建导出画布上下文');
  ctx.imageSmoothingEnabled = false;

  videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (err) => {
      encoderError = err instanceof Error ? err : new Error(String(err));
    },
  });
  videoEncoder.configure({
    codec: profile.videoCodec,
    width: cfg.width,
    height: cfg.height,
    bitrate: cfg.videoBitsPerSecond,
    framerate: cfg.fps,
    ...(profile.muxerVideoCodec === 'avc' ? { avc: { format: 'avc' } } : {}),
  });

  const frameDurationUs = Math.round(1_000_000 / cfg.fps);
  let lastProgressUiMs = performance.now();

  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    if (isCancelled()) return;
    if (encoderError) throw encoderError;

    const t = Math.min(CLIP_DURATION, frameIdx / cfg.fps);
    renderVideoFrame(ctx, cfg.width, cfg.height, t, cues, settings, voiceEnergies[frameIdx]);

    const videoFrame = new VideoFrame(canvas, {
      timestamp: Math.round((frameIdx / cfg.fps) * 1_000_000),
      duration: frameDurationUs,
    });
    videoEncoder.encode(videoFrame, { keyFrame: frameIdx % (cfg.fps * 2) === 0 });
    videoFrame.close();

    if (videoEncoder.encodeQueueSize > 8) {
      await waitForEncoderDrain(videoEncoder, 6);
      if (isCancelled()) return;
    }

    const now = performance.now();
    if (now - lastProgressUiMs >= 60 || frameIdx === totalFrames - 1) {
      lastProgressUiMs = now;
      onProgress(0.14 + 0.83 * ((frameIdx + 1) / totalFrames), '渲染 MP4');
      await yieldToMainThread();
    }
  }

  // Phase 4: Flush video encoder & finalize MP4 binary container
  onProgress(0.98, '封装 MP4');
  await videoEncoder.flush();
  videoEncoder.close();
  videoEncoder = null;

  if (isCancelled()) return;
  if (encoderError) throw encoderError;

  muxer.finalize();
  const blob = new Blob([target.buffer], { type: 'video/mp4' });
  const url = URL.createObjectURL(blob);
  onProgress(1, '完成');
  onComplete(url, `AI发展史_16bit完整成片_${cfg.resolutionTag}.mp4`);
}

/**
 * Fallback real-time MediaRecorder path (supports native Safari/Chrome MP4, or WebM if MP4 unavailable).
 */
async function exportViaMediaRecorder(
  cues: SrtCue[],
  settings: RenderSettings,
  cfg: ExportVideoConfig,
  choice: MediaRecorderFormatChoice,
  isCancelled: () => boolean,
  onProgress: (progress: number, stage?: string) => void,
  onComplete: (url: string, filename: string) => void,
  onError: (message: string) => void,
  registerCleanup: (fn: () => void) => void
): Promise<void> {
  let rafId = 0;
  let audioEl: HTMLAudioElement | null = null;
  let bgmEl: HTMLAudioElement | null = null;
  let audioCtx: AudioContext | null = null;
  let recorder: MediaRecorder | null = null;

  const cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    if (recorder && recorder.state === 'recording') {
      try {
        recorder.stop();
      } catch {
        // Ignore stop race
      }
    }
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
  registerCleanup(cleanup);

  const canvas = document.createElement('canvas');
  canvas.width = cfg.width;
  canvas.height = cfg.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建导出画布上下文');
  ctx.imageSmoothingEnabled = false;

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

  if (isCancelled()) {
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

  const videoStream = canvas.captureStream(cfg.fps);
  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const chunks: BlobPart[] = [];
  const recorderOptions: MediaRecorderOptions = {
    videoBitsPerSecond: cfg.videoBitsPerSecond,
    audioBitsPerSecond: cfg.audioBitsPerSecond,
  };
  if (choice.mimeType) {
    recorderOptions.mimeType = choice.mimeType;
  }
  recorder = new MediaRecorder(combinedStream, recorderOptions);

  recorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  recorder.onstop = () => {
    if (isCancelled()) {
      cleanup();
      return;
    }
    const mime = choice.mimeType || (choice.extension === 'mp4' ? 'video/mp4' : 'video/webm');
    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    cleanup();
    onComplete(url, `AI发展史_16bit完整成片_${cfg.resolutionTag}.${choice.extension}`);
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
  const stageLabel = choice.extension === 'mp4' ? '录制 MP4' : '录制 WebM';
  const tick = () => {
    if (isCancelled() || !audioEl) return;

    const t = Math.min(audioEl.currentTime, CLIP_DURATION);
    analyser.getByteFrequencyData(freqData);
    let sum = 0;
    for (let i = 0; i < freqData.length; i++) sum += freqData[i];
    const energy = Math.min(1, sum / (freqData.length * 140));

    if (bgmGain && audioCtx) {
      const duck = 1 - energy * 0.22;
      const tail = t > CLIP_DURATION - 1.5 ? Math.max(0, (CLIP_DURATION - t) / 1.5) : 1;
      bgmGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, settings.bgmVolume * 0.58 * duck * tail)),
        audioCtx.currentTime
      );
    }

    if (audioCtx && settings.sfxVolume > 0.01) {
      const sfxHits = collectTriggeredSfxCues(prevT, t);
      for (let i = 0; i < sfxHits.length; i++) {
        playSfxCue(audioCtx, dest, sfxHits[i], settings.sfxVolume);
      }
    }
    prevT = t;

    if (t > CLIP_DURATION - 0.25 && audioCtx) {
      const rem = Math.max(0, (CLIP_DURATION - t) / 0.25);
      voiceGain.gain.setValueAtTime(rem, audioCtx.currentTime);
    }

    renderVideoFrame(ctx, cfg.width, cfg.height, t, cues, settings, energy);
    onProgress(Math.min(1, t / CLIP_DURATION), stageLabel);

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
}

/**
 * Export the full 5m14.5s 16-bit motion-graphics film with voiceover, 5-act 16-bit BGM, and SFX into MP4.
 *
 * Priority pipeline:
 * 1. Offline WebCodecs H.264 (AVC) + AAC + mp4-muxer (faster-than-real-time, zero frame drops, universal MP4)
 * 2. Native MediaRecorder H.264 + AAC MP4 (Safari & compatible browsers without WebCodecs AAC)
 * 3. Offline WebCodecs VP9 + Opus + mp4-muxer (open-source Chromium ISO BMFF MP4)
 * 4. MediaRecorder WebM fallback only if no MP4 encoder exists in the browser
 */
export function startVideoExport(
  cues: SrtCue[],
  settings: RenderSettings,
  onProgress: (progress: number, stage?: string) => void,
  onComplete: (url: string, filename: string) => void,
  onError: (message: string) => void
): ExportController {
  let cancelled = false;
  let activeCleanup: (() => void) | null = null;

  const isCancelled = () => cancelled;
  const safeProgress = (progress: number, stage?: string) => {
    if (!cancelled) onProgress(progress, stage);
  };
  const safeComplete = (url: string, filename: string) => {
    if (!cancelled) onComplete(url, filename);
  };
  const safeError = (message: string) => {
    if (!cancelled) onError(message);
  };
  const registerCleanup = (fn: () => void) => {
    activeCleanup = fn;
  };

  const run = async () => {
    try {
      const cfg = getExportConfig(settings.aspectRatio, settings.exportResolution);

      // Tier 1: Try universal H.264 + AAC (or H.264 + Opus) via offline WebCodecs MP4
      const avcProfile = await probeWebCodecsMp4Profile(cfg, false);
      if (isCancelled()) return;

      if (avcProfile) {
        await exportViaWebCodecsMp4(
          cues,
          settings,
          cfg,
          avcProfile,
          isCancelled,
          safeProgress,
          safeComplete,
          registerCleanup
        );
        return;
      }

      // Tier 2: Check if native MediaRecorder supports MP4 (e.g. Safari)
      const recorderChoice =
        typeof MediaRecorder !== 'undefined'
          ? selectSupportedMediaRecorderMime((m) => MediaRecorder.isTypeSupported(m))
          : null;

      if (recorderChoice && recorderChoice.extension === 'mp4') {
        await exportViaMediaRecorder(
          cues,
          settings,
          cfg,
          recorderChoice,
          isCancelled,
          safeProgress,
          safeComplete,
          safeError,
          registerCleanup
        );
        return;
      }

      // Tier 3: Try VP9 + Opus inside ISO BMFF MP4 via WebCodecs + mp4-muxer
      const vp9Mp4Profile = await probeWebCodecsMp4Profile(cfg, true);
      if (isCancelled()) return;

      if (vp9Mp4Profile) {
        await exportViaWebCodecsMp4(
          cues,
          settings,
          cfg,
          vp9Mp4Profile,
          isCancelled,
          safeProgress,
          safeComplete,
          registerCleanup
        );
        return;
      }

      // Tier 4: Final safety fallback if browser has zero MP4 encoders
      if (recorderChoice) {
        await exportViaMediaRecorder(
          cues,
          settings,
          cfg,
          recorderChoice,
          isCancelled,
          safeProgress,
          safeComplete,
          safeError,
          registerCleanup
        );
        return;
      }

      throw new Error('当前浏览器不支持 MP4 视频编码导出，请使用最新版 Chrome、Edge 或 Safari');
    } catch (err) {
      safeError(err instanceof Error ? err.message : 'MP4 导出失败');
    }
  };

  run();

  return {
    cancel: () => {
      cancelled = true;
      activeCleanup?.();
      activeCleanup = null;
    },
  };
}
