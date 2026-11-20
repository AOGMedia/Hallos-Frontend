"use client";

import Link from "next/link";
import { Clock3, LinkIcon, RotateCw, WifiOff } from "lucide-react";
import type { FeedbackForm, LinkProblem } from "../api";
import { FeedbackShell, PrimaryButton } from "./FeedbackShell";

/** A check that draws itself (a still check when motion is reduced). */
function DrawnCheck() {
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20" aria-hidden>
      <circle cx="36" cy="36" r="34" className="fill-primary/15" />
      <circle cx="36" cy="36" r="26" className="fill-primary" />
      <path
        d="M24 37 L32.5 45 L48 28"
        fill="none"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-dasharray:40] [stroke-dashoffset:0] motion-safe:animate-[hallos-draw_520ms_cubic-bezier(.6,0,.2,1)_120ms_both]"
      />
      <style>{"@keyframes hallos-draw{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}"}</style>
    </svg>
  );
}

function Centered({ icon, title, body, children }: { icon: React.ReactNode; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
      {icon}
      <h1 className="mt-6 text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/65">{body}</p>
      {children && <div className="mt-8 w-full max-w-xs space-y-3">{children}</div>}
    </div>
  );
}

const HomeLink = ({ label = "Go to Hallos" }: { label?: string }) => (
  <Link
    href="/"
    className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-2xl bg-white/[0.08] px-5 text-[15px] font-semibold text-white outline-none transition hover:bg-white/[0.12] focus-visible:ring-2 focus-visible:ring-primary"
  >
    {label}
  </Link>
);

export function FeedbackLoading() {
  return (
    <FeedbackShell>
      <div className="animate-pulse space-y-4 pt-4" aria-label="Loading" role="status">
        <div className="h-4 w-40 rounded-full bg-white/10" />
        <div className="h-8 w-4/5 rounded-xl bg-white/10" />
        <div className="mt-8 grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="aspect-square rounded-full bg-white/[0.06]" />
          ))}
        </div>
      </div>
    </FeedbackShell>
  );
}

export function ThankYou({ form, anonymous }: { form: FeedbackForm; anonymous: boolean }) {
  const host = form.hostName.split(" ")[0] || form.hostName;
  const body =
    form.role === "host"
      ? "Thanks for telling us how it went. It helps us make your next class even better."
      : anonymous
        ? `Thanks for your honesty. ${host} will see your feedback without your name.`
        : `${host} will see your feedback. Thanks for helping make the next class even better.`;
  return (
    <FeedbackShell>
      <Centered icon={<DrawnCheck />} title="Thank you!" body={body}>
        <HomeLink label="Back to Hallos" />
      </Centered>
    </FeedbackShell>
  );
}

export function WelcomeBack({ form, onChange }: { form: FeedbackForm; onChange: () => void }) {
  return (
    <FeedbackShell>
      <Centered
        icon={<DrawnCheck />}
        title="You’ve already shared feedback"
        body={`Thanks for rating ${form.title}. You can change your answers if you’d like.`}
      >
        <PrimaryButton onClick={onChange}>Change my answers</PrimaryButton>
        <HomeLink label="Done" />
      </Centered>
    </FeedbackShell>
  );
}

const PROBLEM_COPY: Record<LinkProblem, { title: string; body: string }> = {
  invalid: { title: "This link doesn’t work", body: "It may have been copied incompletely. Open it again from your email." },
  expired: { title: "This link has expired", body: "Feedback links last 30 days. Thanks for wanting to share your thoughts." },
  not_found: { title: "We couldn’t find this class", body: "It may have been removed by its host." },
  not_ended: { title: "Feedback opens after the class", body: "Come back once the class has ended. We’ll email you the link." },
  unavailable: { title: "Feedback is resting for a moment", body: "We couldn’t open the form just now. Please try again shortly." },
  network: { title: "We couldn’t open the form", body: "" },
};

export function LinkProblemScreen({ problem, message, onRetry }: { problem: LinkProblem; message: string; onRetry: () => void }) {
  const copy = PROBLEM_COPY[problem];
  const retryable = problem === "network" || problem === "unavailable" || problem === "not_ended";
  const Icon = problem === "not_ended" ? Clock3 : problem === "network" ? WifiOff : LinkIcon;
  return (
    <FeedbackShell>
      <Centered
        icon={
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.06]">
            <Icon className="h-8 w-8 text-white/70" aria-hidden />
          </span>
        }
        title={copy.title}
        body={copy.body || message}
      >
        {retryable && (
          <PrimaryButton onClick={onRetry}>
            <RotateCw className="h-4 w-4" aria-hidden /> Try again
          </PrimaryButton>
        )}
        <HomeLink />
      </Centered>
    </FeedbackShell>
  );
}
