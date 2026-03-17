import { memo } from "react";
import type { RootEntry } from "@mahfuz/shared/types";
import { useTranslation } from "~/hooks/useTranslation";

const ARABIC_TO_LATIN: Record<string, string> = {
  "ا": "ā", "أ": "ā", "إ": "ā", "آ": "ā",
  "ب": "b", "ت": "t", "ث": "th", "ج": "j",
  "ح": "ḥ", "خ": "kh", "د": "d", "ذ": "dh",
  "ر": "r", "ز": "z", "س": "s", "ش": "sh",
  "ص": "ṣ", "ض": "ḍ", "ط": "ṭ", "ظ": "ẓ",
  "ع": "ʿ", "غ": "gh", "ف": "f", "ق": "q",
  "ك": "k", "ل": "l", "م": "m", "ن": "n",
  "ه": "h", "و": "w", "ي": "y", "ء": "ʾ",
};

function transliterateRoot(root: string): string {
  return root
    .split("")
    .map((ch) => ARABIC_TO_LATIN[ch] ?? "")
    .filter(Boolean)
    .join("-");
}

interface RootCardProps {
  entry: RootEntry;
  maxCount: number;
  onClick: () => void;
}

export const RootCard = memo(function RootCard({ entry, maxCount, onClick }: RootCardProps) {
  const { t, locale } = useTranslation();
  const meaning = locale === "en" ? entry.meaning.en : entry.meaning.tr;
  const hasMeaning = Boolean(meaning);
  const normalizedFreq = maxCount > 0 ? Math.max(3, (entry.count / maxCount) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-primary)] text-left transition-all duration-200 hover:border-primary-400/60 hover:shadow-[0_4px_24px_-4px_rgba(var(--color-primary-500-rgb,99,102,241),0.12)] active:scale-[0.97]"
    >
      {/* Top accent line */}
      <div
        className="h-[3px] w-full bg-gradient-to-r from-primary-500/80 via-primary-400/40 to-transparent transition-opacity duration-200 group-hover:opacity-100"
        style={{ opacity: normalizedFreq > 30 ? 1 : 0.3 }}
      />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Root letters */}
        <div className="mb-0.5 flex w-full items-start justify-between gap-2">
          <span
            className="arabic-text text-[28px] font-bold leading-none text-[var(--theme-text)] transition-colors duration-200 group-hover:text-primary-600 sm:text-[32px]"
            dir="rtl"
          >
            {entry.letters}
          </span>
          <span
            className="mt-1 shrink-0 rounded-md bg-[var(--theme-hover-bg)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--theme-text-quaternary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {transliterateRoot(entry.root)}
          </span>
        </div>

        {/* Meaning */}
        <p
          className={`mb-auto line-clamp-2 min-h-[34px] text-[12.5px] leading-relaxed sm:text-[13px] ${
            hasMeaning
              ? "text-[var(--theme-text-secondary)]"
              : "italic text-[var(--theme-text-quaternary)]"
          }`}
        >
          {meaning || t.discover.noMeaning}
        </p>

        {/* Stats footer */}
        <div className="mt-4 flex items-center gap-3">
          {/* Frequency mini-bar */}
          <div className="flex-1">
            <div className="h-[5px] w-full overflow-hidden rounded-full bg-[var(--theme-hover-bg)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
                style={{ width: `${normalizedFreq}%` }}
              />
            </div>
          </div>
          {/* Count badge */}
          <span
            className="shrink-0 text-[11px] font-bold tabular-nums text-primary-600"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {entry.count}
          </span>
        </div>
      </div>
    </button>
  );
});
