"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft, EyeOff, Loader2, MessageSquareText } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { friendlyErrorMessage } from "@/features/network/friendlyError";
import {
  getMyFeedback,
  type ChoiceStats,
  type MyFeedbackDetail,
  type RatingStats,
} from "../api";
import {
  answerLabel,
  HOST_WORDS,
  OVERALL_WORDS,
  RESULT_QUESTIONS,
} from "./labels";
import { ChoiceRows, Panel, Rating, RatingRows } from "./ResultsParts";

const dateOf = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

/**
 * What participants said about one of the creator's classes or series
 * sessions. Anonymous answers show without a name; hosts' own notes to Hallos
 * are never here (the server leaves them out).
 */
export function MyFeedbackPage({
  kind,
  id,
}: {
  kind: "class" | "session";
  id: string;
}) {
  const query = useQuery({
    queryKey: ["class-feedback-results", kind, id],
    queryFn: () => getMyFeedback(kind, id),
    retry: (count, error) =>
      !(isAxiosError(error) && error.response?.status === 404) && count < 2,
  });

  return (
    <div className="min-h-[100dvh] bg-[#0d111b] px-4 pb-12 pt-[max(env(safe-area-inset-top),16px)] text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard/schedule"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </Link>

        {query.isLoading ? (
          <div className="flex justify-center py-24" aria-label="Loading">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
          </div>
        ) : query.isError || !query.data ? (
          <div className="rounded-3xl border border-white/10 bg-[#161c2b] p-6 text-center">
            {isAxiosError(query.error) &&
            query.error.response?.status === 404 ? (
              <>
                <p className="font-semibold">
                  We couldn’t find feedback for this class.
                </p>
                <p className="mt-1 text-sm text-white/60">
                  Only the person who created a class can see its feedback.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">
                  {friendlyErrorMessage(query.error)}
                </p>
                <button
                  type="button"
                  onClick={() => void query.refetch()}
                  className="mt-4 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/15"
                >
                  Try again
                </button>
              </>
            )}
          </div>
        ) : (
          <Results data={query.data} />
        )}
      </div>
    </div>
  );
}

function Results({ data }: { data: MyFeedbackDetail }) {
  const s = data.summary;
  const host = s.answers.host as RatingStats | undefined;
  const choice = (key: string) => s.answers[key] as ChoiceStats | undefined;
  const ended = dateOf(data.endedAt ?? data.startedAt);
  const nothingToImprove = choice("improve")?.counts.nothing ?? 0;

  return (
    <>
      <p className="text-sm text-white/50">
        {data.kind === "session" ? "Series session" : "Live class"}
        {ended ? ` · ${ended}` : ""}
      </p>
      <h1 className="mt-1 text-2xl font-bold leading-tight">
        {data.title}
        {data.sessionLabel ? (
          <span className="text-white/50"> · {data.sessionLabel}</span>
        ) : null}
      </h1>

      {/* The numbers that matter, on one surface. */}
      <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10">
        <Stat
          label="Rating"
          value={<Rating value={s.overall.average} />}
          note={`${s.overall.answered} ${s.overall.answered === 1 ? "person" : "people"}`}
        />
        <Stat
          label="You as host"
          value={<Rating value={host?.average ?? null} />}
          note={host ? `${host.answered} rated you` : undefined}
        />
        <Stat
          label="Answered"
          value={
            data.responseRate === null
              ? "None"
              : `${Math.round(data.responseRate * 100)}%`
          }
          note={`${data.responses} of ${data.joined}`}
        />
      </div>

      {data.responses === 0 ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#161c2b] p-6 text-center">
          <MessageSquareText
            className="mx-auto h-8 w-8 text-white/30"
            aria-hidden
          />
          <p className="mt-3 font-semibold">No feedback yet</p>
          <p className="mt-1 text-sm text-white/60">
            Everyone who joined is asked on the class-ended screen, and by email
            about 15 minutes after the class.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Panel title="How people rated it">
            <RatingRows stats={s.overall} words={OVERALL_WORDS} />
          </Panel>

          <Comments data={data} />

          {choice("improve")?.answered ? (
            <Panel
              title={RESULT_QUESTIONS.improve}
              note={
                nothingToImprove
                  ? `${nothingToImprove} said “Nothing, it was great”`
                  : "People could pick several."
              }
            >
              <ChoiceRows
                stats={choice("improve")!}
                label={(v) => answerLabel("improve", v)}
                hide="nothing"
              />
            </Panel>
          ) : null}

          {host?.answered ? (
            <Panel title="How they rated you as host">
              <RatingRows stats={host} words={HOST_WORDS} />
            </Panel>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {(["useful", "again", "quality", "issues"] as const).map((key) => {
              const stats = choice(key);
              if (!stats?.answered) return null;
              return (
                <Panel
                  key={key}
                  title={RESULT_QUESTIONS[key]}
                  note={`${stats.answered} answered`}
                >
                  <ChoiceRows
                    stats={stats}
                    label={(v) => answerLabel(key, v)}
                  />
                </Panel>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

/** Comments first-hand: named, or "Anonymous" when they chose that. */
function Comments({ data }: { data: MyFeedbackDetail }) {
  const s = data.summary;
  const withComment = data.feedback.filter((f) => f.comment);
  return (
    <Panel
      title="What people said"
      note={
        withComment.length
          ? `${withComment.length} ${withComment.length === 1 ? "comment" : "comments"}${s.anonymous ? `, ${s.anonymous} sent anonymously` : ""}`
          : undefined
      }
    >
      {withComment.length === 0 ? (
        <p className="text-sm text-white/50">
          Nobody left a comment this time.
        </p>
      ) : (
        <ul className="divide-y divide-white/5">
          {withComment.map((f) => {
            const name = f.person
              ? `${f.person.firstname} ${f.person.lastname}`.trim()
              : "Anonymous";
            return (
              <li key={f.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {f.person ? (
                    <Avatar src={f.person.avatarUrl} alt={name} size="sm" />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
                      <EyeOff className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${f.person ? "text-white" : "text-white/60"}`}
                    >
                      {name}
                    </p>
                    <p className="text-xs text-white/40">
                      {dateOf(f.updatedAt)}
                    </p>
                  </div>
                  <Rating
                    value={f.overall}
                    className="shrink-0 text-sm font-semibold"
                  />
                </div>
                <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed text-white/85">
                  {f.comment}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="min-w-0 bg-[#161c2b] px-3 py-4 sm:px-5">
      <p className="truncate text-xs text-white/50">{label}</p>
      <p className="mt-1 truncate text-xl font-bold sm:text-2xl">{value}</p>
      {note ? (
        <p className="mt-0.5 truncate text-[11px] text-white/45 sm:text-xs">
          {note}
        </p>
      ) : null}
    </div>
  );
}
