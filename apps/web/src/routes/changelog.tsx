/**
 * Changelog / Yeni ne var? — /changelog
 * Tüm özellikler ve son güncellemeler.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "~/hooks/useTranslation";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
});

const LAST_UPDATED = "2026-03-29";

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  tag?: "new" | "improved" | "coming";
}

interface FeatureSection {
  title: string;
  items: FeatureItem[];
}

function buildSections(t: any): FeatureSection[] {
  return [
    {
      title: t.changelog.sections.reading,
      items: [
        { icon: "📖", title: t.changelog.features.mushafPage, description: t.changelog.features.mushafPageDesc },
        { icon: "📜", title: t.changelog.features.surahView, description: t.changelog.features.surahViewDesc },
        { icon: "🔤", title: t.changelog.features.wbw, description: t.changelog.features.wbwDesc },
        { icon: "🎨", title: t.changelog.features.tajweed, description: t.changelog.features.tajweedDesc },
        { icon: "⭐", title: t.changelog.features.verseMarkers, description: t.changelog.features.verseMarkersDesc, tag: "new" },
        { icon: "🔖", title: t.changelog.features.bookmarks, description: t.changelog.features.bookmarksDesc },
        { icon: "📊", title: t.changelog.features.readingProgress, description: t.changelog.features.readingProgressDesc, tag: "new" },
        { icon: "🕌", title: t.changelog.features.sajdah, description: t.changelog.features.sajdahDesc, tag: "new" },
      ],
    },
    {
      title: t.changelog.sections.navigation,
      items: [
        { icon: "🧭", title: t.changelog.features.readingHeader, description: t.changelog.features.readingHeaderDesc, tag: "new" },
        { icon: "📑", title: t.changelog.features.surahPicker, description: t.changelog.features.surahPickerDesc, tag: "improved" },
        { icon: "🔍", title: t.changelog.features.search, description: t.changelog.features.searchDesc },
        { icon: "👆", title: t.changelog.features.swipeNav, description: t.changelog.features.swipeNavDesc },
        { icon: "⌨️", title: t.changelog.features.keyboardNav, description: t.changelog.features.keyboardNavDesc },
        { icon: "📋", title: t.changelog.features.surahFilters, description: t.changelog.features.surahFiltersDesc, tag: "improved" },
      ],
    },
    {
      title: t.changelog.sections.audio,
      items: [
        { icon: "🎧", title: t.changelog.features.audioPlayer, description: t.changelog.features.audioPlayerDesc },
        { icon: "🗣️", title: t.changelog.features.wordSync, description: t.changelog.features.wordSyncDesc },
        { icon: "🎙️", title: t.changelog.features.reciters, description: t.changelog.features.recitersDesc },
        { icon: "⏩", title: t.changelog.features.speedControl, description: t.changelog.features.speedControlDesc },
      ],
    },
    {
      title: t.changelog.sections.learning,
      items: [
        { icon: "ا ب", title: t.changelog.features.alifba, description: t.changelog.features.alifbaDesc },
        { icon: "✍️", title: t.changelog.features.letterTrace, description: t.changelog.features.letterTraceDesc },
        { icon: "📝", title: t.changelog.features.hifzTracker, description: t.changelog.features.hifzTrackerDesc },
      ],
    },
    {
      title: t.changelog.sections.personalization,
      items: [
        { icon: "🎨", title: t.changelog.features.themes, description: t.changelog.features.themesDesc },
        { icon: "🌍", title: t.changelog.features.languages, description: t.changelog.features.languagesDesc },
        { icon: "📏", title: t.changelog.features.fontSizes, description: t.changelog.features.fontSizesDesc },
        { icon: "📚", title: t.changelog.features.multiTranslation, description: t.changelog.features.multiTranslationDesc },
        { icon: "🔠", title: t.changelog.features.textStyles, description: t.changelog.features.textStylesDesc },
      ],
    },
    {
      title: t.changelog.sections.hub,
      items: [
        { icon: "🧭", title: t.changelog.features.hub, description: t.changelog.features.hubDesc, tag: "new" },
        { icon: "📊", title: t.changelog.features.mruPopup, description: t.changelog.features.mruPopupDesc, tag: "new" },
        { icon: "👥", title: t.changelog.features.contributors, description: t.changelog.features.contributorsDesc, tag: "new" },
      ],
    },
    {
      title: t.changelog.sections.upcoming,
      items: [
        { icon: "🎧", title: t.changelog.features.listenMemorize, description: t.changelog.features.listenMemorizeDesc, tag: "coming" },
        { icon: "📱", title: t.changelog.features.apps, description: t.changelog.features.appsDesc, tag: "coming" },
      ],
    },
  ];
}

function TagBadge({ tag }: { tag: "new" | "improved" | "coming" }) {
  const { t } = useTranslation();
  const styles = {
    new: "bg-green-500/15 text-green-700",
    improved: "bg-blue-500/15 text-blue-700",
    coming: "bg-amber-500/15 text-amber-700",
  };
  const labels = {
    new: t.changelog.tags.new,
    improved: t.changelog.tags.improved,
    coming: t.changelog.tags.coming,
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${styles[tag]}`}>
      {labels[tag]}
    </span>
  );
}

function ChangelogPage() {
  const { t } = useTranslation();
  const sections = buildSections(t);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link
          to="/hub"
          className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
          aria-label={t.nav.back}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5L7 10L12 15" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">{t.changelog.title}</h1>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] mb-6 ml-12">
        {t.changelog.lastUpdated}: {LAST_UPDATED}
      </p>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2.5">{section.title}</h2>
            <div className="space-y-1">
              {section.items.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface)] transition-colors"
                >
                  <span className="text-base shrink-0 w-6 text-center leading-6">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.tag && <TagBadge tag={item.tag} />}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
