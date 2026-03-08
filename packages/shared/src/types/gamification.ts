/** Sevap Point event types and their values */
export type SevapPointEventType =
  | "verse_read"
  | "page_read"
  | "surah_complete"
  | "verse_memorized"
  | "hatim_complete"
  | "daily_login"
  | "review_session";

export const SEVAP_POINT_VALUES: Record<SevapPointEventType, number> = {
  verse_read: 1,
  page_read: 10,
  surah_complete: 50,
  verse_memorized: 20,
  hatim_complete: 500,
  daily_login: 5,
  review_session: 15,
} as const;

/** User gamification state */
export interface UserGamification {
  userId: string;
  totalSevapPoint: number;
  level: number;
  sevapPointToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date
  hatimCount: number;
  versesRead: number;
  totalReadingTimeSeconds: number;
  achievements: UserAchievement[];
  updatedAt: Date;
}

/** Achievement definition */
export interface Achievement {
  id: string;
  name: string;
  nameAr: string;
  nameTr: string;
  description: string;
  descriptionTr: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
}

export type AchievementCategory =
  | "reading"
  | "memorization"
  | "streak"
  | "milestone"
  | "special";

export interface AchievementRequirement {
  type: "verses_read" | "surah_complete" | "streak_days" | "hatim_count" | "cards_mastered";
  value: number;
  surahId?: number; // For specific surah achievements
}

/** User's unlocked achievement */
export interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
}

/** Level calculation: 100 * 1.5^(level-1) */
export function sevapPointForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/** Get level from total Sevap Point */
export function levelFromSevapPoint(totalSevapPoint: number): { level: number; sevapPointInLevel: number; sevapPointToNext: number } {
  let level = 1;
  let remainingSevapPoint = totalSevapPoint;

  while (remainingSevapPoint >= sevapPointForLevel(level)) {
    remainingSevapPoint -= sevapPointForLevel(level);
    level++;
  }

  return {
    level,
    sevapPointInLevel: remainingSevapPoint,
    sevapPointToNext: sevapPointForLevel(level) - remainingSevapPoint,
  };
}
