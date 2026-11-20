import type { FeedbackAnswers, FeedbackForm } from "./api";

/**
 * The questions, as data: what each person is asked depends on their role
 * (participant or host), and some only appear after a certain answer. The
 * values match the backend's list (services/classFeedbackService.js).
 */

export interface FeedbackDraft extends FeedbackAnswers {
  overall?: number;
  comment: string;
  anonymous: boolean;
}

export interface Choice {
  value: string;
  label: string;
  hint?: string;
}

interface BaseStep {
  id: string;
  title: string;
  /** Only asked when this returns true. */
  showIf?: (draft: FeedbackDraft) => boolean;
}

export type FeedbackStep =
  | (BaseStep & { kind: "rating"; field: "overall" | "host"; labels: [string, string, string, string, string] })
  | (BaseStep & { kind: "choice"; field: "useful" | "quality" | "again" | "smooth" | "engagement"; choices: Choice[] })
  | (BaseStep & {
      kind: "chips";
      field: "issues" | "improve";
      choices: Choice[];
      subtitle: string;
      /** A choice that can't be combined with the others (e.g. "Nothing, it was great"). */
      exclusive?: string;
    })
  | (BaseStep & { kind: "comment"; placeholder: string; note: string; allowAnonymous: boolean });

const firstName = (name: string) => name.split(" ")[0] || name;

const participantIssues: Choice[] = [
  { value: "audio", label: "Sound cut out" },
  { value: "video", label: "Video froze" },
  { value: "lag", label: "Delays or lag" },
  { value: "screen_share", label: "Couldn’t see the screen" },
  { value: "other", label: "Something else" },
];

const participantImprovements: Choice[] = [
  { value: "pace", label: "The pace" },
  { value: "clarity", label: "Clearer explanations" },
  { value: "interaction", label: "More Q&A" },
  { value: "examples", label: "More examples or practice" },
  { value: "materials", label: "Slides or materials" },
  { value: "audio_video", label: "Sound or video" },
  { value: "timing", label: "Timing or length" },
  { value: "nothing", label: "Nothing, it was great" },
];

const hostImprovements: Choice[] = [
  { value: "tools", label: "Better teaching tools" },
  { value: "engagement", label: "More audience engagement" },
  { value: "stability", label: "A steadier connection" },
  { value: "recording", label: "Recording options" },
  { value: "reach", label: "Reaching more learners" },
  { value: "payments", label: "Payments and payouts" },
  { value: "nothing", label: "Nothing for now" },
];

const hostIssues: Choice[] = [
  { value: "audio", label: "Audio problems" },
  { value: "video", label: "Video problems" },
  { value: "lag", label: "Delays or lag" },
  { value: "screen_share", label: "Screen sharing" },
  { value: "recording", label: "Recording" },
  { value: "other", label: "Something else" },
];

type FiveLabels = [string, string, string, string, string];

/** Words under each face for the overall rating (also used on the class-ended screen). */
export const OVERALL_LABELS: Record<FeedbackForm["role"], FiveLabels> = {
  participant: ["Not great", "Could be better", "It was okay", "Really good", "Loved it"],
  host: ["Rough", "Some issues", "It was okay", "Went well", "Great session"],
};

