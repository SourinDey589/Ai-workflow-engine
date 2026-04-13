"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RequestRecord, fetchRequests, fetchRequestById } from "@/lib/api";

const POLL_INTERVAL_MS = 3000; // poll pending rows every 3 s
const FULL_REFRESH_INTERVAL_MS = 10000; // re-fetch full list every 10 s

const CATEGORY_COLORS: Record<string, string> = {
  billing: "bg-yellow-100 text-yellow-800",
  support: "bg-blue-100 text-blue-800",
  feedback: "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-700",
};

const URGENCY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-orange-100 text-orange-700",
  low: "bg-green-100 text-green-700",
};

const CATEGORIES = ["all", "billing", "support", "feedback", "general"];

const isPending = (r: RequestRecord): boolean =>
  !r.category || !r.summary || !r.urgency;

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-CA");
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} · ${time}`;
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-14 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="h-8 w-full bg-indigo-50 rounded-lg mb-3" />
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Live status pill

function LivePill() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const dots = ".".repeat((tick % 3) + 1).padEnd(3, "\u00a0");
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-0.5">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
      Processing{dots}
    </span>
  );
}

// ─── Request Card

function RequestCard({ req, isNew }: { req: RequestRecord; isNew?: boolean }) {
  const processing = isPending(req);

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border transition-all duration-500 ${
        isNew
          ? "border-indigo-300 ring-2 ring-indigo-100"
          : processing
          ? "border-indigo-100"
          : "border-gray-100 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="font-semibold text-gray-900">{req.name}</p>
          <p className="text-sm text-gray-400">{req.email}</p>
        </div>

        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end items-center">
          {/* Category badge */}
          {req.category ? (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                CATEGORY_COLORS[req.category] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {req.category}
            </span>
          ) : (
            <LivePill />
          )}

          {/* Urgency badge */}
          {req.urgency ? (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                URGENCY_COLORS[req.urgency] ?? "bg-gray-100 text-gray-700"
              }`}
            >
              {req.urgency}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-50 text-gray-300 border border-dashed border-gray-200">
              urgency
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {req.summary ? (
        <p className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-3 py-2 mb-2 font-medium">
          🤖 {req.summary}
        </p>
      ) : (
        <div className="h-8 bg-indigo-50 rounded-lg mb-2 flex items-center px-3 gap-2">
          <span className="w-3 h-3 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" />
          <span className="text-xs text-indigo-400 italic">
            AI is analysing your request…
          </span>
        </div>
      )}

      <p className="text-sm text-gray-500 line-clamp-2">{req.message}</p>
      <p className="text-xs text-gray-300 mt-3">{formatDate(req.createdAt)}</p>
    </div>
  );
}

// ─── Main Client Component

interface DashboardClientProps {
  initialData: RequestRecord[];
  total: number;
  category: string;
  page: number;
}

