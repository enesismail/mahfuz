/**
 * Hıfz durumu — kullanıcı ezberlediği sure ve ayetleri işaretler.
 *
 * Sure satırında: checkbox (tek tık → tamamını seç/kaldır) + chevron (ayet detayı).
 */

import { useState, useMemo, useCallback } from "react";
import { useHifzStore, computeHifzStats, SURAH_VERSE_COUNTS, TOTAL_VERSES } from "~/stores/hifz.store";
import { getSurahName } from "~/lib/surah-names-i18n";
import { useLocaleStore } from "~/stores/locale.store";
import { useTranslation } from "~/hooks/useTranslation";

/** Cüz → sure aralıkları */
const JUZ_SURAH_RANGES: [number, number][] = [
  [1, 2], [2, 2], [2, 3], [3, 4], [4, 4], [4, 5], [5, 6], [6, 7], [7, 7], [8, 9],
  [9, 11], [11, 12], [12, 14], [15, 16], [17, 17], [18, 18], [21, 22], [23, 25], [25, 27], [27, 29],
  [29, 33], [33, 36], [36, 38], [39, 41], [41, 45], [46, 51], [51, 57], [58, 66], [67, 77], [78, 114],
];

const EMPTY_ARR: number[] = [];

/* ── Dairesel ilerleme ─────────────────────────────── */

function ProgressRing({ percentage, size = 120 }: { percentage: number; size?: number }) {
  const stroke = size > 60 ? 8 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="var(--color-accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-500 ease-out"
      />
    </svg>
  );
}

/* ── Checkbox ikonu ────────────────────────────────── */

function CheckIcon({ state }: { state: "none" | "partial" | "complete" }) {
  if (state === "complete") {
    return (
      <span className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6l2.5 2.5 4.5-4.5" />
        </svg>
      </span>
    );
  }
  if (state === "partial") {
    return (
      <span className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h6" />
        </svg>
      </span>
    );
  }
  return (
    <span className="w-5 h-5 rounded border-2 border-[var(--color-border)] flex items-center justify-center shrink-0">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M5 2v6M2 5h6" />
      </svg>
    </span>
  );
}

/* ── Ayet aralığı metni ────────────────────────────── */

function versesToRangeText(verses: number[], total: number, allLabel: string): string {
  if (verses.length === 0) return "";
  if (verses.length === total) return allLabel;
  const ranges: string[] = [];
  let start = verses[0];
  let prev = verses[0];
  for (let i = 1; i <= verses.length; i++) {
    const cur = verses[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      ranges.push(start === prev ? String(start) : `${start}-${prev}`);
      start = cur;
      prev = cur;
    }
  }
  return ranges.join(", ");
}

/* ── Sure ayet detay paneli ────────────────────────── */

