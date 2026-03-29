/**
 * Reading position persistence — server-side save/load.
 * Kullanıcının son okuma konumlarını DB'de saklar.
 * Max 5 pozisyon, sure bazlı deduplicated.
 */

import { createServerFn } from "@tanstack/react-start";
import { db } from "~/db";
import { readingPosition } from "~/db/schema";
import { eq, and, desc } from "drizzle-orm";

const MAX_POSITIONS = 5;

interface SavePositionInput {
  userId: string;
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
}

export interface ReadingPositionRow {
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
}

/** Kullanıcının son okuma konumlarını getir (max 5, en son güncellenen önce) */
export const getReadingPositions = createServerFn({ method: "GET" })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }): Promise<ReadingPositionRow[]> => {
    return db
      .select({
        surahId: readingPosition.surahId,
        ayahNumber: readingPosition.ayahNumber,
        pageNumber: readingPosition.pageNumber,
      })
      .from(readingPosition)
      .where(eq(readingPosition.userId, userId))
      .orderBy(desc(readingPosition.updatedAt))
      .limit(MAX_POSITIONS);
  });

/** Okuma konumunu kaydet (upsert: aynı sure varsa güncelle, yoksa ekle, max 5 tut) */
export const saveReadingPosition = createServerFn({ method: "POST" })
  .inputValidator((input: SavePositionInput) => input)
  .handler(async ({ data: { userId, surahId, ayahNumber, pageNumber } }) => {
    const now = new Date();

    // Aynı sure için mevcut kayıt var mı?
    const [existing] = await db
      .select({ id: readingPosition.id })
      .from(readingPosition)
      .where(and(eq(readingPosition.userId, userId), eq(readingPosition.surahId, surahId)))
      .limit(1);

    if (existing) {
      // Güncelle
      await db
        .update(readingPosition)
        .set({ ayahNumber, pageNumber, updatedAt: now })
        .where(eq(readingPosition.id, existing.id));
    } else {
      // Yeni ekle
      await db.insert(readingPosition).values({
        userId,
        surahId,
        ayahNumber,
        pageNumber,
        updatedAt: now,
      });

      // Max aşıldıysa en eskiyi sil
      const all = await db
        .select({ id: readingPosition.id })
        .from(readingPosition)
        .where(eq(readingPosition.userId, userId))
        .orderBy(desc(readingPosition.updatedAt));

      if (all.length > MAX_POSITIONS) {
        const toDelete = all.slice(MAX_POSITIONS);
        for (const row of toDelete) {
          await db.delete(readingPosition).where(eq(readingPosition.id, row.id));
        }
      }
    }
  });
