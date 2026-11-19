import { Download, Loader2, X } from 'lucide-react';
import type { ExportStatus } from '../video/types';

export type PanelTab = 'storyboard' | 'subtitles' | 'controls';

interface TopBarProps {
  currentTime: number;
  onJumpChapter: (time: number) => void;
  exportStatus: ExportStatus;
  onStartExport: () => void;
  onCancelExport: () => void;
}

const CHAPTER_NAV: Array<{ id: string; label: string; start: number; end: number; seekTo: number }> = [
  { id: 'prologue', label: '序幕', start: 0, end: 29.866, seekTo: 0 },
  { id: 'dawn', label: '萌芽诞生', start: 29.866, end: 95.733, seekTo: 43.2 },
  { id: 'winter', label: '幻灭寒冬', start: 95.733, end: 163.9, seekTo: 98.5 },
  { id: 'data', label: '数据深蓝', start: 163.9, end: 212.266, seekTo: 164.5 },
  { id: 'deeplearning', label: '深度学习', start: 212.266, end: 260.066, seekTo: 212.8 },
  { id: 'agi', label: '大模型曙光', start: 260.066, end: 272.0, seekTo: 261.2 },
];

export function TopBar({
  currentTime,
  onJumpChapter,
  exportStatus,
  onStartExport,
  onCancelExport,
}: TopBarProps) {
  const isExporting = exportStatus.state === 'recording' || exportStatus.state === 'encoding';

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-[#07080B]/95 backdrop-blur-sm px-4 lg:px-6 flex items-center justify-between gap-8 shrink-0">
      {/* Zone 1: Single-line Brand Title */}
      <span className="font-display text-base lg:text-lg font-bold tracking-tight text-zinc-100 whitespace-nowrap shrink-0">
        AI 发展史 · 16-Bit 成片
      </span>

      {/* Zone 2: Clean 4-Chapter Direct Navigation */}
      <nav aria-label="章节快捷跳转" className="hidden md:flex items-center gap-7">
        {CHAPTER_NAV.map((chapter) => {
          const isActive = currentTime >= chapter.start && currentTime < chapter.end;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onJumpChapter(chapter.seekTo)}
              aria-current={isActive ? 'true' : undefined}
              className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm ${
                isActive ? 'text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {chapter.label}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-[17px] h-[2px] bg-amber-500"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Single Primary Action */}
      <div className="flex items-center gap-2 shrink-0">
        {isExporting ? (
          <button
            type="button"
            onClick={onCancelExport}
            aria-label="取消导出视频"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span className="font-mono-tabular">
              导出中 {Math.round(exportStatus.progress * 100)}%
            </span>
            <X className="w-3.5 h-3.5 ml-0.5" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartExport}
            aria-label="导出 16-Bit 成片视频"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080B]"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>导出成片视频</span>
          </button>
        )}
      </div>
    </header>
  );
}
