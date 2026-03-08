import { createFileRoute } from "@tanstack/react-router";
import { useProfileStats } from "~/hooks/useProfileStats";
import { QuranProgress } from "~/components/memorization/QuranProgress";
import { StreakDisplay } from "~/components/memorization/StreakDisplay";
import { BadgeGrid } from "~/components/memorization/BadgeGrid";
import { ImprovementChart } from "~/components/memorization/ImprovementChart";
import { useTranslation } from "~/hooks/useTranslation";

export const Route = createFileRoute("/_app/_protected/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { session } = Route.useRouteContext();
  const userId = session!.user.id;
  const { t } = useTranslation();

  const {
    stats,
    masteredVerses,
    longestStreak,
    last7Days,
    dailyHistory,
    badges,
    isLoading,
  } = useProfileStats(userId);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--theme-text)]">
        {t.nav.profile}
      </h1>

      {/* User card */}
      <div className="mb-6 rounded-2xl bg-[var(--theme-bg-primary)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-[var(--theme-text)]">
              {session?.user?.name || "User"}
            </h2>
            <p className="text-[13px] text-[var(--theme-text-tertiary)]">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Stats grid */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2">
              <QuranProgress masteredVerses={masteredVerses} />
              <StreakDisplay
                currentStreak={stats.currentStreak}
                longestStreak={longestStreak}
                last7Days={last7Days}
              />
            </div>
          )}

          {/* Stat summary */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label={t.memorize.profile.totalVerses} value={stats.totalCards} />
              <StatCard label={t.memorize.profile.masteredVerses} value={masteredVerses} />
              <StatCard label={t.memorize.profile.totalReviews} value={`${Math.round(stats.averageAccuracy * 100)}%`} />
              <StatCard label={t.memorize.stats.reviewedToday} value={stats.reviewedToday} />
            </div>
          )}

          {/* Badges */}
          <BadgeGrid badges={badges} />

          {/* Improvement chart */}
          {dailyHistory.length > 0 && (
            <ImprovementChart data={dailyHistory} />
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-[var(--theme-bg-primary)] p-4 text-center shadow-[var(--shadow-card)]">
      <p className="text-2xl font-bold text-[var(--theme-text)]">{value}</p>
      <p className="mt-0.5 text-[12px] text-[var(--theme-text-tertiary)]">{label}</p>
    </div>
  );
}
