"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MessageSquareText } from "lucide-react";
import { feedbackResultsHref, getMyFeedbackList } from "../api";
import { Rating } from "./ResultsParts";

const dateOf = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString([], { dateStyle: "medium" }) : "");

/**
 * The creator's finished classes and series sessions, each opening what
 * participants said. Shows nothing until a class has ended with people in it.
 */
export function MyFeedbackList({ search = "" }: { search?: string }) {
  const { data } = useQuery({ queryKey: ["class-feedback-mine"], queryFn: getMyFeedbackList, staleTime: 60_000 });
  const term = search.trim().toLowerCase();
  const items = (data ?? []).filter((item) => !term || item.title.toLowerCase().includes(term));
  if (!items.length) return null;

  return (
    <div>
      <h3 className="mb-1 text-lg font-semibold text-text-primary">Class feedback</h3>
      <p className="mb-4 text-sm text-white/50">What people said after your classes.</p>
      <ul className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/5 bg-[#1F2636]">
        {items.map((item) => (
          <li key={`${item.kind}:${item.id}`}>
            <Link href={feedbackResultsHref(item.kind, item.id)} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MessageSquareText className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {item.title}
                  {item.sessionLabel ? <span className="text-white/50"> · {item.sessionLabel}</span> : null}
                </span>
                <span className="block text-xs text-white/50">
                  {dateOf(item.endedAt ?? item.startedAt)}
                  {` · ${item.responses} ${item.responses === 1 ? "answer" : "answers"}`}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                {item.responses ? <Rating value={item.averageOverall} /> : <span className="text-white/40">No answers</span>}
                <ChevronRight className="h-4 w-4 text-white/40" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
