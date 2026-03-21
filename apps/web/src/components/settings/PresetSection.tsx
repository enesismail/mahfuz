import { READING_PRESETS, type ReadingPreset } from "~/lib/constants";
import { applyPreset } from "~/lib/apply-preset";
import { useDisplayPrefs } from "~/stores/useDisplayPrefs";
import { useReadingPrefs } from "~/stores/useReadingPrefs";
import { useTranslation } from "~/hooks/useTranslation";

function isPresetActive(preset: ReadingPreset): boolean {
  const display = useDisplayPrefs.getState();
  const reading = useReadingPrefs.getState();
  const { overrides } = preset;

  if (overrides.theme !== undefined && display.theme !== overrides.theme) return false;
  if (overrides.viewMode !== undefined && reading.viewMode !== overrides.viewMode) return false;
  if (overrides.showTranslation !== undefined && reading.normalShowTranslation !== overrides.showTranslation) return false;
  return true;
}

const PRESET_ICONS = ["\u{1F319}", "\u{1F4D6}", "\u{1F4D7}", "\u{2699}\u{FE0F}"];

export function PresetSection() {
  const { t } = useTranslation();
  const theme = useDisplayPrefs((s) => s.theme);
  const viewMode = useReadingPrefs((s) => s.viewMode);

  return (
    <div>
      <h3 className="mb-2 text-[13px] font-semibold text-[var(--theme-text)]">{t.presets.title}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {READING_PRESETS.map((preset, i) => {
          const active = isPresetActive(preset);
          const presetNames = [t.presets.nightReading, t.presets.studyMode, t.presets.mushafMode, t.presets.default];
          const presetDescs = [t.presets.nightReadingDesc, t.presets.studyModeDesc, t.presets.mushafModeDesc, t.presets.defaultDesc];
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-all ${
                active
                  ? "border-primary-500 bg-primary-600/10"
                  : "border-[var(--theme-border)] bg-[var(--theme-bg-primary)] hover:border-[var(--theme-divider)]"
              }`}
            >
              <span className="text-[20px]">{PRESET_ICONS[i]}</span>
              <span className="text-[12px] font-medium text-[var(--theme-text)]">{presetNames[i]}</span>
              <span className="text-[10px] text-[var(--theme-text-tertiary)]">{presetDescs[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