export function stepsFor(form: FeedbackForm): FeedbackStep[] {
  const host = firstName(form.hostName);

  if (form.role === "host") {
    return [
      {
        id: "overall",
        kind: "rating",
        field: "overall",
        title: "How did the session go for you?",
        labels: OVERALL_LABELS.host,
      },
      {
        id: "smooth",
        kind: "choice",
        field: "smooth",
        title: "Did everything run smoothly?",
        choices: [
          { value: "yes", label: "Yes, no problems" },
          { value: "mostly", label: "Mostly" },
          { value: "no", label: "Not really" },
        ],
      },
      {
        id: "issues",
        kind: "chips",
        field: "issues",
        title: "What got in the way?",
        subtitle: "Pick all that apply.",
        choices: hostIssues,
        showIf: (d) => d.smooth === "mostly" || d.smooth === "no",
      },
      {
        id: "engagement",
        kind: "choice",
        field: "engagement",
        title: "How engaged was your audience?",
        choices: [
          { value: "high", label: "Very engaged", hint: "Questions, chat, reactions" },
          { value: "ok", label: "Somewhat" },
          { value: "low", label: "Quiet" },
        ],
      },
      {
        id: "improve",
        kind: "chips",
        field: "improve",
        title: "What would make your next class better?",
        subtitle: "Pick all that apply. We read every answer.",
        choices: hostImprovements,
        exclusive: "nothing",
      },
      {
        id: "comment",
        kind: "comment",
        title: "Anything we should know?",
        placeholder: "Ideas, problems, what would make your next class better…",
        note: "Only the Hallos team sees this.",
        allowAnonymous: false,
      },
    ];
  }

  return [
    {
      id: "overall",
      kind: "rating",
      field: "overall",
      title: `How was ${form.title}?`,
      labels: OVERALL_LABELS.participant,
    },
    {
      id: "host",
      kind: "rating",
      field: "host",
      title: `How was ${host} as a host?`,
      labels: ["Hard to follow", "Could be clearer", "Okay", "Great host", "Brilliant"],
    },
    {
      id: "useful",
      kind: "choice",
      field: "useful",
      title: "Did you learn something useful?",
      choices: [
        { value: "very", label: "Yes, a lot" },
        { value: "somewhat", label: "A little" },
        { value: "not_really", label: "Not really" },
      ],
    },
    {
      id: "quality",
      kind: "choice",
      field: "quality",
      title: "How did it look and sound?",
      choices: [
        { value: "great", label: "Clear the whole time" },
        { value: "some_issues", label: "A few hiccups" },
        { value: "poor", label: "Hard to follow" },
      ],
    },
    {
      id: "issues",
      kind: "chips",
      field: "issues",
      title: "What went wrong?",
      subtitle: "Pick all that apply. It helps us fix it.",
      choices: participantIssues,
      showIf: (d) => d.quality === "some_issues" || d.quality === "poor",
    },
    {
      id: "again",
      kind: "choice",
      field: "again",
      title: `Would you join another class with ${host}?`,
      choices: [
        { value: "yes", label: "Definitely" },
        { value: "maybe", label: "Maybe" },
        { value: "no", label: "Probably not" },
      ],
    },
    {
      id: "improve",
      kind: "chips",
      field: "improve",
      title: "What could be better next time?",
      subtitle: `Pick all that apply. It helps ${host} improve.`,
      choices: participantImprovements,
      exclusive: "nothing",
    },
    {
      id: "comment",
      kind: "comment",
      title: `Anything else you’d like to tell ${host}?`,
      placeholder: "What you liked, what could be better…",
      note: `${host} will see your feedback.`,
      allowAnonymous: true,
    },
  ];
}

/** The draft to start from: empty, or their earlier answers when they come back. */
export function draftFrom(form: FeedbackForm): FeedbackDraft {
  const r = form.response;
  return r
    ? { ...r.answers, overall: r.overall, comment: r.comment ?? "", anonymous: r.anonymous }
    : { comment: "", anonymous: false };
}

/** The steps this person sees, given their answers so far. */
export const visibleSteps = (steps: FeedbackStep[], draft: FeedbackDraft) => steps.filter((s) => !s.showIf || s.showIf(draft));

/**
 * The answers to send (just the question fields). A follow-up that no longer
 * applies (e.g. "what went wrong" after changing to "clear the whole time")
 * is sent empty, so an earlier answer to it doesn't linger.
 */
export function answersOf(draft: FeedbackDraft, steps: FeedbackStep[]): FeedbackAnswers {
  const { host, useful, quality, issues, again, smooth, engagement, improve } = draft;
  const answers: FeedbackAnswers = { host, useful, quality, issues, again, smooth, engagement, improve };
  for (const step of steps) {
    if (step.kind === "chips" && step.showIf && !step.showIf(draft)) answers[step.field] = [];
  }
  (Object.keys(answers) as (keyof FeedbackAnswers)[]).forEach((k) => answers[k] === undefined && delete answers[k]);
  return answers;
}
