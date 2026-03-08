import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { chaptersQueryOptions } from "~/hooks/useChapters";
import { juzListQueryOptions } from "~/hooks/useJuz";
import { Loading } from "~/components/ui/Loading";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { SurahListPanel } from "~/components/browse/SurahListPanel";
import { JuzListPanel } from "~/components/browse/JuzListPanel";
import { PageListPanel } from "~/components/browse/PageListPanel";
import { FihristPanel } from "~/components/browse/FihristPanel";
import { useTranslation } from "~/hooks/useTranslation";

const VALID_TABS = ["surahs", "juzs", "pages", "index"] as const;
type TabType = (typeof VALID_TABS)[number];

export const Route = createFileRoute("/_app/browse/$tab")({
  validateSearch: (search: Record<string, unknown>) => ({
    topic: typeof search.topic === "number" ? search.topic : undefined,
  }),
  beforeLoad: ({ params }) => {
    if (!VALID_TABS.includes(params.tab as TabType)) {
      throw redirect({ to: "/browse/surahs" });
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(chaptersQueryOptions()),
      context.queryClient.ensureQueryData(juzListQueryOptions()),
    ]);
  },
  pendingComponent: () => <Loading text="Yükleniyor..." />,
  component: BrowsePage,
});

function BrowsePage() {
  const { tab } = Route.useParams();
  const { topic } = Route.useSearch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentTab = tab as TabType;

  const TAB_OPTIONS = [
    { value: "surahs" as TabType, label: t.browse.surahs },
    { value: "juzs" as TabType, label: t.browse.juzs },
    { value: "pages" as TabType, label: t.browse.pages },
    { value: "index" as TabType, label: t.browse.index },
  ];

  const TAB_TITLES: Record<TabType, string> = {
    surahs: t.browse.surahs,
    juzs: t.browse.juzs,
    pages: t.browse.pages,
    index: t.browse.index,
  };

  const setTab = (value: TabType) => {
    navigate({
      to: "/browse/$tab",
      params: { tab: value },
      replace: true,
    });
  };

  return (
    <div className="mx-auto max-w-[680px] px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-[28px] font-semibold tracking-[-0.02em] text-[var(--theme-text)]">
        {TAB_TITLES[currentTab]}
      </h1>

      {/* Tabs */}
      <div className="mb-6">
        <SegmentedControl
          options={TAB_OPTIONS}
          value={currentTab}
          onChange={setTab}
          stretch
        />
      </div>

      {/* Tab content */}
      <Suspense fallback={<Loading text={t.common.loading} />}>
        {currentTab === "surahs" && <SurahListPanel />}
        {currentTab === "juzs" && <JuzListPanel />}
        {currentTab === "pages" && <PageListPanel />}
        {currentTab === "index" && <FihristPanel initialTopic={topic} />}
      </Suspense>
    </div>
  );
}