export default function DashboardClient({
  initialData,
  total,
  category,
  page,
}: DashboardClientProps) {
  const router = useRouter();

  const safeInitial = Array.isArray(initialData) ? initialData : [];
  const [records, setRecords] = useState<RequestRecord[]>(safeInitial);
  const [totalCount, setTotalCount] = useState(total ?? 0);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // ── refs ────────────────────────────────────────────────────────────────────
  const pendingIds = useRef<Set<string>>(
    new Set(safeInitial.filter(isPending).map((r) => r._id))
  );
  const knownIds = useRef<Set<string>>(new Set(safeInitial.map((r) => r._id)));
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const categoryRef = useRef(category);
  const pageRef = useRef(page);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);
  const stopFullRefresh = useCallback(() => {
    if (fullRefreshRef.current) {
      clearInterval(fullRefreshRef.current);
      fullRefreshRef.current = null;
    }
  }, []);

  const pollPending = useCallback(async () => {
    if (pendingIds.current.size === 0) {
      stopPoll();
      return;
    }

    await Promise.allSettled(
      Array.from(pendingIds.current).map(async (id) => {
        try {
          const updated = await fetchRequestById(id);
          if (!isPending(updated)) {
            pendingIds.current.delete(id);
            setRecords((prev) => prev.map((r) => (r._id === id ? updated : r)));
          }
        } catch {
          /* retry next tick */
        }
      })
    );

    if (pendingIds.current.size === 0) stopPoll();
  }, [stopPoll]);

  const startPoll = useCallback(() => {
    if (pollRef.current !== null) return;
    pollRef.current = setInterval(pollPending, POLL_INTERVAL_MS);
  }, [pollPending]);

  const fullRefresh = useCallback(async () => {
    try {
      const res = await fetchRequests(pageRef.current, categoryRef.current);
      const safe = Array.isArray(res.data) ? res.data : [];

      // Detect genuinely new records
      const incoming = new Set<string>();
      safe.forEach((r) => {
        if (!knownIds.current.has(r._id)) incoming.add(r._id);
        knownIds.current.add(r._id);
      });

      setRecords(safe);
      setTotalCount(res.total ?? 0);
      setLastRefresh(new Date());

      // Flash highlight new rows for 4 s
      if (incoming.size > 0) {
        setNewIds((prev) => new Set([...prev, ...incoming]));
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            incoming.forEach((id) => next.delete(id));
            return next;
          });
        }, 4000);
      }

      // Register newly pending rows
      const freshPending = safe.filter(isPending).map((r) => r._id);
      freshPending.forEach((id) => pendingIds.current.add(id));
      if (freshPending.length > 0) startPoll();
    } catch {
      /* silent — don't disrupt the UI on network hiccup */
    }
  }, [startPoll]);

  const startFullRefresh = useCallback(() => {
    if (fullRefreshRef.current !== null) return;
    fullRefreshRef.current = setInterval(fullRefresh, FULL_REFRESH_INTERVAL_MS);
  }, [fullRefresh]);

  useEffect(() => {
    if (pendingIds.current.size > 0) startPoll();
    startFullRefresh();
    return () => {
      stopPoll();
      stopFullRefresh();
    };
  }, [startPoll, startFullRefresh, stopPoll, stopFullRefresh]);

  useEffect(() => {
    const safe = Array.isArray(initialData) ? initialData : [];
    setRecords(safe);
    setTotalCount(total ?? 0);
    knownIds.current = new Set(safe.map((r) => r._id));
    const np = new Set(safe.filter(isPending).map((r) => r._id));
    pendingIds.current = np;
    stopPoll();
    stopFullRefresh();
    if (np.size > 0) startPoll();
    startFullRefresh();
  }, [
    initialData,
    total,
    startPoll,
    startFullRefresh,
    stopPoll,
    stopFullRefresh,
  ]);

  const navigate = useCallback(
    (cat: string, pg: number) => {
      const p = new URLSearchParams();
      if (cat !== "all") p.set("category", cat);
      if (pg > 1) p.set("page", String(pg));
      const qs = p.toString();
      router.push(`/dashboard${qs ? `?${qs}` : ""}`);
    },
    [router]
  );

  const hasPending = records.some(isPending);
  const pendingCount = records.filter(isPending).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Request Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-sm text-gray-400">{totalCount} total requests</p>

            {hasPending && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                {pendingCount} enriching…
              </span>
            )}

            {/* Live indicator — always visible */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>

            {lastRefresh && (
              <span className="text-xs text-gray-300">
                updated {formatDate(lastRefresh.toISOString())}
              </span>
            )}
          </div>
        </div>
        <a
          href="/submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + New Request
        </a>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(cat, 1)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize cursor-pointer ${
              category === cat
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Records / empty state */}
      {records.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No requests found
          </h3>
          <p className="text-gray-400 mb-6">
            {category !== "all"
              ? `No "${category}" requests yet.`
              : "No requests submitted yet."}
          </p>
          <a
            href="/submit"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Submit your first request
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((req) => (
            <RequestCard key={req._id} req={req} isNew={newIds.has(req._id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex justify-center gap-3 mt-8">
          {page > 1 && (
            <button
              onClick={() => navigate(category, page - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
            >
              ← Previous
            </button>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
          {records.length === 10 && (
            <button
              onClick={() => navigate(category, page + 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 cursor-pointer"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
