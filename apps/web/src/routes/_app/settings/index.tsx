import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  usePreferencesStore,
  ARABIC_FONTS,
  FONT_GROUPS,
  getArabicFont,
  COLOR_PALETTES,
  getActiveColors,
} from "~/stores/usePreferencesStore";
import type { ViewMode, ColorPaletteId, Theme } from "~/stores/usePreferencesStore";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { TranslationPicker } from "~/components/quran/TranslationPicker";
import { useTranslation } from "~/hooks/useTranslation";
import { useI18nStore } from "~/stores/useI18nStore";
import type { Locale } from "~/stores/useI18nStore";

export const Route = createFileRoute("/_app/settings/")({
  component: SettingsPage,
});

const BISMILLAH =
  "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650";

// SAMPLE_TRANSLATION is now sourced from t.settings.sampleTranslation inside NormalTabContent

const SAMPLE_WORDS = [
  "\u0628\u0650\u0633\u0652\u0645\u0650",
  "\u0627\u0644\u0644\u0651\u064E\u0647\u0650",
  "\u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650",
  "\u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650",
];

const SAMPLE_WORD_TRANSLATIONS = [
  "Allah\u2019\u0131n ad\u0131yla",
  "Allah",
  "Rahm\u00e2n",
  "Rah\u00eem",
];

const SAMPLE_WORD_TRANSLITERATIONS = [
  "bismi",
  "all\u00e2hi",
  "ar-rahm\u00e2ni",
  "ar-rah\u00eemi",
];

const THEME_OPTIONS: { value: Theme; color: string }[] = [
  { value: "light", color: "#ffffff" },
  { value: "sepia", color: "#f5ead6" },
  { value: "dark", color: "#1a1a1a" },
  { value: "dimmed", color: "#22272e" },
];

type SettingsTab = "normal" | "wordByWord" | "mushaf";

