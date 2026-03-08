import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth";
import { db } from "~/db";
import {
  memorizationCard,
  reviewEntry,
  memorizationGoals,
  userBadge,
  userStats,
} from "~/db/memorization-schema";
import { eq, and, gt } from "drizzle-orm";

interface PushPayload {
  cards: Array<{
    id: string;
    verseKey: string;
    easeFactor: number;
    repetition: number;
    interval: number;
    nextReviewDate: number;
    confidence: string;
    totalReviews: number;
    correctReviews: number;
    createdAt: number;
    updatedAt: number;
  }>;
  reviews: Array<{
    id: string;
    cardId: string;
    verseKey: string;
    grade: number;
    previousEaseFactor: number;
    newEaseFactor: number;
    previousInterval: number;
    newInterval: number;
    reviewedAt: number;
  }>;
  goals?: {
    newCardsPerDay: number;
    reviewCardsPerDay: number;
    updatedAt: number;
  };
}

interface PullResponse {
  cards: Array<{
    id: string;
    verseKey: string;
    easeFactor: number;
    repetition: number;
    interval: number;
    nextReviewDate: number;
    confidence: string;
    totalReviews: number;
    correctReviews: number;
    createdAt: number;
    updatedAt: number;
  }>;
  reviews: Array<{
    id: string;
    cardId: string;
    verseKey: string;
    grade: number;
    previousEaseFactor: number;
    newEaseFactor: number;
    previousInterval: number;
    newInterval: number;
    reviewedAt: number;
  }>;
  goals: {
    newCardsPerDay: number;
    reviewCardsPerDay: number;
    updatedAt: number;
  } | null;
  badges: Array<{ badgeId: string; unlockedAt: number }>;
  stats: {
    currentStreak: number;
    longestStreak: number;
    lastReviewDate: number | null;
    totalSevapPoint: number;
    updatedAt: number;
  } | null;
}

async function getAuthUser() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export const pushChanges = createServerFn({ method: "POST" })
  .inputValidator((data: PushPayload) => data)
  .handler(async ({ data }) => {
    const userId = await getAuthUser();

    // Upsert cards (last-write-wins by updatedAt)
    for (const card of data.cards) {
      const existing = await db
        .select({ updatedAt: memorizationCard.updatedAt })
        .from(memorizationCard)
        .where(
          and(
            eq(memorizationCard.userId, userId),
            eq(memorizationCard.verseKey, card.verseKey),
          ),
        )
        .get();

      if (existing && existing.updatedAt >= card.updatedAt) continue;

      await db
        .insert(memorizationCard)
        .values({
          id: card.id,
          userId,
          verseKey: card.verseKey,
          easeFactor: card.easeFactor,
          repetition: card.repetition,
          interval: card.interval,
          nextReviewDate: card.nextReviewDate,
          confidence: card.confidence,
          totalReviews: card.totalReviews,
          correctReviews: card.correctReviews,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
        })
        .onConflictDoUpdate({
          target: [memorizationCard.userId, memorizationCard.verseKey],
          set: {
            easeFactor: card.easeFactor,
            repetition: card.repetition,
            interval: card.interval,
            nextReviewDate: card.nextReviewDate,
            confidence: card.confidence,
            totalReviews: card.totalReviews,
            correctReviews: card.correctReviews,
            updatedAt: card.updatedAt,
          },
        });
    }

    // Insert reviews (idempotent by id)
    for (const review of data.reviews) {
      await db
        .insert(reviewEntry)
        .values({
          id: review.id,
          userId,
          cardId: review.cardId,
          verseKey: review.verseKey,
          grade: review.grade,
          previousEaseFactor: review.previousEaseFactor,
          newEaseFactor: review.newEaseFactor,
          previousInterval: review.previousInterval,
          newInterval: review.newInterval,
          reviewedAt: review.reviewedAt,
        })
        .onConflictDoNothing();
    }

    // Upsert goals
    if (data.goals) {
      await db
        .insert(memorizationGoals)
        .values({
          userId,
          newCardsPerDay: data.goals.newCardsPerDay,
          reviewCardsPerDay: data.goals.reviewCardsPerDay,
          updatedAt: data.goals.updatedAt,
        })
        .onConflictDoUpdate({
          target: memorizationGoals.userId,
          set: {
            newCardsPerDay: data.goals.newCardsPerDay,
            reviewCardsPerDay: data.goals.reviewCardsPerDay,
            updatedAt: data.goals.updatedAt,
          },
        });
    }

    return { ok: true };
  });

export const pullChanges = createServerFn({ method: "GET" })
  .inputValidator((data: { since: number }) => data)
  .handler(async ({ data }): Promise<PullResponse> => {
    const userId = await getAuthUser();

    const cards = await db
      .select()
      .from(memorizationCard)
      .where(
        and(
          eq(memorizationCard.userId, userId),
          gt(memorizationCard.updatedAt, data.since),
        ),
      );

    const reviews = await db
      .select()
      .from(reviewEntry)
      .where(
        and(
          eq(reviewEntry.userId, userId),
          gt(reviewEntry.reviewedAt, data.since),
        ),
      );

    const goalsRow = await db
      .select()
      .from(memorizationGoals)
      .where(eq(memorizationGoals.userId, userId))
      .get();

    const badges = await db
      .select({ badgeId: userBadge.badgeId, unlockedAt: userBadge.unlockedAt })
      .from(userBadge)
      .where(eq(userBadge.userId, userId));

    const statsRow = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .get();

    return {
      cards: cards.map((c) => ({
        id: c.id,
        verseKey: c.verseKey,
        easeFactor: c.easeFactor,
        repetition: c.repetition,
        interval: c.interval,
        nextReviewDate: c.nextReviewDate,
        confidence: c.confidence,
        totalReviews: c.totalReviews,
        correctReviews: c.correctReviews,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        cardId: r.cardId,
        verseKey: r.verseKey,
        grade: r.grade,
        previousEaseFactor: r.previousEaseFactor,
        newEaseFactor: r.newEaseFactor,
        previousInterval: r.previousInterval,
        newInterval: r.newInterval,
        reviewedAt: r.reviewedAt,
      })),
      goals: goalsRow
        ? {
            newCardsPerDay: goalsRow.newCardsPerDay,
            reviewCardsPerDay: goalsRow.reviewCardsPerDay,
            updatedAt: goalsRow.updatedAt,
          }
        : null,
      badges,
      stats: statsRow
        ? {
            currentStreak: statsRow.currentStreak,
            longestStreak: statsRow.longestStreak,
            lastReviewDate: statsRow.lastReviewDate,
            totalSevapPoint: statsRow.totalSevapPoint,
            updatedAt: statsRow.updatedAt,
          }
        : null,
    };
  });
