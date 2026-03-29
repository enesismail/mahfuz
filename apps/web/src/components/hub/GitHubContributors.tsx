/**
 * GitHub katkıda bulunanlar — detaylı kart listesi + repo istatistikleri.
 * Public API, 24h cache, hata durumunda gizlenir.
 */

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "~/hooks/useTranslation";

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface RepoInfo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
}

const REPO = "theilgaz/mahfuz";

function useContributors() {
  return useQuery({
    queryKey: ["github", "contributors"],
    queryFn: async (): Promise<Contributor[]> => {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/contributors?per_page=50`,
      );
      if (!res.ok) throw new Error("GitHub API error");
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

function useRepoInfo() {
  return useQuery({
    queryKey: ["github", "repo"],
    queryFn: async (): Promise<RepoInfo> => {
      const res = await fetch(`https://api.github.com/repos/${REPO}`);
      if (!res.ok) throw new Error("GitHub API error");
      return res.json();
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}

function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-1.5">
      <div className="flex items-center gap-1 text-[var(--color-text-primary)]">
        {icon}
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <span className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function GitHubContributors() {
  const { t } = useTranslation();
  const c = t.hub.contributors;
  const { data: contributors, isError } = useContributors();
  const { data: repo } = useRepoInfo();

  if (isError || !contributors || contributors.length === 0) return null;

  const totalCommits = contributors.reduce((s, x) => s + x.contributions, 0);

  return (
    <section className="mt-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {c.title}
          </h3>
        </div>
        <a
          href={`https://github.com/${REPO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          {c.viewOnGithub}
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 1h7v7M11 1L5 7" />
          </svg>
        </a>
      </div>

      {/* Repo istatistikleri */}
      {repo && (
        <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] mb-4 divide-x divide-[var(--color-border)]">
          <StatBadge
            value={totalCommits.toLocaleString()}
            label={c.commits}
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z" /></svg>}
          />
          <StatBadge
            value={repo.stargazers_count}
            label="stars"
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" /></svg>}
          />
          <StatBadge
            value={repo.forks_count}
            label="forks"
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>}
          />
          <StatBadge
            value={contributors.length}
            label={c.title.toLowerCase()}
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5zM11 4a.75.75 0 100 1.5 1.5 1.5 0 01.666 2.844.75.75 0 00-.416.672v.352a.75.75 0 00.574.73c1.2.289 2.162 1.2 2.522 2.372a.75.75 0 101.434-.44 5.01 5.01 0 00-2.56-3.012A3 3 0 0011 4z" /></svg>}
          />
        </div>
      )}

      {/* Katkıda bulunanlar listesi */}
      <div className="space-y-2">
        {contributors.map((user, i) => (
          <a
            key={user.login}
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/3 transition-colors"
          >
            <div className="relative shrink-0">
              <img
                src={`${user.avatar_url}&s=80`}
                alt={user.login}
                width={i === 0 ? 44 : 36}
                height={i === 0 ? 44 : 36}
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`rounded-full ${i === 0 ? "ring-2 ring-[var(--color-accent)]/20" : ""}`}
              />
              <span className={`absolute -top-0.5 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center leading-none ${
                i === 0
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}>
                {i + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`font-medium text-[var(--color-text-primary)] truncate ${i === 0 ? "text-sm" : "text-xs"}`}>
                  {user.login}
                </span>
              </div>
              <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                {user.contributions.toLocaleString()} {c.commits}
                {" · "}
                {Math.round((user.contributions / totalCommits) * 100)}%
              </div>
              {/* Progress bar */}
              <div className="mt-1.5 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${Math.round((user.contributions / totalCommits) * 100)}%` }}
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