function SettingsPage() {
  const { t } = useTranslation();
  const { locale, setLocale } = useI18nStore();

  const arabicFontId = usePreferencesStore((s) => s.arabicFontId);
  const viewMode = usePreferencesStore((s) => s.viewMode);
  const colorizeWords = usePreferencesStore((s) => s.colorizeWords);
  const colorPaletteId = usePreferencesStore((s) => s.colorPaletteId);
  const setArabicFont = usePreferencesStore((s) => s.setArabicFont);
  const setColorizeWords = usePreferencesStore((s) => s.setColorizeWords);
  const setColorPalette = usePreferencesStore((s) => s.setColorPalette);
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const normalShowTranslation = usePreferencesStore((s) => s.normalShowTranslation);
  const setNormalShowTranslation = usePreferencesStore((s) => s.setNormalShowTranslation);
  // Per-mode font sizes
  const normalArabicFontSize = usePreferencesStore((s) => s.normalArabicFontSize);
  const normalTranslationFontSize = usePreferencesStore((s) => s.normalTranslationFontSize);
  const wbwArabicFontSize = usePreferencesStore((s) => s.wbwArabicFontSize);
  const mushafArabicFontSize = usePreferencesStore((s) => s.mushafArabicFontSize);
  const setNormalArabicFontSize = usePreferencesStore((s) => s.setNormalArabicFontSize);
  const setNormalTranslationFontSize = usePreferencesStore((s) => s.setNormalTranslationFontSize);
  const setWbwArabicFontSize = usePreferencesStore((s) => s.setWbwArabicFontSize);
  const setMushafArabicFontSize = usePreferencesStore((s) => s.setMushafArabicFontSize);

  // Word-by-word settings
  const wbwShowWordTranslation = usePreferencesStore((s) => s.wbwShowWordTranslation);
  const wbwShowWordTransliteration = usePreferencesStore((s) => s.wbwShowWordTransliteration);
  const wordTranslationSize = usePreferencesStore((s) => s.wordTranslationSize);
  const wordTransliterationSize = usePreferencesStore((s) => s.wordTransliterationSize);
  const setWbwShowWordTranslation = usePreferencesStore((s) => s.setWbwShowWordTranslation);
  const setWbwShowWordTransliteration = usePreferencesStore((s) => s.setWbwShowWordTransliteration);
  const setWordTranslationSize = usePreferencesStore((s) => s.setWordTranslationSize);
  const setWordTransliterationSize = usePreferencesStore((s) => s.setWordTransliterationSize);

  const activeColors = getActiveColors({ colorPaletteId });
  const [activeTab, setActiveTab] = useState<SettingsTab>(viewMode);

  const TAB_OPTIONS: { value: SettingsTab; label: string }[] = [
    { value: "normal", label: t.settings.viewModes.normal },
    { value: "wordByWord", label: t.settings.viewModes.wordByWord },
    { value: "mushaf", label: t.settings.viewModes.mushaf },
  ];

  const themeLabels: Record<Theme, string> = {
    light: t.theme.light,
    sepia: t.theme.sepia,
    dark: t.theme.dark,
    dimmed: t.theme.dimmed,
  };

  // Pre-load all Google Arabic fonts for live preview
  useEffect(() => {
    for (const font of ARABIC_FONTS) {
      if (font.source === "google" && font.googleUrl) {
        const exists = document.querySelector(
          `link[href="${font.googleUrl}"]`,
        );
        if (!exists) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = font.googleUrl;
          document.head.appendChild(link);
        }
      }
    }
  }, []);

  const currentFont = getArabicFont(arabicFontId);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--theme-text)]">
        {t.settings.title}
      </h1>
      <p className="mb-10 text-sm text-[var(--theme-text-tertiary)]">
        {t.settings.subtitle}
      </p>

      {/* ═══ GENERAL SETTINGS ═══ */}
      <SettingsSection title={t.settings.general}>
        {/* Theme */}
        <SettingsLabel>{t.theme.settings}</SettingsLabel>
        <div className="mt-2 flex gap-3">
          {THEME_OPTIONS.map((opt) => {
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-3 transition-all ${
                  active
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-[var(--theme-border)] bg-[var(--theme-bg-primary)] hover:border-[var(--theme-divider)]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    active ? "border-primary-600" : "border-[var(--theme-divider)]"
                  }`}
                  style={{ backgroundColor: opt.color }}
                >
                  {active && (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke={opt.value === "dark" || opt.value === "dimmed" ? "#e5e5e5" : "#059669"} strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={`text-[12px] font-medium ${active ? "text-primary-700" : "text-[var(--theme-text)]"}`}>
                  {themeLabels[opt.value]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Colorize toggle */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <SettingsLabel>{t.settings.colorizeWords}</SettingsLabel>
            <p className="mt-0.5 text-[12px] text-[var(--theme-text-tertiary)]">
              {t.settings.colorizeWordsDesc}
            </p>
          </div>
          <ToggleSwitch checked={colorizeWords} onChange={setColorizeWords} />
        </div>

        {/* Color Palette picker */}
        {colorizeWords && (
          <div className="mt-4">
            <SettingsLabel>{t.settings.colorPalette}</SettingsLabel>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLOR_PALETTES.map((palette) => {
                const active = colorPaletteId === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => setColorPalette(palette.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 transition-all ${
                      active
                        ? "border-primary-500 bg-primary-50 shadow-sm"
                        : "border-[var(--theme-border)] bg-[var(--theme-bg)] hover:border-[var(--theme-divider)]"
                    }`}
                  >
                    <div className="flex gap-1">
                      {palette.colors.slice(0, 5).map((color, i) => (
                        <span
                          key={i}
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className={`text-[12px] font-medium ${active ? "text-primary-700" : "text-[var(--theme-text)]"}`}>
                      {palette.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Translation toggle */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <SettingsLabel>{t.settings.showTranslation}</SettingsLabel>
            <p className="mt-0.5 text-[12px] text-[var(--theme-text-tertiary)]">
              {t.settings.showTranslationDesc}
            </p>
          </div>
          <ToggleSwitch checked={normalShowTranslation} onChange={setNormalShowTranslation} />
        </div>

        {/* Translation picker — reorder/add/remove/primary */}
        {normalShowTranslation && (
          <div className="mt-4">
            <SettingsLabel>{t.settings.translationSelection}</SettingsLabel>
            <p className="mt-0.5 mb-2 text-[12px] text-[var(--theme-text-tertiary)]">
              {t.settings.translationSelectionDesc}
            </p>
            <TranslationPicker />
          </div>
        )}

        {/* Language picker */}
        <div className="mt-6 flex items-center justify-between">
          <SettingsLabel label={t.settings.language} description={t.settings.languageDesc} />
          <div className="flex items-center gap-1 rounded-lg bg-[var(--theme-input-bg)] p-0.5">
            {(["tr", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`rounded-md px-3 py-1 text-[12px] font-medium transition-all ${locale === l ? "bg-[var(--theme-bg-primary)] text-[var(--theme-text)] shadow-sm" : "text-[var(--theme-text-tertiary)] hover:text-[var(--theme-text-secondary)]"}`}
              >
                {l === "tr" ? "Türkçe" : "English"}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* ═══ FONT PICKER ═══ */}
      <FontPickerSection
        arabicFontId={arabicFontId}
        onFontChange={setArabicFont}
        colorizeWords={colorizeWords}
        colors={activeColors}
      />

      {/* ═══ MODE-SPECIFIC SETTINGS ═══ */}
      <SettingsSection title={t.settings.readingMode}>
        {/* Segmented tab control */}
        <SegmentedControl options={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} stretch />

        {/* Tab content */}
        <div className="mt-5">
          {activeTab === "normal" && (
            <NormalTabContent
              fontFamily={currentFont.family}
              arabicFontSize={normalArabicFontSize}
              translationFontSize={normalTranslationFontSize}
              onArabicSizeChange={setNormalArabicFontSize}
              onTranslationSizeChange={setNormalTranslationFontSize}
              colorizeWords={colorizeWords}
              colors={activeColors}
            />
          )}
          {activeTab === "wordByWord" && (
            <WbwTabContent
              fontFamily={currentFont.family}
              arabicFontSize={wbwArabicFontSize}
              onArabicSizeChange={setWbwArabicFontSize}
              colorizeWords={colorizeWords}
              colors={activeColors}
              showWordTranslation={wbwShowWordTranslation}
              showWordTransliteration={wbwShowWordTransliteration}
              wordTranslationSize={wordTranslationSize}
              wordTransliterationSize={wordTransliterationSize}
              onShowWordTranslationChange={setWbwShowWordTranslation}
              onShowWordTransliterationChange={setWbwShowWordTransliteration}
              onWordTranslationSizeChange={setWordTranslationSize}
              onWordTransliterationSizeChange={setWordTransliterationSize}
            />
          )}
          {activeTab === "mushaf" && (
            <MushafTabContent
              fontFamily={currentFont.family}
              arabicFontSize={mushafArabicFontSize}
              onArabicSizeChange={setMushafArabicFontSize}
              colorizeWords={colorizeWords}
              colors={activeColors}
            />
          )}
        </div>
      </SettingsSection>
    </div>
  );
}

// ── Tab content components ──

function NormalTabContent({
  fontFamily,
  arabicFontSize,
  translationFontSize,
  onArabicSizeChange,
  onTranslationSizeChange,
  colorizeWords,
  colors,
}: {
  fontFamily: string;
  arabicFontSize: number;
  translationFontSize: number;
  onArabicSizeChange: (v: number) => void;
  onTranslationSizeChange: (v: number) => void;
  colorizeWords: boolean;
  colors: string[];
}) {
  const { t } = useTranslation();

  const fontStyle = {
    fontFamily: `${fontFamily}, "Traditional Arabic", serif`,
    fontSize: `calc(1.65rem * ${arabicFontSize})`,
    lineHeight: 2.6,
  };

  const renderWord = (text: string, i: number) => (
    <span
      key={i}
      style={colorizeWords ? { color: colors[i % colors.length] } : undefined}
    >
      {text}
      {i < SAMPLE_WORDS.length - 1 ? " " : ""}
    </span>
  );

  return (
    <>
      {/* Preview */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-5 py-4">
        <p className="text-[var(--theme-text)]" dir="rtl" style={fontStyle}>
          {SAMPLE_WORDS.map(renderWord)}
        </p>
        <p
          className="mt-2 font-sans text-[var(--theme-text-secondary)]"
          style={{ fontSize: `calc(15px * ${translationFontSize})`, lineHeight: 1.8 }}
        >
          {t.settings.sampleTranslation}
        </p>
      </div>

      {/* Arabic size slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[var(--theme-text)]">{t.settings.arabicSize}</span>
          <span className="text-[12px] tabular-nums text-[var(--theme-text-tertiary)]">%{Math.round(arabicFontSize * 100)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="arabic-text text-sm text-[var(--theme-text-tertiary)]">ع</span>
          <input
            type="range" min="0.6" max="2.0" step="0.05"
            value={arabicFontSize}
            onChange={(e) => onArabicSizeChange(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--theme-border)] accent-primary-600"
          />
          <span className="arabic-text text-xl text-[var(--theme-text-tertiary)]">ع</span>
        </div>
      </div>

      {/* Translation size slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[var(--theme-text)]">{t.settings.translationSize}</span>
          <span className="text-[12px] tabular-nums text-[var(--theme-text-tertiary)]">%{Math.round(translationFontSize * 100)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-[var(--theme-text-tertiary)]">A</span>
          <input
            type="range" min="0.6" max="2.0" step="0.05"
            value={translationFontSize}
            onChange={(e) => onTranslationSizeChange(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--theme-border)] accent-primary-600"
          />
          <span className="text-lg text-[var(--theme-text-tertiary)]">A</span>
        </div>
      </div>
    </>
  );
}

function WbwTabContent({
  fontFamily,
  arabicFontSize,
  onArabicSizeChange,
  colorizeWords,
  colors,
  showWordTranslation,
  showWordTransliteration,
  wordTranslationSize,
  wordTransliterationSize,
  onShowWordTranslationChange,
  onShowWordTransliterationChange,
  onWordTranslationSizeChange,
  onWordTransliterationSizeChange,
}: {
  fontFamily: string;
  arabicFontSize: number;
  onArabicSizeChange: (v: number) => void;
  colorizeWords: boolean;
  colors: string[];
  showWordTranslation: boolean;
  showWordTransliteration: boolean;
  wordTranslationSize: number;
  wordTransliterationSize: number;
  onShowWordTranslationChange: (v: boolean) => void;
  onShowWordTransliterationChange: (v: boolean) => void;
  onWordTranslationSizeChange: (v: number) => void;
  onWordTransliterationSizeChange: (v: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* Preview */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg)] px-4 py-4">
        <div className="flex flex-wrap justify-end gap-x-5 gap-y-3" dir="rtl">
          {SAMPLE_WORDS.map((word, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-xl"
                dir="rtl"
                style={{
                  fontFamily: `${fontFamily}, "Traditional Arabic", serif`,
                  fontSize: `calc(1.5rem * ${arabicFontSize})`,
                  color: colorizeWords
                    ? colors[i % colors.length]
                    : "var(--theme-text)",
                }}
              >
                {word}
              </span>
              {showWordTranslation && (
                <span
                  className="font-sans text-[var(--theme-text-tertiary)]"
                  style={{ fontSize: `calc(11px * ${wordTranslationSize})` }}
                >
                  {SAMPLE_WORD_TRANSLATIONS[i]}
                </span>
              )}
              {showWordTransliteration && (
                <span
                  className="font-sans text-[var(--theme-text-quaternary)]"
                  style={{ fontSize: `calc(10px * ${wordTransliterationSize})` }}
                >
                  {SAMPLE_WORD_TRANSLITERATIONS[i]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Arabic size slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[var(--theme-text)]">{t.settings.arabicSize}</span>
          <span className="text-[12px] tabular-nums text-[var(--theme-text-tertiary)]">%{Math.round(arabicFontSize * 100)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="arabic-text text-sm text-[var(--theme-text-tertiary)]">ع</span>
          <input
            type="range" min="0.6" max="2.0" step="0.05"
            value={arabicFontSize}
            onChange={(e) => onArabicSizeChange(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--theme-border)] accent-primary-600"
          />
          <span className="arabic-text text-xl text-[var(--theme-text-tertiary)]">ع</span>
        </div>
      </div>

      {/* Word Translation toggle + size */}
      <div className="mt-5 border-t border-[var(--theme-border)] pt-5">
        <div className="flex items-center justify-between">
          <SettingsLabel>{t.settings.wordTranslation}</SettingsLabel>
          <ToggleSwitch checked={showWordTranslation} onChange={onShowWordTranslationChange} />
        </div>
        {showWordTranslation && (
          <div className="mt-3 flex items-center gap-3">
            <span className="shrink-0 text-[12px] text-[var(--theme-text-tertiary)]">{t.settings.translationSize}</span>
            <input
              type="range" min="0.6" max="2.0" step="0.05"
              value={wordTranslationSize}
              onChange={(e) => onWordTranslationSizeChange(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--theme-border)] accent-primary-600"
            />
            <span className="shrink-0 text-[12px] tabular-nums text-[var(--theme-text-tertiary)]">
              %{Math.round(wordTranslationSize * 100)}
            </span>
          </div>
        )}
      </div>

      {/* Word Transliteration toggle + size */}
      <div className="mt-4 border-t border-[var(--theme-border)] pt-5">
        <div className="flex items-center justify-between">
          <SettingsLabel>{t.settings.transliteration}</SettingsLabel>
          <ToggleSwitch checked={showWordTransliteration} onChange={onShowWordTransliterationChange} />
        </div>
        {showWordTransliteration && (
          <div className="mt-3 flex items-center gap-3">
            <span className="shrink-0 text-[12px] text-[var(--theme-text-tertiary)]">{t.settings.transliterationSize}</span>
            <input
              type="range" min="0.6" max="2.0" step="0.05"
              value={wordTransliterationSize}
              onChange={(e) => onWordTransliterationSizeChange(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--theme-border)] accent-primary-600"
            />
            <span className="shrink-0 text-[12px] tabular-nums text-[var(--theme-text-tertiary)]">
              %{Math.round(wordTransliterationSize * 100)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

function MushafTabContent({
  fontFamily,
  arabicFontSize,
  onArabicSizeChange,
  colorizeWords,
  colors,
}: {
  fontFamily: string;
  arabicFontSize: number;
  onArabicSizeChange: (v: number) => void;
  colorizeWords: boolean;
  colors: string[];
}) {
  const { t } = useTranslation();

  const fontStyle = {
    fontFamily: `${fontFamily}, "Traditional Arabic", serif`,
    fontSize: `calc(1.65rem * ${arabicFontSize})`,
    lineHeight: 2.8,
  };

  const renderWord = (text: string, i: number) => (
    <span
      key={i}
      style={colorizeWords ? { color: colors[i % colors.length] } : undefined}
    >
      {text}
      {i < SAMPLE_WORDS.length - 1 ? " " : ""}
    </span>
  );

  return (
    <>
      {/* Preview — mushaf frame */}
      <div className="mushaf-page">
        <div className="mushaf-cetvel-outer">
          <div className="mushaf-tezhip-band">
            <div className="mushaf-hatayi-pattern" />
            <div className="mushaf-cetvel-inner">
              <div className="mushaf-content">
                <p className="text-center text-[var(--mushaf-ink)]" dir="rtl" style={fontStyle}>
                  {SAMPLE_WORDS.map(renderWord)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arabic size slider */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[var(--theme-text)]">{t.settings.arabicSize}</span>
          <span className="text-[12px] tabular-nums text-[var(--theme-text-tertiary)]">%{Math.round(arabicFontSize * 100)}</span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="arabic-text text-sm text-[var(--theme-text-tertiary)]">ع</span>
          <input
            type="range" min="0.6" max="2.0" step="0.05"
            value={arabicFontSize}
            onChange={(e) => onArabicSizeChange(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[var(--theme-border)] accent-primary-600"
          />
          <span className="arabic-text text-xl text-[var(--theme-text-tertiary)]">ع</span>
        </div>
      </div>
    </>
  );
}

// ── Font Picker Section ──

const PREVIEW_SURAH = {
  name: "el-Kevser",
  number: 108,
  verses: [
    "\u0625\u0650\u0646\u0651\u064E\u0627 \u0623\u064E\u0639\u0652\u0637\u064E\u064A\u0652\u0646\u064E\u0627\u0643\u064E \u0627\u0644\u0652\u0643\u064E\u0648\u0652\u062B\u064E\u0631\u064E",
    "\u0641\u064E\u0635\u064E\u0644\u0651\u0650 \u0644\u0650\u0631\u064E\u0628\u0651\u0650\u0643\u064E \u0648\u064E\u0627\u0646\u0652\u062D\u064E\u0631\u0652",
    "\u0625\u0650\u0646\u0651\u064E \u0634\u064E\u0627\u0646\u0650\u0626\u064E\u0643\u064E \u0647\u064F\u0648\u064E \u0627\u0644\u0652\u0623\u064E\u0628\u0652\u062A\u064E\u0631\u064F",
  ],
};

function FontPickerSection({
  arabicFontId,
  onFontChange,
  colorizeWords,
  colors,
}: {
  arabicFontId: string;
  onFontChange: (id: string) => void;
  colorizeWords: boolean;
  colors: string[];
}) {
  const { t } = useTranslation();
  const currentFont = getArabicFont(arabicFontId);
  const fontFamily = `${currentFont.family}, "Traditional Arabic", serif`;
  let colorIdx = 0;

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--theme-text-tertiary)]">
        {t.fonts.title}
      </h2>

      {/* Live surah preview */}
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-primary)] p-5">
        {/* Surah header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--theme-text)]">{currentFont.name}</span>
            {currentFont.source === "local" && (
              <span className="rounded-md bg-primary-600/10 px-1.5 py-0.5 text-[10px] font-medium text-primary-700">
                {t.common.local}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--theme-text-quaternary)]">
            {PREVIEW_SURAH.name} ({PREVIEW_SURAH.number})
          </span>
        </div>

        {/* Verses */}
        <div className="space-y-3" dir="rtl">
          {PREVIEW_SURAH.verses.map((verse, vi) => {
            const words = verse.split(" ");
            return (
              <p
                key={vi}
                className="text-[1.5rem] leading-[2.4] text-[var(--theme-text)]"
                style={{ fontFamily }}
              >
                {colorizeWords && colors.length > 0
                  ? words.map((w, wi) => {
                      const idx = colorIdx++;
                      return (
                        <span key={wi} style={{ color: colors[idx % colors.length] }}>
                          {w}{wi < words.length - 1 ? " " : ""}
                        </span>
                      );
                    })
                  : verse}
                <span className="mr-1.5 inline-block text-[0.7em] text-[var(--theme-text-tertiary)]">
                  {String.fromCodePoint(0x06F0 + vi + 1)}
                </span>
              </p>
            );
          })}
        </div>

        {/* Description */}
        <p className="mt-3 border-t border-[var(--theme-border)] pt-3 text-[11px] leading-relaxed text-[var(--theme-text-tertiary)]">
          {currentFont.desc}
        </p>
      </div>

      {/* Font chips — 2-row grid */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {ARABIC_FONTS.map((font) => {
          const isSelected = font.id === arabicFontId;
          return (
            <button
              key={font.id}
              type="button"
              onClick={() => onFontChange(font.id)}
              className={`rounded-xl border px-2 py-2 text-center transition-all ${
                isSelected
                  ? "border-primary-500 bg-primary-50 shadow-sm"
                  : "border-[var(--theme-border)] bg-[var(--theme-bg-primary)] hover:border-[var(--theme-divider)] hover:shadow-sm"
              }`}
            >
              <span
                className="block whitespace-nowrap text-[1.05rem] leading-snug text-[var(--theme-text)]"
                dir="rtl"
                style={{ fontFamily: `${font.family}, "Traditional Arabic", serif` }}
              >
                {BISMILLAH.split(" ").slice(0, 2).join(" ")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Shared components ──

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--theme-text-tertiary)]">
        {title}
      </h2>
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-bg-primary)] p-5">
        {children}
      </div>
    </section>
  );
}

function SettingsLabel({
  children,
  label,
  description,
}: {
  children?: React.ReactNode;
  label?: string;
  description?: string;
}) {
  if (label !== undefined) {
    return (
      <div>
        <span className="text-[13px] font-semibold text-[var(--theme-text)]">{label}</span>
        {description && (
          <p className="mt-0.5 text-[12px] text-[var(--theme-text-tertiary)]">{description}</p>
        )}
      </div>
    );
  }
  return (
    <span className="text-[13px] font-semibold text-[var(--theme-text)]">
      {children}
    </span>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <div
      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked ? "border-primary-600 bg-primary-600" : "border-[var(--theme-divider)]"
      }`}
    >
      {checked && (
        <svg
          className="h-3 w-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}

function CheckboxDot({ checked }: { checked: boolean }) {
  return (
    <div
      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
        checked ? "border-primary-600 bg-primary-600" : "border-[var(--theme-divider)]"
      }`}
    >
      {checked && (
        <svg
          className="h-3 w-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary-600" : "bg-[var(--theme-divider)]"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-[24px] w-[24px] rounded-full bg-[var(--theme-bg-primary)] shadow-sm transition-transform ${
          checked ? "translate-x-[20px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}
