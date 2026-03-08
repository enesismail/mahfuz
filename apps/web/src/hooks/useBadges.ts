import { useState, useEffect, useCallback } from "react";
import { memorizationRepository } from "@mahfuz/db";
import type { UserBadgeEntry } from "@mahfuz/db";
import { checkNewBadges, type BadgeCheckContext } from "@mahfuz/gamification";

export function useBadges(userId: string | undefined) {
  const [badges, setBadges] = useState<UserBadgeEntry[]>([]);
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);

  const loadBadges = useCallback(async () => {
    if (!userId) return;
    const loaded = await memorizationRepository.getUnlockedBadges(userId);
    setBadges(loaded);
  }, [userId]);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  /**
   * Check for new badges after a session.
   * Call this after review/practice session completes.
   */
  const checkBadges = useCallback(
    async (ctx: BadgeCheckContext) => {
      if (!userId) return [];

      const current = await memorizationRepository.getUnlockedBadges(userId);
      const alreadyUnlocked = new Set(current.map((b) => b.badgeId));

      const newlyEarned = checkNewBadges(ctx, alreadyUnlocked);

      if (newlyEarned.length > 0) {
        for (const badgeId of newlyEarned) {
          await memorizationRepository.addBadge(userId, badgeId);
        }
        setNewBadgeIds(newlyEarned);
        await loadBadges();
      }

      return newlyEarned;
    },
    [userId, loadBadges],
  );

  const clearNewBadges = useCallback(() => {
    setNewBadgeIds([]);
  }, []);

  return {
    badges,
    newBadgeIds,
    checkBadges,
    clearNewBadges,
    loadBadges,
  };
}
