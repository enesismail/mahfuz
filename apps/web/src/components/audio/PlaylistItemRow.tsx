import { useState } from "react";
import { useTranslation } from "~/hooks/useTranslation";
import type { PlaylistItem } from "~/stores/usePlaylistStore";

interface PlaylistItemRowProps {
  item: PlaylistItem;
  index: number;
  isPlaying: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (id: string, patch: Partial<Pick<PlaylistItem, "fromVerse" | "toVerse" | "repeatCount">>) => void;
  onRemove: (id: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onSplit: (id: string, chunkSize: number) => void;
}

export function PlaylistItemRow({
  item,
  index,
  isPlaying,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
  onSplit,
}: PlaylistItemRowProps) {
  const { t } = useTranslation();
  const [splitOpen, setSplitOpen] = useState(false);

  const isAllVerses = item.fromVerse === 1 && item.toVerse === item.versesCount;
  const verseCount = item.toVerse - item.fromVerse + 1;
  const isInfinite = item.repeatCount === 0;

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        isPlaying
          ? "border-primary-500/40 bg-primary-50/50 dark:bg-primary-900/20"
          : "border-[var(--theme-border)] bg-[var(--theme-bg-secondary)]"
      }`}
    >
      {/* Top row: index, name, actions */}
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--theme-bg-tertiary)] text-[11px] font-semibold text-[var(--theme-text-secondary)]">
          {index + 1}
        </span>
        {isPlaying && (
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary-500" />
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block truncate text-[14px] font-medium text-[var(--theme-text)]">
            {item.surahNameTr}
          </span>
          <span className="block text-[12px] text-[var(--theme-text-tertiary)]">
            {item.surahNameAr}
          </span>
        </span>
        <div className="flex items-center gap-0.5">
          {/* Split button — only if range has >1 verse */}
          {verseCount > 1 && (
            <button
              onClick={() => setSplitOpen(!splitOpen)}
              className={`rounded-lg p-1.5 transition-colors ${splitOpen ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30" : "text-[var(--theme-text-tertiary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-text)]"}`}
              aria-label={t.playlist.split}
              title={t.playlist.split}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          )}
          {!isFirst && (
            <button
              onClick={() => onMove(index, index - 1)}
              className="rounded-lg p-1.5 text-[var(--theme-text-tertiary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-text)]"
              aria-label={t.playlist.moveUp}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          {!isLast && (
            <button
              onClick={() => onMove(index, index + 1)}
              className="rounded-lg p-1.5 text-[var(--theme-text-tertiary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-text)]"
              aria-label={t.playlist.moveDown}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="rounded-lg p-1.5 text-[var(--theme-text-tertiary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            aria-label={t.playlist.remove}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Verse range + repeat row */}
      <div className="flex items-center gap-3 text-[13px]">
        {/* Verse range */}
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--theme-text-tertiary)]">{t.playlist.verseRange}:</span>
          <input
            type="number"
            min={1}
            max={item.toVerse}
            value={item.fromVerse}
            onChange={(e) => {
              const v = Math.max(1, Math.min(item.toVerse, Number(e.target.value) || 1));
              onUpdate(item.id, { fromVerse: v });
            }}
            className="w-14 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-input-bg)] px-2 py-1 text-center text-[13px] text-[var(--theme-text)] outline-none focus:border-primary-500/40"
          />
          <span className="text-[var(--theme-text-quaternary)]">–</span>
          <input
            type="number"
            min={item.fromVerse}
            max={item.versesCount}
            value={item.toVerse}
            onChange={(e) => {
              const v = Math.max(item.fromVerse, Math.min(item.versesCount, Number(e.target.value) || item.fromVerse));
              onUpdate(item.id, { toVerse: v });
            }}
            className="w-14 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-input-bg)] px-2 py-1 text-center text-[13px] text-[var(--theme-text)] outline-none focus:border-primary-500/40"
          />
          {isAllVerses && (
            <span className="text-[11px] text-[var(--theme-text-quaternary)]">({t.playlist.allVerses})</span>
          )}
        </div>

        {/* Repeat stepper with ∞ */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[var(--theme-text-tertiary)] mr-0.5">{t.playlist.repeat}:</span>
          {/* Decrement */}
          <button
            onClick={() => {
              if (isInfinite) {
                onUpdate(item.id, { repeatCount: 10 });
              } else if (item.repeatCount > 1) {
                onUpdate(item.id, { repeatCount: item.repeatCount - 1 });
              }
            }}
            disabled={!isInfinite && item.repeatCount <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--theme-border)] bg-[var(--theme-input-bg)] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-hover-bg)] disabled:opacity-30"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          {/* Value */}
          <span className="flex h-7 min-w-[32px] items-center justify-center text-[13px] font-semibold text-[var(--theme-text)]">
            {isInfinite ? "∞" : `${item.repeatCount}x`}
          </span>
          {/* Increment */}
          <button
            onClick={() => {
              if (isInfinite) return;
              onUpdate(item.id, { repeatCount: item.repeatCount + 1 });
            }}
            disabled={isInfinite}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--theme-border)] bg-[var(--theme-input-bg)] text-[var(--theme-text-secondary)] transition-colors hover:bg-[var(--theme-hover-bg)] disabled:opacity-30"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          {/* Infinity toggle */}
          <button
            onClick={() => onUpdate(item.id, { repeatCount: isInfinite ? 1 : 0 })}
            className={`ml-0.5 flex h-7 w-7 items-center justify-center rounded-lg border text-[14px] font-bold transition-colors ${
              isInfinite
                ? "border-primary-500/40 bg-primary-100 text-primary-600 dark:bg-primary-900/30"
                : "border-[var(--theme-border)] bg-[var(--theme-input-bg)] text-[var(--theme-text-quaternary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-text-secondary)]"
            }`}
            title={t.playlist.infinite}
          >
            ∞
          </button>
        </div>
      </div>

      {/* Split panel (collapsible) */}
      {splitOpen && verseCount > 1 && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--theme-bg-tertiary)] px-3 py-2">
          <span className="text-[12px] text-[var(--theme-text-secondary)]">{t.playlist.splitInto}:</span>
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 5, 10].filter((n) => n < verseCount).map((n) => (
              <button
                key={n}
                onClick={() => {
                  onSplit(item.id, n);
                  setSplitOpen(false);
                }}
                className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-bg-primary)] px-2.5 py-1 text-[12px] font-medium text-[var(--theme-text)] transition-colors hover:border-primary-500/40 hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
              >
                {n === 1
                  ? t.playlist.perVerse
                  : t.playlist.nVerses.replace("{n}", String(n))}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