function SurahDetail({ surahId }: { surahId: number }) {
  const { t } = useTranslation();
  const h = t.profile.hifz;

  const memorized = useHifzStore((s) => s.memorized[surahId]) ?? EMPTY_ARR;
  const toggleVerse = useHifzStore((s) => s.toggleVerse);
  const addRange = useHifzStore((s) => s.addRange);

  const totalVerses = SURAH_VERSE_COUNTS[surahId] ?? 0;

  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  const handleAddRange = useCallback(() => {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);
    if (from >= 1 && to >= from && to <= totalVerses) {
      addRange(surahId, from, to);
      setRangeFrom("");
      setRangeTo("");
    }
  }, [rangeFrom, rangeTo, surahId, totalVerses, addRange]);

  const memorizedSet = useMemo(() => new Set(memorized), [memorized]);

  return (
    <div className="mt-1 ml-7 mr-1 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
      {/* Aralık ekleme */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <input
          type="number"
          min={1}
          max={totalVerses}
          value={rangeFrom}
          onChange={(e) => setRangeFrom(e.target.value)}
          placeholder={h.from}
          className="w-16 px-2 py-1 text-xs rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-center"
        />
        <span className="text-[0.65rem] text-[var(--color-text-secondary)]">–</span>
        <input
          type="number"
          min={1}
          max={totalVerses}
          value={rangeTo}
          onChange={(e) => setRangeTo(e.target.value)}
          placeholder={h.to}
          className="w-16 px-2 py-1 text-xs rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-center"
        />
        <button
          type="button"
          onClick={handleAddRange}
          disabled={!rangeFrom || !rangeTo}
          className="px-2.5 py-1 text-[0.65rem] font-medium rounded-lg bg-[var(--color-accent)] text-white disabled:opacity-30 transition-colors"
        >
          {h.addRange}
        </button>
      </div>

      {/* Ayet grid */}
      <div className="grid grid-cols-7 sm:grid-cols-10 gap-1 max-h-48 overflow-y-auto">
        {Array.from({ length: totalVerses }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => toggleVerse(surahId, v)}
            className={`h-7 text-[0.6rem] font-medium rounded-md transition-colors ${
              memorizedSet.has(v)
                ? "bg-emerald-500 text-white"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-emerald-500/15"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Seçili aralık özeti */}
      {memorized.length > 0 && memorized.length < totalVerses && (
        <p className="text-[0.6rem] text-[var(--color-text-secondary)] mt-2">
          {versesToRangeText(memorized, totalVerses, h.allVersesSelected)}
        </p>
      )}
    </div>
  );
}

/* ── Sure satırı ───────────────────────────────────── */

function SurahRow({
  surahId,
  isOpen,
  onToggleOpen,
}: {
  surahId: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const h = t.profile.hifz;

  const verses = useHifzStore((s) => s.memorized[surahId]) ?? EMPTY_ARR;
  const toggleAllVerses = useHifzStore((s) => s.toggleAllVerses);

  const total = SURAH_VERSE_COUNTS[surahId] ?? 0;
  const count = verses.length;
  const checkState = count === 0 ? "none" : count === total ? "complete" : "partial";
  const name = getSurahName(surahId, locale);

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${
          checkState === "complete"
            ? "bg-emerald-500/10"
            : checkState === "partial"
              ? "bg-amber-500/5"
              : "hover:bg-[var(--color-bg)]"
        }`}
      >
        {/* Checkbox — tamamını seç/kaldır */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleAllVerses(surahId); }}
          className="p-0.5 shrink-0"
          aria-label={h.selectAll}
        >
          <CheckIcon state={checkState} />
        </button>

        {/* Sure bilgisi — expand toggle */}
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex-1 flex items-center gap-2 min-w-0 text-left"
        >
          {/* Sure numarası */}
          <span className="w-5 text-[0.6rem] font-bold text-[var(--color-text-secondary)] text-center shrink-0">
            {surahId}
          </span>
          {/* İsim + ayet bilgisi */}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${
              checkState === "complete" ? "text-emerald-700 dark:text-emerald-400"
                : checkState === "partial" ? "text-amber-700 dark:text-amber-400" : ""
            }`}>
              {name}
            </p>
            <p className="text-[0.55rem] text-[var(--color-text-secondary)]">
              {count > 0 ? `${count}/${total} ${h.verses}` : `${total} ${h.verses}`}
            </p>
          </div>
          {/* Kısmi yüzde */}
          {checkState === "partial" && (
            <span className="text-[0.6rem] font-bold text-amber-500 shrink-0">
              %{Math.round((count / total) * 100)}
            </span>
          )}
          {/* Chevron */}
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round"
            className={`text-[var(--color-text-secondary)] shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </button>
      </div>

      {/* Ayet detay paneli */}
      {isOpen && <SurahDetail surahId={surahId} />}
    </div>
  );
}

/* ── Ana bileşen ───────────────────────────────────── */

