import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { chapterQueryOptions } from "~/hooks/useChapters";
import { useMemorizationDashboard } from "~/hooks/useMemorization";
import { SurahVerifyQuiz } from "~/components/memorization/SurahVerifyQuiz";
import { VerificationResults } from "~/components/memorization/VerificationResults";
import { memorizationRepository } from "@mahfuz/db";
import type { SessionResult } from "~/stores/useMemorizationStore";

export const Route = createFileRoute(
  "/_app/_protected/memorize/verify/$surahId",
)({
  component: VerifyPage,
});

function VerifyPage() {
  const { session } = Route.useRouteContext();
  const userId = session!.user.id;
  const { surahId: surahIdStr } = Route.useParams();
  const surahId = Number(surahIdStr);
  const navigate = useNavigate();

  const { data: chapter } = useSuspenseQuery(chapterQueryOptions(surahId));
  const { refreshStats } = useMemorizationDashboard(userId);

  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [passed, setPassed] = useState(false);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);

  const handleComplete = useCallback(
    (results: {
      total: number;
      correct: number;
      results: Array<{
        verseKey: string;
        wordPosition: number;
        correctWord: string;
        selectedWord: string;
        isCorrect: boolean;
      }>;
    }) => {
      const accuracy = results.total > 0 ? results.correct / results.total : 0;
      const didPass = accuracy >= 0.6;
      setPassed(didPass);

      // Map blank results to SessionResult format for VerificationResults
      // Group by verseKey. A verse passes if majority of its blanks are correct
      const byVerse = new Map<
        string,
        { correct: number; total: number }
      >();
      for (const r of results.results) {
        const entry = byVerse.get(r.verseKey) || { correct: 0, total: 0 };
        entry.total++;
        if (r.isCorrect) entry.correct++;
        byVerse.set(r.verseKey, entry);
      }

      const mapped: SessionResult[] = [...byVerse.entries()].map(
        ([verseKey, counts]) => {
          const ratio = counts.correct / counts.total;
          const wasCorrect = ratio >= 0.5;
          const grade = ratio >= 0.8 ? 5 : ratio >= 0.5 ? 3 : 1;
          return {
            cardId: verseKey,
            verseKey,
            grade: grade as 0 | 1 | 2 | 3 | 4 | 5,
            wasCorrect,
          };
        },
      );
      setSessionResults(mapped);

      if (didPass && chapter) {
        memorizationRepository.bulkMasterSurah(
          userId,
          surahId,
          chapter.verses_count,
        );
      }

      setPhase("results");
    },
    [userId, surahId, chapter],
  );

  const handleContinue = useCallback(() => {
    refreshStats();
    navigate({ to: "/memorize" });
  }, [refreshStats, navigate]);

  if (phase === "results") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-8 animate-fade-in">
        <VerificationResults
          results={sessionResults}
          passed={passed}
          surahName={chapter?.name_simple || ""}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 animate-fade-in">
      <SurahVerifyQuiz
        surahId={surahId}
        onComplete={handleComplete}
        onCancel={handleContinue}
      />
    </div>
  );
}
