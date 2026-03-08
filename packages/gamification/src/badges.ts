export type BadgeCategory = "verse" | "surah" | "streak" | "special" | "learn";

export interface BadgeDefinition {
  id: string;
  icon: string;
  category: BadgeCategory;
  /** Check function receives context and returns true if badge should be unlocked */
  check: (ctx: BadgeCheckContext) => boolean;
}

export interface BadgeCheckContext {
  masteredVerses: number;
  masteredSurahs: number;
  currentStreak: number;
  totalReviewsToday: number;
  sessionAccuracy: number; // 0-1
  sessionCardCount: number;
  // Learn module
  learnLessonsCompleted?: number;
  learnStagesCompleted?: number[];  // Array of completed stage IDs
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Verse milestones
  {
    id: "first-verse",
    icon: "🌱",
    category: "verse",
    check: (ctx) => ctx.masteredVerses >= 1,
  },
  {
    id: "10-verses",
    icon: "📗",
    category: "verse",
    check: (ctx) => ctx.masteredVerses >= 10,
  },
  {
    id: "50-verses",
    icon: "📘",
    category: "verse",
    check: (ctx) => ctx.masteredVerses >= 50,
  },
  {
    id: "100-verses",
    icon: "📙",
    category: "verse",
    check: (ctx) => ctx.masteredVerses >= 100,
  },
  {
    id: "500-verses",
    icon: "🏆",
    category: "verse",
    check: (ctx) => ctx.masteredVerses >= 500,
  },
  {
    id: "1000-verses",
    icon: "👑",
    category: "verse",
    check: (ctx) => ctx.masteredVerses >= 1000,
  },

  // Surah milestones
  {
    id: "first-surah",
    icon: "⭐",
    category: "surah",
    check: (ctx) => ctx.masteredSurahs >= 1,
  },
  {
    id: "5-surahs",
    icon: "🌟",
    category: "surah",
    check: (ctx) => ctx.masteredSurahs >= 5,
  },
  {
    id: "10-surahs",
    icon: "💫",
    category: "surah",
    check: (ctx) => ctx.masteredSurahs >= 10,
  },

  // Streak milestones
  {
    id: "streak-7",
    icon: "🔥",
    category: "streak",
    check: (ctx) => ctx.currentStreak >= 7,
  },
  {
    id: "streak-30",
    icon: "🔥",
    category: "streak",
    check: (ctx) => ctx.currentStreak >= 30,
  },
  {
    id: "streak-100",
    icon: "🔥",
    category: "streak",
    check: (ctx) => ctx.currentStreak >= 100,
  },

  // Special
  {
    id: "hatim",
    icon: "🕌",
    category: "special",
    check: (ctx) => ctx.masteredVerses >= 6236,
  },
  {
    id: "perfect-session",
    icon: "💎",
    category: "special",
    check: (ctx) => ctx.sessionAccuracy === 1 && ctx.sessionCardCount >= 5,
  },
  {
    id: "dedicated-50",
    icon: "⚡",
    category: "special",
    check: (ctx) => ctx.totalReviewsToday >= 50,
  },

  // Learn module
  {
    id: "learn-first-lesson",
    icon: "📖",
    category: "learn",
    check: (ctx) => (ctx.learnLessonsCompleted ?? 0) >= 1,
  },
  {
    id: "learn-alphabet-master",
    icon: "🔤",
    category: "learn",
    check: (ctx) => (ctx.learnStagesCompleted ?? []).includes(1),
  },
  {
    id: "learn-harakat-hero",
    icon: "✨",
    category: "learn",
    check: (ctx) => {
      const completed = ctx.learnStagesCompleted ?? [];
      return completed.includes(3) && completed.includes(4) && completed.includes(5);
    },
  },
  {
    id: "learn-word-reader",
    icon: "📝",
    category: "learn",
    check: (ctx) => (ctx.learnStagesCompleted ?? []).includes(10),
  },
  {
    id: "learn-surah-reader",
    icon: "📜",
    category: "learn",
    check: (ctx) => (ctx.learnStagesCompleted ?? []).includes(11),
  },
  {
    id: "learn-tajweed-student",
    icon: "🎓",
    category: "learn",
    check: (ctx) => (ctx.learnStagesCompleted ?? []).includes(12),
  },
  {
    id: "learn-complete",
    icon: "🏅",
    category: "learn",
    check: (ctx) => (ctx.learnStagesCompleted ?? []).length >= 14,
  },
];