export function HifzStatus() {
  const { t } = useTranslation();
  const memorized = useHifzStore((s) => s.memorized);

  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [openSurah, setOpenSurah] = useState<number | null>(null);

  const stats = useMemo(() => computeHifzStats(memorized), [memorized]);

  const surahIds = useMemo(() => {
    if (!selectedJuz) return Array.from({ length: 114 }, (_, i) => i + 1);
    const [start, end] = JUZ_SURAH_RANGES[selectedJuz - 1];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [selectedJuz]);

  const h = t.profile.hifz;

  const summaryText = useMemo(() => {
    if (stats.activeSurahs === 0) return h.empty;
    const parts: string[] = [];
    if (stats.completeSurahs > 0)
      parts.push(h.completeSurahs.replace("{n}", String(stats.completeSurahs)));
    if (stats.activeSurahs > stats.completeSurahs)
      parts.push(h.partialSurahs.replace("{n}", String(stats.activeSurahs - stats.completeSurahs)));
    parts.push(`${stats.totalVerses} ${h.verses} (%${stats.percentage})`);
    return parts.join(" · ");
  }, [stats, h]);

  return (
    <section className="mb-6">
      {/* Başlık kartı */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface)]/80"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <ProgressRing percentage={stats.percentage} size={48} />
            <span className="absolute text-[0.6rem] font-bold text-[var(--color-accent)]">
              {stats.percentage > 0 ? `%${stats.percentage}` : "—"}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">{h.title}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{summaryText}</p>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round"
          className={`text-[var(--color-text-secondary)] shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          {/* Büyük ilerleme */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative flex items-center justify-center">
              <ProgressRing percentage={stats.percentage} size={120} />
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-[var(--color-accent)]">%{stats.percentage}</span>
                <p className="text-[0.6rem] text-[var(--color-text-secondary)]">{stats.totalVerses}/{TOTAL_VERSES}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-2 text-center">
              {stats.completeSurahs > 0 && h.completeSurahs.replace("{n}", String(stats.completeSurahs))}
              {stats.activeSurahs > stats.completeSurahs && (
                <>{stats.completeSurahs > 0 && " · "}{h.partialSurahs.replace("{n}", String(stats.activeSurahs - stats.completeSurahs))}</>
              )}
            </p>
          </div>

          {/* Cüz filtreleme */}
          <div className="mb-3">
            <span className="text-xs font-medium text-[var(--color-text-secondary)] block mb-1.5">{h.filterByJuz}</span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSelectedJuz(null)}
                className={`px-2 py-0.5 text-[0.65rem] rounded-md transition-colors ${
                  !selectedJuz
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                }`}
              >
                {h.allSurahs}
              </button>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                const [start, end] = JUZ_SURAH_RANGES[juz - 1];
                const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                const complete = ids.filter(
                  (id) => (memorized[id]?.length ?? 0) === (SURAH_VERSE_COUNTS[id] ?? 0),
                ).length;
                const hasAny = ids.some((id) => (memorized[id]?.length ?? 0) > 0);
                const allComplete = complete === ids.length;

                return (
                  <button
                    key={juz}
                    type="button"
                    onClick={() => setSelectedJuz(selectedJuz === juz ? null : juz)}
                    className={`px-2 py-0.5 text-[0.65rem] rounded-md transition-colors ${
                      selectedJuz === juz
                        ? "bg-[var(--color-accent)] text-white"
                        : allComplete
                          ? "bg-emerald-500/15 text-emerald-600"
                          : hasAny
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]"
                    }`}
                  >
                    {juz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sure listesi */}
          <div className="space-y-0.5 max-h-[55vh] overflow-y-auto pr-1">
            {surahIds.map((id) => (
              <SurahRow
                key={id}
                surahId={id}
                isOpen={openSurah === id}
                onToggleOpen={() => setOpenSurah(openSurah === id ? null : id)}
              />
            ))}
          </div>

          {/* Açıklama */}
          <p className="text-[0.6rem] text-[var(--color-text-secondary)] text-center mt-3">{h.hint}</p>
        </div>
      )}
    </section>
  );
}
