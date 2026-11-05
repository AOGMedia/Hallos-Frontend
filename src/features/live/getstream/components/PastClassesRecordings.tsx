"use client";

import Link from "next/link";
import { ChevronRight, Film } from "lucide-react";
import { recordingsHref, type RecordedGetStreamClass } from "../api";

const dateLabel = (c: RecordedGetStreamClass) => {
  const when = c.startTime || c.updatedAt;
  return when ? new Date(when).toLocaleDateString([], { dateStyle: "medium" }) : "";
};

/**
 * The creator's finished Interactive Classroom classes that were recorded,
 * each opening its recordings (download, or publish for sale).
 */
export function PastClassesRecordings({ classes }: { classes: RecordedGetStreamClass[] }) {
  if (!classes.length) return null;
  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-text-primary">Recorded classes ({classes.length})</h3>
      <p className="mb-4 text-sm text-white/50">Download your class recordings or publish them for sale.</p>
      <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-[#1F2636]">
        {classes.map((c) => (
          <li key={c.id}>
            <Link
              href={recordingsHref({ kind: "class", id: c.id })}
              className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Film className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{c.title}</span>
                <span className="block text-xs text-white/50">{dateLabel(c)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
                Recordings <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
