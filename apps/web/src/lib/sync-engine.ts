import { memorizationRepository } from "@mahfuz/db";
import { db } from "@mahfuz/db";
import type { MemorizationCardEntry, ReviewEntryRecord, SyncQueueRecord } from "@mahfuz/db";
import type { ConfidenceLevel, QualityGrade, VerseKey } from "@mahfuz/shared/types";
import { pushChanges, pullChanges } from "./sync-server-fns";

type SyncStatus = "idle" | "syncing" | "error";

export class SyncEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private userId: string;
  private lastSyncAt: number;
  private onStatusChange: (status: SyncStatus, error?: string) => void;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(
    userId: string,
    lastSyncAt: number,
    onStatusChange: (status: SyncStatus, error?: string) => void,
  ) {
    this.userId = userId;
    this.lastSyncAt = lastSyncAt;
    this.onStatusChange = onStatusChange;
  }

  start() {
    // Sync every 5 minutes
    this.intervalId = setInterval(() => this.sync(), 5 * 60 * 1000);

    // Sync on visibility change (tab becomes visible)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibility);
    }

    // Initial sync
    this.sync();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibility);
    }
  }

  private handleVisibility = () => {
    if (document.visibilityState === "visible") {
      this.sync();
    }
  };

  async sync(): Promise<void> {
    this.onStatusChange("syncing");

    try {
      // Push: get pending sync queue records
      const pending = await memorizationRepository.getPendingSyncRecords();

      if (pending.length > 0) {
        const cards: any[] = [];
        const reviews: any[] = [];
        let goals: any = undefined;

        for (const record of pending) {
          const data = JSON.parse(record.data);
          if (record.table === "memorization_cards") {
            cards.push(data);
          } else if (record.table === "review_entries") {
            reviews.push(data);
          } else if (record.table === "memorization_goals") {
            goals = data;
          }
        }

        await pushChanges({ data: { cards, reviews, goals } });

        // Mark as synced
        await memorizationRepository.markSynced(pending.map((r) => r.id));

        // Cleanup old synced records (older than 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        await memorizationRepository.clearSyncedRecords(sevenDaysAgo);
      }

      // Pull: get changes from server since last sync
      const pulled = await pullChanges({ data: { since: this.lastSyncAt } });

      // Merge cards (last-write-wins)
      for (const serverCard of pulled.cards) {
        const localCard = await db.memorization_cards
          .where("[userId+verseKey]")
          .equals([this.userId, serverCard.verseKey])
          .first();

        if (!localCard || serverCard.updatedAt > localCard.updatedAt) {
          await db.memorization_cards.put({
            id: serverCard.id,
            userId: this.userId,
            verseKey: serverCard.verseKey as VerseKey,
            easeFactor: serverCard.easeFactor,
            repetition: serverCard.repetition,
            interval: serverCard.interval,
            nextReviewDate: serverCard.nextReviewDate,
            confidence: serverCard.confidence as ConfidenceLevel,
            totalReviews: serverCard.totalReviews,
            correctReviews: serverCard.correctReviews,
            createdAt: serverCard.createdAt,
            updatedAt: serverCard.updatedAt,
          });
        }
      }

      // Merge reviews (insert if not exists)
      for (const serverReview of pulled.reviews) {
        const exists = await db.review_entries.get(serverReview.id);
        if (!exists) {
          await db.review_entries.add({
            id: serverReview.id,
            userId: this.userId,
            cardId: serverReview.cardId,
            verseKey: serverReview.verseKey as VerseKey,
            grade: serverReview.grade as QualityGrade,
            previousEaseFactor: serverReview.previousEaseFactor,
            newEaseFactor: serverReview.newEaseFactor,
            previousInterval: serverReview.previousInterval,
            newInterval: serverReview.newInterval,
            reviewedAt: serverReview.reviewedAt,
          });
        }
      }

      // Merge badges
      for (const badge of pulled.badges) {
        await memorizationRepository.addBadge(this.userId, badge.badgeId);
      }

      this.lastSyncAt = Date.now();
      this.retryCount = 0;
      this.onStatusChange("idle");
    } catch (err) {
      this.retryCount++;
      if (this.retryCount >= this.maxRetries) {
        this.onStatusChange(
          "error",
          err instanceof Error ? err.message : "Sync failed",
        );
      } else {
        // Will retry on next interval
        this.onStatusChange("idle");
      }
    }
  }

  getLastSyncAt(): number {
    return this.lastSyncAt;
  }
}
