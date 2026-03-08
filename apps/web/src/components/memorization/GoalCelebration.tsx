import { useTranslation } from "~/hooks/useTranslation";

interface GoalCelebrationProps {
  onBackToPanel: () => void;
  onContinue: () => void;
}

export function GoalCelebration({ onBackToPanel, onContinue }: GoalCelebrationProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-sm animate-scale-in rounded-2xl bg-[var(--theme-bg-primary)] p-8 text-center shadow-[var(--shadow-float)]">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="mb-2 text-xl font-bold text-[var(--theme-text)]">
          {t.memorize.goalCelebration.title}
        </h2>
        <p className="mb-6 text-[14px] text-[var(--theme-text-tertiary)]">
          {t.memorize.goalCelebration.subtitle}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full rounded-xl bg-primary-600 py-3 text-[15px] font-semibold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-[0.98]"
          >
            {t.memorize.goalCelebration.continue}
          </button>
          <button
            onClick={onBackToPanel}
            className="w-full rounded-xl bg-[var(--theme-hover-bg)] py-3 text-[15px] font-medium text-[var(--theme-text-secondary)] transition-all hover:bg-[var(--theme-pill-bg)]"
          >
            {t.memorize.backToPanel}
          </button>
        </div>
      </div>
    </div>
  );
}
