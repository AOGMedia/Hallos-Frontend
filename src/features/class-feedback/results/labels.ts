import { OVERALL_LABELS, stepsFor } from "../questions";

/**
 * Answer wording for the results, taken from the participant form itself so
 * the creator reads exactly what their participants chose.
 */
const steps = stepsFor({ kind: "class", role: "participant", title: "", sessionLabel: null, hostName: "", response: null });

const CHOICES: Record<string, Record<string, string>> = Object.fromEntries(
  steps
    .filter((s) => s.kind === "choice" || s.kind === "chips")
    .map((s) => [s.field, Object.fromEntries(s.choices.map((c) => [c.value, c.label]))])
);

export const answerLabel = (question: string, value: string) => CHOICES[question]?.[value] ?? value;

/** How each question reads on the results page (worded for the creator). */
export const RESULT_QUESTIONS: Record<string, string> = {
  useful: "Did they learn something useful?",
  quality: "How did it look and sound?",
  issues: "What went wrong",
  again: "Would they join you again?",
  improve: "What could be better",
};

export const OVERALL_WORDS = OVERALL_LABELS.participant;
export const HOST_WORDS = ["Hard to follow", "Could be clearer", "Okay", "Great host", "Brilliant"];
