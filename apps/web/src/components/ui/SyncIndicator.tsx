import { useSyncStore } from "~/stores/useSyncStore";

export function SyncIndicator() {
  const status = useSyncStore((s) => s.status);
  const lastError = useSyncStore((s) => s.lastError);

  if (status === "idle") {
    return (
      <span
        className="text-[var(--theme-text-quaternary)]"
        title="Synced"
      >
        <CloudCheckIcon />
      </span>
    );
  }

  if (status === "syncing") {
    return (
      <span
        className="animate-pulse text-primary-500"
        title="Syncing..."
      >
        <CloudSyncIcon />
      </span>
    );
  }

  if (status === "error") {
    return (
      <span
        className="text-red-500"
        title={lastError || "Sync error"}
      >
        <CloudErrorIcon />
      </span>
    );
  }

  return null;
}

function CloudCheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2 2 4-4" />
    </svg>
  );
}

function CloudSyncIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4m0-4l-1.5 1.5M12 10l1.5 1.5" />
    </svg>
  );
}

function CloudErrorIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.008" />
    </svg>
  );
}
