import { useRef, useEffect, useMemo } from "react";
import type { Verse } from "@mahfuz/shared/types";
import { usePreferencesStore } from "~/stores/usePreferencesStore";
import { useTranslation } from "~/hooks/useTranslation";

interface QcfMealPanelProps {
  verses: Verse[];
  /** QCF page number — filters verses to only those on this page */
  pageNumber: number;
  /** Currently active verse key (for highlight + auto-scroll) */
  currentVerseKey?: string;
}

/**
 * Translation panel displayed next to QCF mushaf pages.
 * Shows verse-by-verse translations for the given page,
 * with active verse highlighting and auto-scroll.
 */
export function QcfMealPanel({ verses, pageNumber, currentVerseKey }: QcfMealPanelProps) {
  const mushafTranslationFontSize = usePreferencesStore((s) => s.mushafTranslationFontSize);
  const { t } = useTranslation();

  // Filter verses that belong to this page (by Medine page mapping)
  const pageVerses = useMemo(() => {
    return verses.filter((v) => v.page_number === pageNumber);
  }, [verses, pageNumber]);

  const highlightedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to highlighted verse
  useEffect(() => {
    if (currentVerseKey && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [currentVerseKey]);

  if (pageVerses.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p className="text-[13px] text-[var(--theme-text-quaternary)]">{t.common.page} {pageNumber}</p>
      </div>
    );
  }

  return (
    <div className="mushaf-qcf-meal-panel">
      <div className="mb-2 text-[10px] font-medium text-[var(--theme-text-quaternary)]">
        {t.common.page} {pageNumber}
      </div>
      <div className="space-y-3">
        {pageVerses.map((verse) => {
          const isHighlighted = currentVerseKey === verse.verse_key;
          return (
            <div
              key={verse.id}
              ref={isHighlighted ? highlightedRef : undefined}
              className={`rounded-lg px-2.5 py-2 transition-colors ${
                isHighlighted
                  ? "bg-primary-600/10 ring-1 ring-primary-600/20"
                  : ""
              }`}
            >
              <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--theme-verse-number-bg)] text-[10px] font-semibold tabular-nums text-[var(--theme-text-tertiary)]">
                {verse.verse_number}
              </span>
              {verse.translations?.map((tr, i) => (
                <p
                  key={i}
                  className="mt-1 font-sans leading-[1.8] text-[var(--theme-text-secondary)]"
                  style={{ fontSize: `calc(14px * ${mushafTranslationFontSize})` }}
                  dangerouslySetInnerHTML={{ __html: tr.text }}
                />
              ))}
              {(!verse.translations || verse.translations.length === 0) && (
                <p className="mt-1 text-[12px] italic text-[var(--theme-text-quaternary)]">—</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
