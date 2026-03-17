import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { versesByLayoutPageQueryOptions } from "~/hooks/useVerses";
import { chaptersQueryOptions } from "~/hooks/useChapters";
import { FocusLayout } from "~/components/focus/FocusLayout";
import { FocusPageContent } from "~/components/focus/FocusPageContent";
import { AnnotationCanvas } from "~/components/focus/AnnotationCanvas";
import { AnnotationToolbar } from "~/components/focus/AnnotationToolbar";
import { Loading } from "~/components/ui/Loading";
import { useTranslatedVerses } from "~/hooks/useTranslatedVerses";
import { getActiveLayout, getTotalPages } from "~/lib/page-layout";

export const Route = createFileRoute("/focus/$pageNumber")({
  validateSearch: () => ({}),
  loader: ({ context, params }) => {
    const pageNum = Number(params.pageNumber);
    const layout = getActiveLayout();
    const totalPages = getTotalPages(layout);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
      throw new Error(`Invalid page number: ${params.pageNumber}`);
    }
    return Promise.all([
      context.queryClient.ensureQueryData(versesByLayoutPageQueryOptions(pageNum, layout)),
      context.queryClient.ensureQueryData(chaptersQueryOptions()),
    ]);
  },
  pendingComponent: () => <Loading text="Yükleniyor..." />,
  head: ({ params }) => ({
    meta: [{ title: `Focus · Sayfa ${params.pageNumber} | Mahfuz` }],
  }),
  component: FocusRoute,
});

function FocusRoute() {
  const { pageNumber } = Route.useParams();
  const pageNum = Number(pageNumber);
  const layout = getActiveLayout();

  const { data: versesData } = useSuspenseQuery(
    versesByLayoutPageQueryOptions(pageNum, layout),
  );
  const { data: chapters } = useSuspenseQuery(chaptersQueryOptions());
  const translatedVerses = useTranslatedVerses(versesData.verses);

  return (
    <FocusLayout
      pageNumber={pageNum}
      overlay={
        <>
          <AnnotationCanvas pageNumber={pageNum} />
          <AnnotationToolbar pageNumber={pageNum} chapters={chapters} />
        </>
      }
    >
      <FocusPageContent
        pageNumber={pageNum}
        verses={translatedVerses}
        chapters={chapters}
      />
    </FocusLayout>
  );
}
