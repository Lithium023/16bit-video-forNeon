import { Download, Film, Sliders, Subtitles } from 'lucide-react';
import { CLIP_DURATION, formatTimecode } from '../video/srtParser';
import { SCENE_CUTS } from '../video/timeline';
import type { ExportStatus, RenderSettings, SrtCue } from '../video/types';
import type { PanelTab } from './TopBar';

interface EditorialPanelProps {
  activeTab: PanelTab;
  onSelectTab: (tab: PanelTab) => void;
  currentTime: number;
  cues: SrtCue[];
  settings: RenderSettings;
  exportStatus: ExportStatus;
  onSeek: (time: number) => void;
  onUpdateSettings: (patch: Partial<RenderSettings>) => void;
}

const HIGHLIGHT_JUMPS = [
  { label: '开篇 · AI专题分享', time: 0.25 },
  { label: '人类历史上 · 最魔幻', time: 4.6 },
  { label: '主标题落版', time: 8.65 },
  { label: '反色快切 · 但其实', time: 14.82 },
  { label: '1950 · 阿兰·图灵', time: 43.8 },
  { label: '机器能思考吗？', time: 52.6 },
  { label: '“人工智能”诞生', time: 72.5 },
  { label: 'AI 统治世界？', time: 94.2 },
  { label: '一盆冰水泼下', time: 102.2 },
  { label: '主机过载爆表', time: 120.2 },
  { label: '第一个 AI 寒冬', time: 136.5 },
  { label: '80年代 · 专家系统', time: 156.2 },
  { label: '昙花一现', time: 159.3 },
  { label: '第二次寒冬', time: 162.8 },
  { label: '第三阶段 · 拥抱数据', time: 167.5 },
  { label: '告别硬编码', time: 176.0 },
  { label: '机器学习找规律', time: 186.5 },
  { label: '1997 赛场大幕', time: 192.0 },
  { label: 'IBM 深蓝击败冠军', time: 196.8 },
  { label: '超越人类巅峰', time: 205.8 },
  { label: 'AI 仍是“偏科生”', time: 210.5 },
  { label: '第四阶段 · 深度学习', time: 215.5 },
  { label: '2010s 海量数据', time: 221.2 },
  { label: 'GPU 强大算力', time: 225.5 },
  { label: '神经网络全面爆发', time: 233.2 },
  { label: '2012 AlexNet', time: 238.5 },
  { label: '看清了这个世界', time: 243.0 },
  { label: '2016 AlphaGo 4:1', time: 248.5 },
  { label: '人类智力最后堡垒', time: 252.5 },
  { label: '现代 AI 狂飙序幕', time: 258.5 },
  { label: '第五阶段 · AGI 曙光', time: 269.5 },
];

