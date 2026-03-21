import type { ReadingPreset } from "./constants";
import { useDisplayPrefs } from "~/stores/useDisplayPrefs";
import { useReadingPrefs } from "~/stores/useReadingPrefs";

export function applyPreset(preset: ReadingPreset) {
  const { overrides } = preset;

  if (overrides.theme !== undefined) {
    useDisplayPrefs.getState().setTheme(overrides.theme);
  }
  if (overrides.arabicFontSize !== undefined) {
    useReadingPrefs.getState().setNormalArabicFontSize(overrides.arabicFontSize);
  }
  if (overrides.viewMode !== undefined) {
    useReadingPrefs.getState().setViewMode(overrides.viewMode);
  }
  if (overrides.showTranslation !== undefined) {
    useReadingPrefs.getState().setNormalShowTranslation(overrides.showTranslation);
  }
  if (overrides.wbwShowWordTranslation !== undefined) {
    useReadingPrefs.getState().setWbwShowWordTranslation(overrides.wbwShowWordTranslation);
  }
  if (overrides.wbwShowWordTransliteration !== undefined) {
    useReadingPrefs.getState().setWbwShowWordTransliteration(overrides.wbwShowWordTransliteration);
  }
  if (overrides.wbwShowGrammar !== undefined) {
    useReadingPrefs.getState().setWbwShowGrammar(overrides.wbwShowGrammar);
  }
  if (overrides.mushafShowTranslation !== undefined) {
    useReadingPrefs.getState().setMushafShowTranslation(overrides.mushafShowTranslation);
  }
}
