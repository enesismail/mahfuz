import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  qcfPageQueryOptions,
  loadQcfFont,
  getQcfFontFamily,
  useQcfPreload,
  type QcfWord,
} from "~/hooks/useQcfPage";
import { useAudioStore } from "~/stores/useAudioStore";

interface MushafPageImageProps {
  pageNumber: number;
  onVerseTap?: (verseKey: string) => void;
}

export function MushafPageImage({ pageNumber, onVerseTap }: MushafPageImageProps) {
  const { data, isLoading, error } = useQuery(qcfPageQueryOptions(pageNumber));
  const [fontReady, setFontReady] = useState(false);
  const currentVerseKey = useAudioStore((s) => s.currentVerseKey);

  // Load the QCF font for this page
  useEffect(() => {
    setFontReady(false);
    loadQcfFont(pageNumber).then(
      () => setFontReady(true),
      () => setFontReady(true), // render even on font error
    );
  }, [pageNumber]);

  // Preload adjacent pages
  useQcfPreload(pageNumber);

  const fontFamily = getQcfFontFamily(pageNumber);

  const handleWordClick = useCallback(
    (word: QcfWord) => {
      if (word.char_type_name === "word" || word.char_type_name === "end") {
        onVerseTap?.(word.verse_key);
      }
    },
    [onVerseTap],
  );

  // Build line numbers array (1-15 for standard Medina mushaf)
  const lineNumbers = useMemo(() => {
    if (!data) return [];
    const nums = Array.from(data.lines.keys()).sort((a, b) => a - b);
    return nums;
  }, [data]);

  // Skeleton while loading
  if (isLoading || !fontReady || !data) {
    return (
      <div className="mushaf-page">
        <div className="mushaf-cetvel-outer">
          <div className="mushaf-tezhip-band">
            <div className="mushaf-hatayi-pattern" />
            <div className="mushaf-cetvel-inner">
              <div className="mushaf-qcf-content" style={{ direction: "rtl" }}>
                {Array.from({ length: 15 }, (_, i) => (
                  <div key={i} className="mushaf-qcf-line-skeleton skeleton" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--theme-text-tertiary)]">
        <p>Sayfa yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="mushaf-page">
      <div className="mushaf-cetvel-outer">
        <div className="mushaf-tezhip-band">
          <div className="mushaf-hatayi-pattern" />
          <div className="mushaf-cetvel-inner">
            <div className="mushaf-qcf-content" style={{ direction: "rtl" }}>
              {lineNumbers.map((lineNum) => {
                const words = data.lines.get(lineNum) ?? [];
                return (
                  <p
                    key={lineNum}
                    className="mushaf-qcf-line"
                    style={{ fontFamily: `"${fontFamily}", "KFGQPC Uthmani Hafs", serif` }}
                  >
                    {words.map((word) => {
                      const isActive = currentVerseKey === word.verse_key;
                      return (
                        <span
                          key={word.id}
                          className={`mushaf-qcf-word${isActive ? " mushaf-qcf-word-active" : ""}`}
                          onClick={() => handleWordClick(word)}
                          data-verse-key={word.verse_key}
                          data-char-type={word.char_type_name}
                        >
                          {word.code_v2}
                        </span>
                      );
                    })}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