export function EditorialPanel({
  activeTab,
  onSelectTab,
  currentTime,
  cues,
  settings,
  exportStatus,
  onSeek,
  onUpdateSettings,
}: EditorialPanelProps) {
  return (
    <aside
      aria-label="剪辑分镜与台词面板"
      className="w-full lg:w-[376px] xl:w-[400px] border-t lg:border-t-0 lg:border-l border-zinc-800/90 bg-[#0A0C10] flex flex-col shrink-0 lg:h-full overflow-hidden"
    >
      {/* Mobile-visible segmented panel switcher */}
      <div className="flex items-center gap-1 p-2 border-b border-zinc-800/80 bg-[#07080B] shrink-0">
        {(
          [
            { id: 'storyboard', label: '分镜与转场', icon: Film },
            { id: 'subtitles', label: '口播台词', icon: Subtitles },
            { id: 'controls', label: '画面调校', icon: Sliders },
          ] as const
        ).map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-pressed={active}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Export completed download banner */}
      {exportStatus.state === 'done' && exportStatus.downloadUrl && (
        <div className="mx-4 mt-3 p-3 rounded-md border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-amber-300">16-Bit 动效成片已生成</p>
            <p className="text-[11px] text-zinc-400 truncate">含原声口播同步音轨 (WebM)</p>
          </div>
          <a
            href={exportStatus.downloadUrl}
            download={`AI发展史_16bit成片_271s_${settings.aspectRatio.replace(':', 'x')}.webm`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>下载</span>
          </a>
        </div>
      )}

      {exportStatus.state === 'error' && exportStatus.message && (
        <div className="mx-4 mt-3 p-3 rounded-md border border-rose-500/40 bg-rose-500/10 text-xs text-rose-200">
          {exportStatus.message}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {activeTab === 'storyboard' && (
          <>
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
              <span>{SCENE_CUTS.length} 段节奏分镜 · 点击定位预览</span>
              <span className="font-mono-tabular">{CLIP_DURATION.toFixed(2)}s</span>
            </div>

            {SCENE_CUTS.map((cut) => {
              const isActive =
                currentTime >= cut.start &&
                (currentTime < cut.end || (cut.index === SCENE_CUTS.length && currentTime <= cut.end));

              return (
                <button
                  key={cut.id}
                  type="button"
                  onClick={() => onSeek(cut.start + 0.35)}
                  aria-label={`跳转到镜头 ${cut.index} ${cut.title}`}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900/95 border-amber-500/60'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      <span className="font-mono-tabular text-amber-400 mr-2">
                        {String(cut.index).padStart(2, '0')}.
                      </span>
                      {cut.title}
                    </h3>
                    <span className="font-mono-tabular text-[11px] text-zinc-400 shrink-0">
                      {formatTimecode(cut.start)}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs font-medium text-zinc-200">「{cut.keyLine}」</p>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400 min-w-0">
                    <span
                      style={{ color: cut.accentColor }}
                      className="font-medium whitespace-nowrap shrink-0"
                    >
                      {cut.transitionLabel}
                    </span>
                    <span aria-hidden="true" className="shrink-0">·</span>
                    <span className="min-w-0 truncate">{cut.visualNote}</span>
                  </div>
                </button>
              );
            })}
          </>
        )}

        {activeTab === 'subtitles' && (
          <>
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
              <span>前 271 秒口播 SRT · 共 {cues.length} 句</span>
              <span>点击台词跳转</span>
            </div>

            <div className="divide-y divide-zinc-800/70 border border-zinc-800/80 rounded-lg overflow-hidden bg-zinc-950/50">
              {cues.map((cue) => {
                const isActive = currentTime >= cue.start && currentTime < cue.end;
                return (
                  <button
                    key={cue.id}
                    type="button"
                    onClick={() => onSeek(cue.start + 0.08)}
                    aria-label={`跳转到第 ${cue.id} 句台词：${cue.text}`}
                    className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isActive ? 'bg-amber-500/12' : 'hover:bg-zinc-900/70'
                    }`}
                  >
                    <span
                      className={`font-mono-tabular text-[11px] pt-0.5 shrink-0 ${
                        isActive ? 'text-amber-400 font-semibold' : 'text-zinc-500'
                      }`}
                    >
                      {formatTimecode(cue.start)}
                    </span>
                    <span
                      className={`text-xs leading-relaxed ${
                        isActive ? 'text-zinc-50 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      {cue.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'controls' && (
          <div className="space-y-5">
            {/* Aspect Ratio */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-300 mb-2">画幅构图</h3>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { value: '16:9', title: '16:9 横屏', desc: '纪录片 / B站 / YouTube' },
                    { value: '9:16', title: '9:16 竖屏', desc: '抖音 / 视频号 / Reels' },
                  ] as const
                ).map((item) => {
                  const selected = settings.aspectRatio === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => onUpdateSettings({ aspectRatio: item.value })}
                      aria-pressed={selected}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-zinc-900 border-amber-500/70 text-zinc-50'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-mono-tabular text-xs font-bold">{item.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Intensity Slider */}
            <div className="border-t border-zinc-800/80 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="motion-intensity" className="text-xs font-semibold text-zinc-300">
                  动效与转场张力
                </label>
                <span className="font-mono-tabular text-xs text-amber-400">
                  {Math.round(settings.motionIntensity * 100)}%
                </span>
              </div>
              <input
                id="motion-intensity"
                type="range"
                min={0.6}
                max={1.35}
                step={0.05}
                value={settings.motionIntensity}
                onChange={(e) => onUpdateSettings({ motionIntensity: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Subtitle Layer Toggle */}
            <div className="space-y-2 border-t border-zinc-800/80 pt-4">
              <h3 className="text-xs font-semibold text-zinc-300 mb-2">字幕与画面图层</h3>

              <button
                type="button"
                role="switch"
                aria-checked={settings.showSubtitles}
                onClick={() => onUpdateSettings({ showSubtitles: !settings.showSubtitles })}
                className="w-full p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/60 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-medium text-zinc-100">底部同期口播字幕条</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    在 16-Bit 动态大字之外同步显示原版清晰 SRT 字幕
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
                    settings.showSubtitles ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-zinc-950 transition-transform ${
                      settings.showSubtitles ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Quick Highlight Inspection Jumps */}
            <div className="border-t border-zinc-800/80 pt-4">
              <h3 className="text-xs font-semibold text-zinc-300 mb-2.5">高光定格速览</h3>
              <div className="flex flex-wrap gap-2">
                {HIGHLIGHT_JUMPS.map((jump) => (
                  <button
                    key={jump.label}
                    type="button"
                    onClick={() => onSeek(jump.time)}
                    className="px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/70 hover:border-amber-500/60 hover:text-amber-300 text-xs text-zinc-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {jump.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
