import { BADGE_DEFINITIONS, type BadgeCheckContext } from "./badges";

/**
 * Check which badges are newly unlocked.
 * Returns array of badge IDs that are newly earned.
 */
export function checkNewBadges(
  ctx: BadgeCheckContext,
  alreadyUnlocked: Set<string>,
): string[] {
  const newBadges: string[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (alreadyUnlocked.has(badge.id)) continue;
    if (badge.check(ctx)) {
      newBadges.push(badge.id);
    }
  }

  return newBadges;
}
