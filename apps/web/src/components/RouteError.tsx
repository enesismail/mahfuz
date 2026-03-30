/**
 * Route hata bileşeni — veri yükleme veya render hatalarında gösterilir.
 * i18n destekli + Twitter'dan bildir butonu.
 */

import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "~/hooks/useTranslation";

export function RouteError({ error }: { error: Error }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  let t: any;
  try {
    t = useTranslation().t;
  } catch {
    t = null;
  }

  const title = t?.error?.generic ?? "Bir hata oluştu";
  const desc = error.message || (t?.error?.genericDesc ?? "Sayfa yüklenirken beklenmeyen bir hata oluştu.");
  const retry = t?.error?.retry ?? "Tekrar Dene";
  const home = t?.error?.goHome ?? "Ana Sayfa";
  const report = t?.error?.report ?? "Bildir";

  // Build pre-filled tweet
  const shortError = error.message?.slice(0, 80) || "Unknown error";
  const tweetText = `@theilgaz mahfuz.ilg.az${pathname} sayfasında hata oluştu:\n\n"${shortError}"`;
  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <p className="text-4xl mb-4">:(</p>
      <p className="text-lg font-medium mb-2">{title}</p>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm">
        {desc}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => router.invalidate()}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity"
          style={{ background: "var(--color-accent, #8b6914)", color: "#fff" }}
        >
          {retry}
        </button>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ border: "1px solid var(--color-border, #d9d0bc)", color: "var(--color-text-primary, #2a2418)" }}
        >
          {home}
        </Link>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ border: "1px solid var(--color-border, #d9d0bc)", color: "var(--color-text-primary, #2a2418)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {report}
        </a>
      </div>
    </div>
  );
}
