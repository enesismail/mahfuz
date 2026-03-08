import type {
  MemorizationCard,
  MemorizationStats,
  ConfidenceLevel,
} from "@mahfuz/shared/types";

const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  "struggling",
  "learning",
  "familiar",
  "confident",
  "mastered",
];

/**
 * Compute memorization stats from cards and review data.
 */
export function computeStats(
  cards: MemorizationCard[],
  reviewedToday: number,
  streak: number,
  now: Date = new Date(),
): MemorizationStats {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const byConfidence = Object.fromEntries(
    CONFIDENCE_LEVELS.map((c) => [c, 0]),
  ) as Record<ConfidenceLevel, number>;

  let dueToday = 0;
  let totalCorrect = 0;
  let totalReviews = 0;

  for (const card of cards) {
    byConfidence[card.confidence] = (byConfidence[card.confidence] || 0) + 1;
    totalCorrect += card.correctReviews;
    totalReviews += card.totalReviews;

    if (card.nextReviewDate.getTime() <= now.getTime()) {
      dueToday++;
    }
  }

  // Count cards created today as "new today"
  const newToday = cards.filter((c) => c.createdAt.getTime() >= todayStart).length;

  const averageAccuracy = totalReviews > 0 ? totalCorrect / totalReviews : 0;

  return {
    totalCards: cards.length,
    dueToday,
    newToday,
    reviewedToday,
    byConfidence,
    averageAccuracy,
    currentStreak: streak,
  };
}

/**
 * Compute consecutive-day streak from review dates.
 * Expects sorted epoch-ms timestamps (one per review).
 * Returns number of consecutive days ending at today.
 */
/**
 * Compute Quran-wide progress: mastered verses count and mastered surah count.
 */
export function computeQuranProgress(cards: MemorizationCard[]): {
  masteredVerses: number;
  masteredSurahs: number;
} {
  let masteredVerses = 0;
  const surahCards = new Map<number, { total: number; mastered: number }>();

  for (const card of cards) {
    const surahId = parseInt(card.verseKey.split(":")[0]);
    let entry = surahCards.get(surahId);
    if (!entry) {
      entry = { total: 0, mastered: 0 };
      surahCards.set(surahId, entry);
    }
    entry.total++;
    if (card.confidence === "mastered") {
      masteredVerses++;
      entry.mastered++;
    }
  }

  // A surah is mastered if ALL its added verses are mastered
  // (simplified: we don't know total verse count here, just check added ones)
  let masteredSurahs = 0;
  for (const [, entry] of surahCards) {
    if (entry.total > 0 && entry.mastered === entry.total) {
      masteredSurahs++;
    }
  }

  return { masteredVerses, masteredSurahs };
}

/**
 * Compute daily review history for last N days.
 */
export function computeDailyHistory(
  reviews: { reviewedAt: number; grade: number }[],
  days: number = 30,
  now: Date = new Date(),
): { date: string; reviews: number; accuracy: number }[] {
  const result: { date: string; reviews: number; accuracy: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const dayReviews = reviews.filter(
      (r) => r.reviewedAt >= dayStart && r.reviewedAt < dayEnd,
    );
    const correct = dayReviews.filter((r) => r.grade >= 3).length;

    result.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      reviews: dayReviews.length,
      accuracy: dayReviews.length > 0 ? correct / dayReviews.length : 0,
    });
  }

  return result;
}

export function computeStreak(reviewDates: number[], now: Date = new Date()): number {
  if (reviewDates.length === 0) return 0;

  // Build a set of unique date strings
  const daySet = new Set<string>();
  for (const ts of reviewDates) {
    const d = new Date(ts);
    daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }

  // Walk backwards from today
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (daySet.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
