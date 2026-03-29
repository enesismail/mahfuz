/**
 * Sync state — version tracking, status, offline queue.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PushInput } from "~/lib/sync-service";

export type SyncStatus = "idle" | "pulling" | "pushing" | "error" | "offline";

interface SyncState {
  serverVersion: number;
  lastPullAt: number; // epoch ms
  lastPushAt: number;
  syncStatus: SyncStatus;
  /** Offline'da biriken değişiklikler */
  outbox: Omit<PushInput, "userId">[];
}

interface SyncActions {
  setServerVersion: (v: number) => void;
  setSyncStatus: (s: SyncStatus) => void;
  markPulled: () => void;
  markPushed: () => void;
  addToOutbox: (change: Omit<PushInput, "userId">) => void;
  clearOutbox: () => void;
  shiftOutbox: () => Omit<PushInput, "userId"> | undefined;
}

export const useSyncStore = create<SyncState & SyncActions>()(
  persist(
    (set, get) => ({
      serverVersion: 0,
      lastPullAt: 0,
      lastPushAt: 0,
      syncStatus: "idle",
      outbox: [],

      setServerVersion: (v) => set({ serverVersion: v }),
      setSyncStatus: (s) => set({ syncStatus: s }),
      markPulled: () => set({ lastPullAt: Date.now() }),
      markPushed: () => set({ lastPushAt: Date.now() }),
      addToOutbox: (change) =>
        set((s) => ({ outbox: [...s.outbox, change] })),
      clearOutbox: () => set({ outbox: [] }),
      shiftOutbox: () => {
        const { outbox } = get();
        if (outbox.length === 0) return undefined;
        const [first, ...rest] = outbox;
        set({ outbox: rest });
        return first;
      },
    }),
    {
      name: "mahfuz-sync",
      version: 1,
      partialize: (s) => ({
        serverVersion: s.serverVersion,
        lastPullAt: s.lastPullAt,
        lastPushAt: s.lastPushAt,
        outbox: s.outbox,
      }),
    },
  ),
);
