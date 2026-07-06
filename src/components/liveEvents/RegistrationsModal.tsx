"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Users, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getLiveClassRegistrations,
  type RegistrationsResponse,
  type RegistrationEntry,
} from "@/services/liveClassService";
import { getSeriesRegistrations } from "@/services/seriesService";

interface RegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityTitle: string;
  entityType?: "class" | "series";
}

export default function RegistrationsModal({
  isOpen,
  onClose,
  entityId,
  entityTitle,
  entityType = "class",
}: RegistrationsModalProps) {
  const [data, setData] = useState<RegistrationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        entityType === "series"
          ? await getSeriesRegistrations(entityId, page, limit)
          : await getLiveClassRegistrations(entityId, page, limit);
      // Both responses map to the same shape
      setData(res as RegistrationsResponse);
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, page]);

  useEffect(() => {
    if (isOpen) fetchRegistrations();
  }, [isOpen, fetchRegistrations]);

  if (!isOpen) return null;

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
      <div className="bg-background-dark rounded-2xl border border-border/10 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <Users size={18} className="text-primary shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                Registrations
              </h3>
              <p className="text-xs text-text-primary/50 truncate">
                {entityTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-text-primary/60 hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Bar */}
        {data && (
          <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-white/5">
            <div className="text-center">
              <p className="text-lg font-bold text-text-primary">
                {data.total}
              </p>
              <p className="text-xs text-text-primary/40">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">
                {data.totalPaid}
              </p>
              <p className="text-xs text-text-primary/40">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">
                {data.totalFree}
              </p>
              <p className="text-xs text-text-primary/40">Free</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button
                onClick={fetchRegistrations}
                className="text-sm text-primary hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && data && data.registrations.length === 0 && (
            <div className="text-center py-10 text-text-primary/40 text-sm">
              No registrations yet.
            </div>
          )}

          {!loading &&
            !error &&
            data &&
            data.registrations.length > 0 && (
              <div className="space-y-2">
                {data.registrations.map((r: RegistrationEntry, idx: number) => (
                  <div
                    key={`${r.userId}-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-semibold">
                          {r.firstname?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {r.firstname} {r.lastname}
                        </p>
                        <p className="text-xs text-text-primary/40 truncate">
                          {r.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.registrationType === "paid" && r.amount ? (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">
                          {r.currency || "NGN"}{" "}
                          {r.amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-primary/60 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-text-primary/50">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-primary/60 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
