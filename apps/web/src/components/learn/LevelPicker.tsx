import { useTranslation } from "~/hooks/useTranslation";
import { useAppUI } from "~/stores/useAppUI";
import { LEVELS, type LevelId } from "@mahfuz/shared/types";
import { resolveNestedKey } from "~/lib/i18n-utils";

const LEVEL_COLORS: Record<number, { bg: string; border: string; text: string; icon: string }> = {
  1: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    icon: "bg-blue-100 dark:bg-blue-900/40",
  },
  2: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-400",
    icon: "bg-violet-100 dark:bg-violet-900/40",
  },
  3: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    icon: "bg-amber-100 dark:bg-amber-900/40",
  },
  4: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "bg-emerald-100 dark:bg-emerald-900/40",
  },
};

interface LevelPickerProps {
  onSelect?: (levelId: LevelId) => void;
}

export function LevelPicker({ onSelect }: LevelPickerProps) {
  const { t } = useTranslation();
  const { setSelectedLearnLevel, setHasPickedLearnLevel } = useAppUI();

  const handleSelect = (levelId: LevelId) => {
    setSelectedLearnLevel(levelId);
    setHasPickedLearnLevel(true);
    onSelect?.(levelId);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[var(--theme-text)]">
          {t.learn.levels.pickTitle}
        </h2>
        <p className="mt-1 text-[13px] text-[var(--theme-text-secondary)]">
          {t.learn.levels.pickSubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {LEVELS.map((level) => {
          const color = LEVEL_COLORS[level.id];
          const title = resolveNestedKey(t.learn as Record<string, any>, level.titleKey) || level.titleKey;
          const subtitle = resolveNestedKey(t.learn as Record<string, any>, level.subtitleKey) || level.subtitleKey;
          const desc = resolveNestedKey(t.learn as Record<string, any>, level.descriptionKey) || level.descriptionKey;

          return (
            <button
              key={level.id}
              onClick={() => handleSelect(level.id)}
              className={`group flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 active:scale-[0.99] ${color.border} ${color.bg}`}
            >
              {/* Icon */}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[24px] ${color.icon}`}
              >
                {level.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-[16px] font-bold ${color.text}`}>
                    {title}
                  </h3>
                  <span className="text-[11px] font-medium text-[var(--theme-text-quaternary)]">
                    {level.stageIds.length} {t.learn.totalStages.toLowerCase?.() || t.learn.totalStages}
                  </span>
                </div>
                <p className="mt-0.5 text-[14px] font-medium text-[var(--theme-text)]">
                  {subtitle}
                </p>
                <p className="mt-1 text-[12px] text-[var(--theme-text-tertiary)]">
                  {desc}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="mt-1 h-5 w-5 shrink-0 text-[var(--theme-text-quaternary)] transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
