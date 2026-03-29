/**
 * Keşfet hub'ı — /hub
 * Yer imleri, Elifba, Ezberle, Uygulamalar gibi modüllerin giriş noktası.
 */

import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useBookmarksStore } from "~/stores/bookmarks.store";
import { useTranslation } from "~/hooks/useTranslation";
import { useLocaleStore } from "~/stores/locale.store";
import { getAllLocaleConfigs, loadLocaleMessages, type Locale } from "~/locales/registry";
import { GitHubContributors } from "~/components/hub/GitHubContributors";
import { Credits } from "~/components/hub/Credits";

export const Route = createFileRoute("/hub")({
  component: HubPage,
});

interface HubCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: number;
  disabled?: boolean;
}

function HubCard({ to, icon, title, description, badge, disabled }: HubCardProps) {
  const content = (
    <div
      className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border transition-colors h-full ${
        disabled
          ? "border-[var(--color-border)] opacity-50 cursor-default"
          : "border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface)] cursor-pointer"
      }`}
    >
      <div className="w-11 h-11 rounded-xl bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-accent)]">
        {icon}
      </div>
      <span className="text-sm font-medium text-[var(--color-text-primary)]">{title}</span>
      <span className="text-xs text-[var(--color-text-secondary)] text-center leading-snug">{description}</span>
      {badge != null && badge > 0 && (
        <span className="absolute top-3 right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-medium flex items-center justify-center">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {disabled && (
        <span className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-secondary)] font-medium">
          Yakında
        </span>
      )}
    </div>
  );

  if (disabled) return content;

  return (
    <Link to={to} className="block">
      {content}
    </Link>
  );
}

function HubPage() {
  const { t } = useTranslation();
  const bookmarkCount = useBookmarksStore((s) => s.bookmarks.length);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-32">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">{t.hub.title}</h1>
        <LanguagePicker />
      </div>

      {/* Yeni ne var bandı */}
      <Link
        to="/changelog"
        className="flex items-center gap-3 px-3.5 py-2.5 mb-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" />
        </svg>
        <span className="flex-1 text-sm font-medium text-[var(--color-text-primary)]">{t.changelog.banner}</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0 text-[var(--color-text-secondary)]">
          <path d="M6 4l4 4-4 4" />
        </svg>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        {/* Yer İmleri */}
        <HubCard
          to="/bookmarks"
          badge={bookmarkCount}
          title={t.hub.bookmarks}
          description={t.hub.bookmarksDesc}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 3H19A1 1 0 0120 4V21L12.5 16L5 21V4A1 1 0 015 3Z" />
            </svg>
          }
        />

        {/* Elifba Öğren */}
        <HubCard
          to="/alifba"
          title={t.hub.alifba}
          description={t.hub.alifbaDesc}
          icon={
            <span className="text-lg font-bold leading-none" style={{ fontFamily: "var(--font-arabic)" }}>ا ب</span>
          }
        />

        {/* Dinleyerek Ezberle */}
        <HubCard
          to="/hub"
          disabled
          title={t.hub.listenMemorize}
          description={t.hub.listenMemorizeDesc}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18V12A9 9 0 0121 12V18" />
              <path d="M21 19C21 20.1 20.1 21 19 21H18C16.9 21 16 20.1 16 19V16C16 14.9 16.9 14 18 14H21V19Z" />
              <path d="M3 19C3 20.1 3.9 21 5 21H6C7.1 21 8 20.1 8 19V16C8 14.9 7.1 14 6 14H3V19Z" />
            </svg>
          }
        />

        {/* Kuran Uygulamaları */}
        <HubCard
          to="/hub"
          disabled
          title={t.hub.apps}
          description={t.hub.appsDesc}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          }
        />
      </div>

      <GitHubContributors />
      <Credits />
    </div>
  );
}

function LanguagePicker() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const allLocales = getAllLocaleConfigs();
  const current = allLocales.find((l) => l.code === locale);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleChange = async (code: Locale) => {
    setOpen(false);
    await loadLocaleMessages(code);
    setLocale(code);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-secondary)]">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="text-xs font-medium text-[var(--color-text-primary)]">{current?.config.displayName}</span>
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-text-secondary)]">
          <path d={open ? "M3 7L6 4L9 7" : "M3 5L6 8L9 5"} />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-xl z-50 py-1 overflow-hidden">
          {allLocales.map(({ code, config }) => (
            <button
              key={code}
              onClick={() => handleChange(code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                locale === code
                  ? "text-[var(--color-accent)] bg-[var(--color-accent)]/8"
                  : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]"
              }`}
            >
              <span className="flex-1">{config.displayName}</span>
              {locale === code && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5l3.5 3.5L13 5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
