import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 5;

export interface ReadingPosition {
  surahId: number;
  ayahNumber: number;
  pageNumber: number;
}

interface ReadingState {
  /** Most recent position (backward compat) */
  lastPosition: ReadingPosition | null;
  /** MRU list — max 5, deduplicated by surahId */
  recentPositions: ReadingPosition[];
  /** Whether DB positions have been loaded for current session */
  _dbLoaded: boolean;
}

interface ReadingActions {
  savePosition: (position: ReadingPosition) => void;
  /** Replace all positions from DB (called on login/load) */
  _loadFromDb: (positions: ReadingPosition[]) => void;
}

export const useReadingStore = create<ReadingState & ReadingActions>()(
  persist(
    (set, get) => ({
      lastPosition: null,
      recentPositions: [],
      _dbLoaded: false,
      savePosition: (position) => {
        const prev = get().recentPositions;
        const filtered = prev.filter((p) => p.surahId !== position.surahId);
        const next = [position, ...filtered].slice(0, MAX_RECENT);
        set({ lastPosition: position, recentPositions: next });
      },
      _loadFromDb: (positions) => {
        if (positions.length === 0) return;
        set({
          recentPositions: positions.slice(0, MAX_RECENT),
          lastPosition: positions[0] ?? null,
          _dbLoaded: true,
        });
      },
    }),
    {
      name: "mahfuz-core-reading",
      partialize: (state) => ({
        lastPosition: state.lastPosition,
        recentPositions: state.recentPositions,
      }),
    },
  ),
);
