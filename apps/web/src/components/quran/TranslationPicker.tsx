import { usePreferencesStore } from "~/stores/usePreferencesStore";
import { LOCAL_TRANSLATIONS } from "@mahfuz/shared/constants";
import { useTranslation } from "~/hooks/useTranslation";

interface TranslationPickerProps {
  compact?: boolean;
}

export function TranslationPicker({ compact }: TranslationPickerProps) {
  const { t } = useTranslation();
  const selectedTranslations = usePreferencesStore((s) => s.selectedTranslations);
  const setSelectedTranslations = usePreferencesStore((s) => s.setSelectedTranslations);

  const selected = LOCAL_TRANSLATIONS.filter((tr) => selectedTranslations.includes(tr.id));
  // Maintain store order
  const orderedSelected = selectedTranslations
    .map((id) => selected.find((tr) => tr.id === id))
    .filter(Boolean) as typeof selected;

  const available = LOCAL_TRANSLATIONS.filter((tr) => !selectedTranslations.includes(tr.id));

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...selectedTranslations];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSelectedTranslations(next);
  };

  const moveDown = (index: number) => {
    if (index >= selectedTranslations.length - 1) return;
    const next = [...selectedTranslations];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSelectedTranslations(next);
  };

  const makePrimary = (index: number) => {
    if (index === 0) return;
    const next = [...selectedTranslations];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    setSelectedTranslations(next);
  };

  const remove = (id: string) => {
    if (selectedTranslations.length <= 1) return;
    setSelectedTranslations(selectedTranslations.filter((tr) => tr !== id));
  };

  const add = (id: string) => {
    setSelectedTranslations([...selectedTranslations, id]);
  };

  const py = compact ? "py-1.5" : "py-2.5";
  const px = compact ? "px-2.5" : "px-3.5";
  const textSize = compact ? "text-[11px]" : "text-[13px]";
  const btnSize = compact ? "h-5 w-5" : "h-6 w-6";
  const iconSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className={compact ? "mt-2" : ""}>
      {/* Selected translations */}
      <span className={`mb-1.5 block font-medium text-[var(--theme-text-tertiary)] ${compact ? "text-[11px]" : "text-[12px]"}`}>
        {t.translationPicker.selected}
      </span>
      <div className="space-y-1">
        {orderedSelected.map((tr, i) => {
          const isPrimary = i === 0;
          return (
            <div
              key={tr.id}
              className={`flex items-center gap-1.5 rounded-xl border ${px} ${py} transition-all ${
                isPrimary
                  ? "border-primary-500/40 bg-primary-600/5"
                  : "border-[var(--theme-divider)] bg-[var(--theme-bg)]"
              }`}
            >
              {/* Star: primary indicator */}
              <button
                type="button"
                onClick={() => makePrimary(i)}
                className={`flex shrink-0 items-center justify-center ${btnSize} rounded-md transition-colors ${
                  isPrimary
                    ? "text-amber-500"
                    : "text-[var(--theme-text-quaternary)] hover:text-amber-400"
                }`}
                title={isPrimary ? t.translationPicker.isPrimary : t.translationPicker.makePrimary}
              >
                {isPrimary ? (
                  <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ) : (
                  <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </button>

              {/* Name + author */}
              <div className="min-w-0 flex-1">
                <span className={`block font-medium leading-tight ${textSize} ${
                  isPrimary ? "text-primary-700" : "text-[var(--theme-text)]"
                }`}>
                  {tr.name}
                </span>
                {!compact && (
                  <span className="block text-[11px] leading-tight text-[var(--theme-text-tertiary)]">
                    {tr.author}
                  </span>
                )}
              </div>

              {/* Move up */}
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  className={`flex shrink-0 items-center justify-center ${btnSize} rounded-md text-[var(--theme-text-quaternary)] transition-colors hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-text-secondary)]`}
                  title={t.translationPicker.moveUp}
                >
                  <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
              )}

              {/* Move down */}
              {i < orderedSelected.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  className={`flex shrink-0 items-center justify-center ${btnSize} rounded-md text-[var(--theme-text-quaternary)] transition-colors hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-text-secondary)]`}
                  title={t.translationPicker.moveDown}
                >
                  <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(tr.id)}
                disabled={selectedTranslations.length <= 1}
                className={`flex shrink-0 items-center justify-center ${btnSize} rounded-md transition-colors ${
                  selectedTranslations.length <= 1
                    ? "cursor-not-allowed text-[var(--theme-text-quaternary)] opacity-30"
                    : "text-[var(--theme-text-quaternary)] hover:bg-red-50 hover:text-red-500"
                }`}
                title={t.common.remove}
              >
                <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Available translations */}
      {available.length > 0 && (
        <>
          <span className={`mt-3 mb-1.5 block font-medium text-[var(--theme-text-tertiary)] ${compact ? "text-[11px]" : "text-[12px]"}`}>
            {t.common.add}
          </span>
          <div className="space-y-1">
            {available.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => add(tr.id)}
                className={`flex w-full items-center gap-1.5 rounded-xl border border-dashed border-[var(--theme-divider)] ${px} ${py} text-left transition-all hover:border-primary-400 hover:bg-primary-600/5`}
              >
                <span className={`flex shrink-0 items-center justify-center ${btnSize} rounded-md text-primary-600`}>
                  <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <span className={`block font-medium leading-tight text-[var(--theme-text-secondary)] ${textSize}`}>
                    {tr.name}
                  </span>
                  {!compact && (
                    <span className="block text-[11px] leading-tight text-[var(--theme-text-tertiary)]">
                      {tr.author}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
