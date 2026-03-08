import type { MemorizationStats, ConfidenceLevel } from "@mahfuz/shared/types";
import { useTranslation } from "~/hooks/useTranslation";

const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  struggling: "bg-red-500",
  learning: "bg-orange-400",
  familiar: "bg-yellow-400",
  confident: "bg-blue-500",
  mastered: "bg-emerald-500",
};

interface StatsOverviewProps {
  stats: MemorizationStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const { t } = useTranslation();
  const accuracy = Math.round(stats.averageAccuracy * 100);
  const total = stats.totalCards || 1;

  return (
    <div className="rounded-2xl bg-[var(--theme-bg-primary)] p-6 shadow-[var(--shadow-card)]">
      {/* Top row: key numbers */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBox
          label={t.memorize.stats.dueToday}
          value={stats.dueToday}
          accent
        />
        <StatBox label={t.memorize.stats.reviewedToday} value={stats.reviewedToday} />
        <StatBox
          label={t.memorize.stats.streak}
          value={stats.currentStreak}
          suffix={` ${t.memorize.stats.streakSuffix}`}
        />
        <StatBox label={t.memorize.stats.accuracy} value={accuracy} suffix="%" />
      </div>

      {/* Confidence distribution */}
      <div>
        <p className="mb-2 text-[13px] font-medium text-[var(--theme-text-secondary)]">
          {t.memorize.stats.confidenceDist} ({stats.totalCards} {t.common.verse})
        </p>
        <div className="flex h-3 overflow-hidden rounded-full bg-[var(--theme-hover-bg)]">
          {(Object.keys(CONFIDENCE_COLORS) as ConfidenceLevel[]).map((level) => {
            const count = stats.byConfidence[level] || 0;
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={level}
                className={`${CONFIDENCE_COLORS[level]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${t.memorize.confidence[level]}: ${count}`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {(Object.keys(CONFIDENCE_COLORS) as ConfidenceLevel[]).map((level) => {
            const count = stats.byConfidence[level] || 0;
            if (count === 0) return null;
            return (
              <div key={level} className="flex items-center gap-1.5">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${CONFIDENCE_COLORS[level]}`}
                />
                <span className="text-[12px] text-[var(--theme-text-tertiary)]">
                  {t.memorize.confidence[level]} ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={`text-2xl font-bold ${accent ? "text-primary-600" : "text-[var(--theme-text)]"}`}
      >
        {value}
        {suffix && (
          <span className="text-sm font-normal text-[var(--theme-text-tertiary)]">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-[12px] text-[var(--theme-text-tertiary)]">
        {label}
      </p>
    </div>
  );
}
