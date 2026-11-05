"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import {
  publishGetStreamRecording,
  serverMessage,
  type GetStreamRecording,
  type GetStreamTarget,
  type PublishRecordingDetails,
} from "../api";

/** Same categories as the video upload form. */
const CATEGORIES = [
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "gaming", label: "Gaming" },
  { value: "music", label: "Music" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
  { value: "vlog", label: "Vlog" },
];

const PRIVACY: { value: PublishRecordingDetails["privacy"]; label: string; hint: string }[] = [
  { value: "public", label: "Public", hint: "Anyone can find and buy it" },
  { value: "unlisted", label: "Unlisted", hint: "Only people with the link" },
  { value: "private", label: "Private", hint: "Only you" },
];

const field =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-primary focus:bg-white/10";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-white/60";

/**
 * Publish a class recording as a Hallos video people can buy. Hallos copies
 * the file from the recording service in the background — nothing is
 * downloaded or re-uploaded from the creator's device.
 */
export function PublishRecordingSheet({
  target,
  recording,
  suggestedTitle,
  onClose,
  onPublished,
}: {
  target: GetStreamTarget;
  recording: GetStreamRecording;
  suggestedTitle: string;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [title, setTitle] = useState(suggestedTitle.slice(0, 255));
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<PublishRecordingDetails["currency"]>("NGN");
  const [category, setCategory] = useState("education");
  const [privacy, setPrivacy] = useState<PublishRecordingDetails["privacy"]>("public");
  const [formError, setFormError] = useState<string | null>(null);

  const publish = useMutation({
    mutationFn: (details: PublishRecordingDetails) => publishGetStreamRecording(target, details),
    onSuccess: onPublished,
  });

  // Escape closes, unless a publish is on its way.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !publish.isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, publish.isPending]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = price.trim() === "" ? 0 : Number(price);
    if (!title.trim()) return setFormError("Give the video a title.");
    if (!Number.isFinite(amount) || amount < 0) return setFormError("Enter a valid price, or leave it empty for free.");
    setFormError(null);
    publish.mutate({
      filename: recording.filename,
      title: title.trim(),
      description: description.trim() || undefined,
      price: Math.round(amount * 100) / 100,
      currency,
      category,
      privacy,
    });
  };

  const error = formError ?? (publish.error ? serverMessage(publish.error, "Couldn't publish the recording. Please try again.") : null);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !publish.isPending && onClose()}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[#161c2b] p-5 pb-[max(env(safe-area-inset-bottom),20px)] text-left shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Publish recording for sale</h2>
            <p className="mt-1 text-sm text-white/60">
              It becomes a video in My Uploads that people can buy and watch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={publish.isPending}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={label} htmlFor="rec-title">Title</label>
            <input id="rec-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} className={field} />
          </div>

          <div>
            <label className={label} htmlFor="rec-description">Description</label>
            <textarea
              id="rec-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={3}
              placeholder="What will buyers learn from this class?"
              className={`${field} resize-none`}
            />
          </div>

          <div>
            <label className={label} htmlFor="rec-price">Price</label>
            <div className="flex gap-2">
              <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 p-1">
                {(["NGN", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`rounded-lg px-3 text-sm font-semibold transition ${
                      currency === c ? "bg-primary text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                id="rec-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => /^\d*\.?\d{0,2}$/.test(e.target.value) && setPrice(e.target.value)}
                placeholder="0 = free"
                className={field}
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="rec-category">Category</label>
            <select id="rec-category" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#1F2636] text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className={label}>Who can see it</span>
            <div className="grid grid-cols-3 gap-2">
              {PRIVACY.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPrivacy(p.value)}
                  className={`rounded-xl border px-2 py-2.5 text-center transition ${
                    privacy === p.value ? "border-primary bg-primary/15 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-white/50">{p.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <p className="mt-4 text-xs text-white/50">
          Hallos copies the recording into your videos for you. Long classes can take a few minutes — you can leave this
          page meanwhile.
        </p>

        <button
          type="submit"
          disabled={publish.isPending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {publish.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {publish.isPending ? "Publishing…" : "Publish video"}
        </button>
      </form>
    </div>
  );
}
