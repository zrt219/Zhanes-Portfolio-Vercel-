"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { liveWorkflowTrackerSnapshot } from "@/data/liveWorkflowTracker";
import type { LiveWorkflowTrackerSnapshot } from "@/types/liveWorkflowTracker";

export interface WorkflowTrackerApiResponse {
  ok: boolean;
  data?: LiveWorkflowTrackerSnapshot;
  generatedAt?: string;
  serverTimestamp?: number;
  lastModified?: string;
  etag?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface UseWorkflowTrackerOptions {
  /**
   * Initial static snapshot to serve as default and fallback.
   * Defaults to liveWorkflowTrackerSnapshot.
   */
  initialSnapshot?: LiveWorkflowTrackerSnapshot;

  /**
   * API endpoint to query. Defaults to "/api/workflow-tracker".
   */
  endpoint?: string;

  /**
   * Interval in milliseconds between automatic polls.
   * Defaults to 30,000 (30 seconds).
   */
  pollingIntervalMs?: number;

  /**
   * Enable/disable interval polling. Defaults to true.
   */
  enablePolling?: boolean;

  /**
   * Automatically revalidate when the browser window gains focus or tab becomes visible.
   * Defaults to true.
   */
  revalidateOnFocus?: boolean;

  /**
   * Trigger an automatic sync upon component mount.
   * Defaults to true.
   */
  revalidateOnMount?: boolean;

  /**
   * Minimum duration (ms) between focus-triggered revalidations to avoid spam.
   * Defaults to 3,000 ms.
   */
  focusThrottleMs?: number;
}

export interface UseWorkflowTrackerReturn {
  /** The current live or fallback workflow tracker snapshot */
  snapshot: LiveWorkflowTrackerSnapshot;
  /** True during the initial mount sync */
  isLoading: boolean;
  /** True while an active manual or background refresh is fetching */
  isRefreshing: boolean;
  /** Caught Error instance if last sync failed, otherwise null */
  error: Error | null;
  /** Human-readable fallback message if sync fails */
  errorMessage: string | null;
  /** Timestamp when the tracker last successfully synced */
  lastSyncedAt: Date | null;
  /** ISO string timestamp from the server API payload */
  lastClientRefresh: string;
  /** Relative time representation (e.g. 'Synced just now', 'Synced 5 seconds ago') */
  relativeSyncTime: string;
  /** ETag of current snapshot data for conditional HTTP validation */
  etag: string | null;
  /** True if currently displaying the static fallback snapshot due to fetch failure */
  isFallback: boolean;
  /** True if browser network is currently online */
  isOnline: boolean;
  /** Manually trigger an immediate sync */
  syncNow: () => Promise<void>;
  /** Alias for syncNow */
  refresh: () => Promise<void>;
}

/**
 * Computes a human-friendly relative time string.
 */
export function formatRelativeSyncTime(date: Date | null, referenceTimeMs?: number): string {
  if (!date) {
    return "Not synced yet";
  }

  const now = referenceTimeMs ?? Date.now();
  const diffSec = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (diffSec === 0) {
    return "Synced just now";
  }
  if (diffSec === 1) {
    return "Synced 1 second ago";
  }
  if (diffSec < 60) {
    return `Synced ${diffSec} seconds ago`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) {
    return "Synced 1 minute ago";
  }
  if (diffMin < 60) {
    return `Synced ${diffMin} minutes ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) {
    return "Synced 1 hour ago";
  }
  return `Synced ${diffHours} hours ago`;
}

export function useWorkflowTracker(options: UseWorkflowTrackerOptions = {}): UseWorkflowTrackerReturn {
  const {
    initialSnapshot = liveWorkflowTrackerSnapshot,
    endpoint = "/api/workflow-tracker",
    pollingIntervalMs = 30_000,
    enablePolling = true,
    revalidateOnFocus = true,
    revalidateOnMount = true,
    focusThrottleMs = 3_000,
  } = options;

  const [snapshot, setSnapshot] = useState<LiveWorkflowTrackerSnapshot>(initialSnapshot);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastClientRefresh, setLastClientRefresh] = useState<string>("");
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true,
  );
  const [etag, setEtag] = useState<string | null>(null);

  const fallbackSnapshotRef = useRef<LiveWorkflowTrackerSnapshot>(initialSnapshot);
  fallbackSnapshotRef.current = initialSnapshot;

  const etagRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const consecutiveFailuresRef = useRef(0);
  const lastFetchTimeRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  const [relativeSyncTime, setRelativeSyncTime] = useState<string>(() =>
    formatRelativeSyncTime(null),
  );

  // Update relative time whenever lastSyncedAt changes and tick every second
  useEffect(() => {
    setRelativeSyncTime(formatRelativeSyncTime(lastSyncedAt));
    if (!lastSyncedAt) return;

    const ticker = window.setInterval(() => {
      setRelativeSyncTime(formatRelativeSyncTime(lastSyncedAt));
    }, 1000);

    return () => {
      window.clearInterval(ticker);
    };
  }, [lastSyncedAt]);

  const executeFetch = useCallback(
    async (isManualTrigger = false) => {
      if (isFetchingRef.current) {
        return;
      }

      // Check offline status
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.onLine === false) {
        setIsOnline(false);
        setErrorMessage("Network is offline. Displaying cached public snapshot.");
        setIsFallback(true);
        return;
      }

      isFetchingRef.current = true;
      setIsRefreshing(true);
      if (isManualTrigger) {
        setErrorMessage(null);
        consecutiveFailuresRef.current = 0;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const headers: Record<string, string> = {
          Accept: "application/json",
        };

        if (etagRef.current) {
          headers["If-None-Match"] = etagRef.current;
        }

        const response = await fetch(endpoint, {
          method: "GET",
          headers,
          cache: "no-cache",
          signal: controller.signal,
        });

        lastFetchTimeRef.current = Date.now();

        // 304 Not Modified: Cached snapshot is already the latest
        if (response.status === 304) {
          const now = new Date();
          setLastSyncedAt(now);
          setError(null);
          setErrorMessage(null);
          setIsFallback(false);
          consecutiveFailuresRef.current = 0;
          return;
        }

        if (!response.ok) {
          throw new Error(`Tracker endpoint failed with HTTP ${response.status}`);
        }

        const newEtag = response.headers.get("etag");
        const payload = (await response.json()) as WorkflowTrackerApiResponse;

        if (!payload.ok || !payload.data) {
          throw new Error("Tracker endpoint returned an invalid public snapshot.");
        }

        const resolvedEtag = newEtag ?? payload.etag ?? null;
        if (resolvedEtag) {
          etagRef.current = resolvedEtag;
          setEtag(resolvedEtag);
        }

        setSnapshot(payload.data);
        const syncedDate = new Date();
        setLastSyncedAt(syncedDate);
        setLastClientRefresh(payload.generatedAt ?? syncedDate.toISOString());
        setError(null);
        setErrorMessage(null);
        setIsFallback(false);
        consecutiveFailuresRef.current = 0;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        consecutiveFailuresRef.current += 1;
        const caughtError = err instanceof Error ? err : new Error(String(err));
        setError(caughtError);
        setErrorMessage("Refresh unavailable. Showing bundled public-safe snapshot.");
        setIsFallback(true);
        setSnapshot(fallbackSnapshotRef.current);
      } finally {
        isFetchingRef.current = false;
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [endpoint],
  );

  const syncNow = useCallback(async () => {
    await executeFetch(true);
  }, [executeFetch]);

  // Initial fetch on mount if enabled
  useEffect(() => {
    if (revalidateOnMount) {
      setIsLoading(true);
      void executeFetch(false);
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [revalidateOnMount, executeFetch]);

  // Periodic polling interval with exponential backoff on failure
  useEffect(() => {
    if (typeof window === "undefined" || !enablePolling || pollingIntervalMs <= 0) {
      return;
    }

    let isSubscribed = true;

    const scheduleNextPoll = () => {
      if (!isSubscribed) return;

      // Compute backoff delay if failures occurred (max 5 minutes)
      const failures = consecutiveFailuresRef.current;
      const delay =
        failures === 0
          ? pollingIntervalMs
          : Math.min(pollingIntervalMs * Math.pow(2, failures), 300_000);

      pollingTimeoutRef.current = window.setTimeout(async () => {
        if (!isSubscribed) return;

        // Pause polling if tab is hidden or offline
        const isHidden = typeof document !== "undefined" && document.visibilityState === "hidden";
        const isOffline = typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.onLine === false;

        if (!isHidden && !isOffline) {
          await executeFetch(false);
        }

        scheduleNextPoll();
      }, delay);
    };

    scheduleNextPoll();

    return () => {
      isSubscribed = false;
      if (pollingTimeoutRef.current !== null) {
        window.clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [enablePolling, pollingIntervalMs, executeFetch]);

  // Network online/offline event listeners
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      setErrorMessage(null);
      consecutiveFailuresRef.current = 0;
      void executeFetch(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setErrorMessage("Network is offline. Displaying cached public snapshot.");
      setIsFallback(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [executeFetch]);

  // Revalidate on window focus or visibility change
  useEffect(() => {
    if (typeof window === "undefined" || !revalidateOnFocus) {
      return;
    }

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFetchTimeRef.current < focusThrottleMs) {
        return;
      }
      void executeFetch(false);
    };

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [revalidateOnFocus, focusThrottleMs, executeFetch]);

  return {
    snapshot,
    isLoading,
    isRefreshing,
    error,
    errorMessage,
    lastSyncedAt,
    lastClientRefresh,
    relativeSyncTime,
    etag,
    isFallback,
    isOnline,
    syncNow,
    refresh: syncNow,
  };
}
