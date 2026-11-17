"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, ImageIcon, Info, PenLine, Radio, Ticket, Video, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AlertModal } from "@/components/ui/AlertModal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  CategoryField,
  DescriptionField,
  MaxParticipantsField,
  PriceField,
  PrivacyField,
  ScheduleFields,
  StreamingProviderField,
  ThumbnailSection,
  TitleField,
} from "@/components/videoUpload/steps/GoLiveParts";
import { CurrencyCode } from "@/types/videoUpload";
import { updateLiveClass, type LiveClass } from "@/services/liveClassService";
import {
  canReschedule,
  canSwitchProvider,
  classEditValuesFrom,
  diffClassEdit,
  validateClassEdit,
  type ClassEditValues,
} from "./classEditForm";

interface EditLiveClassFormProps {
  liveClass: LiveClass;
  /** Where to go after saving or cancelling. */
  backHref: string;
}

/** One titled group of fields, like a native app's settings section. */
function FormSection({
  id,
  icon: Icon,
  title,
  hint,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="rounded-3xl border border-border/20 bg-background-card p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="text-base font-semibold text-text-primary">
            {title}
          </h2>
          {hint && <p className="text-sm text-text-muted">{hint}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/** Back button and page title. Back goes through the unsaved-changes check. */
export function EditClassHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="mb-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm text-text-primary transition hover:bg-white/15"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
      </button>
      <h1 className="mb-1 text-2xl font-bold text-text-primary lg:text-3xl">Edit class</h1>
      <p className="text-sm text-text-muted">Update the details and, until it starts, the date and time.</p>
    </header>
  );
}

function Notice({ icon: Icon, children, tone = "muted" }: { icon: LucideIcon; children: ReactNode; tone?: "muted" | "primary" }) {
  return (
    <p
      role="status"
      className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
        tone === "primary"
          ? "border-primary/30 bg-primary/10 text-text-primary"
          : "border-border/20 bg-background-dark text-text-muted"
      }`}
    >
      <Icon size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Edit a live class: details any time; date, time and streaming method until
 * it starts. Moving the time is confirmed first, since everyone registered
 * gets an email about it. Save stays pinned to the bottom on phones and is
 * only on once something has changed; leaving with unsaved edits asks first.
 */
export function EditLiveClassForm({ liveClass, backHref }: EditLiveClassFormProps) {
  const router = useRouter();
  const original = useMemo(() => classEditValuesFrom(liveClass), [liveClass]);
  const [form, setForm] = useState<ClassEditValues>(original);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(liveClass.thumbnailUrl || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmMove, setConfirmMove] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [alert, setAlert] = useState<{ message: string; done: boolean } | null>(null);

  const set = <K extends keyof ClassEditValues>(key: K) => (value: ClassEditValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const diff = useMemo(() => diffClassEdit(liveClass, original, form), [liveClass, original, form]);
  const dirty = (diff.changed || !!thumbnail) && !saved;
  const schedulable = canReschedule(liveClass);
  const isLive = liveClass.status === "live";
  const currency = liveClass.currency === "USD" ? CurrencyCode.USD : CurrencyCode.NGN;

  // Closing the tab or reloading with unsaved edits asks first (browser prompt).
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const leave = () => (dirty ? setConfirmLeave(true) : router.push(backHref));

  const handleSave = () => {
    const problem = validateClassEdit(form, diff.rescheduled);
    if (problem) {
      setAlert({ message: problem, done: false });
      return;
    }
    if (diff.rescheduled) {
      setConfirmMove(true);
      return;
    }
    void save();
  };

  const save = async () => {
    setConfirmMove(false);
    setSaving(true);
    try {
      const res = await updateLiveClass(liveClass.id, diff.body, thumbnail ?? undefined);
      if (res.success) {
        setSaved(true);
        setAlert({ message: res.rescheduled ? res.message : "Your changes are saved.", done: true });
      } else {
        setAlert({ message: res.message || "Couldn't save your changes. Please try again.", done: false });
      }
    } catch (err) {
      setAlert({ message: err instanceof Error ? err.message : "Couldn't save your changes. Please try again.", done: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <EditClassHeader onBack={leave} />

      {/* Bottom room for the pinned action bar on phones */}
      <div className="flex flex-col gap-4 pb-28 sm:pb-0">
        {isLive && (
          <Notice icon={Radio} tone="primary">
            This class is live now. You can update its details; the time and streaming method stay as they are.
          </Notice>
        )}
        {!schedulable && !isLive && (
          <Notice icon={Info}>
            This class has ended, so its time and streaming method can&apos;t change. You can still update its details.
          </Notice>
        )}

        <FormSection id="edit-details" icon={PenLine} title="Details" hint="What people see on the class page.">
          <TitleField value={form.title} onChange={set("title")} />
          <DescriptionField value={form.description} onChange={set("description")} />
          <CategoryField value={form.category} onChange={set("category")} />
        </FormSection>

        {schedulable && (
          <FormSection id="edit-time" icon={CalendarClock} title="Date and time" hint="When your class starts and ends.">
            <ScheduleFields
              label=""
              date={form.date}
              onDateChange={set("date")}
              startTime={form.startTime}
              onStartTimeChange={set("startTime")}
              endTime={form.endTime}
              onEndTimeChange={set("endTime")}
            />
            {diff.rescheduled && (
              <Notice icon={Info}>
                Everyone registered will get an email with the new time. Their spot and link stay the same.
              </Notice>
            )}
          </FormSection>
        )}

        <FormSection id="edit-access" icon={Ticket} title="Price and access" hint="The currency is set when the class is created.">
          <PriceField
            currency={currency}
            onCurrencyChange={() => {}}
            currencyLocked
            price={form.price}
            onPriceChange={set("price")}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <PrivacyField value={form.privacy} onChange={set("privacy")} />
            <MaxParticipantsField
              value={form.maxParticipants}
              onChange={set("maxParticipants")}
              streamingProvider={form.streamingProvider}
            />
          </div>
        </FormSection>

        {canSwitchProvider(liveClass) && (
          <FormSection id="edit-streaming" icon={Video} title="Streaming" hint="Can change until the class starts.">
            <StreamingProviderField value={form.streamingProvider} onChange={set("streamingProvider")} />
          </FormSection>
        )}

        <FormSection id="edit-cover" icon={ImageIcon} title="Cover image">
          <ThumbnailSection
            file={thumbnail}
            preview={thumbnailPreview}
            onFileSelect={(file, preview) => {
              setThumbnail(file);
              setThumbnailPreview(preview);
            }}
          />
        </FormSection>
      </div>

      {/* Actions: pinned to the bottom on phones (thumb reach), inline on larger screens */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/20 bg-background-darker/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl items-center gap-3 sm:justify-end">
          <Button variant="secondary" onClick={leave} disabled={saving} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex-[2] sm:flex-none"
          >
            {saving ? "Saving…" : dirty ? "Save changes" : "No changes yet"}
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmMove}
        title="Move this class?"
        message="Everyone registered will get an email with the new date and time."
        confirmText="Yes, move it"
        cancelText="Go back"
        onConfirm={() => void save()}
        onCancel={() => setConfirmMove(false)}
      />
      <ConfirmationModal
        isOpen={confirmLeave}
        title="Discard your changes?"
        message="You have edits that aren't saved yet."
        confirmText="Discard"
        cancelText="Stay"
        isDestructive
        onConfirm={() => {
          setConfirmLeave(false);
          setSaved(true); // no prompt on the way out
          router.push(backHref);
        }}
        onCancel={() => setConfirmLeave(false)}
      />
      <AlertModal
        isOpen={!!alert}
        message={alert?.message ?? ""}
        onClose={() => {
          const done = alert?.done;
          setAlert(null);
          if (done) router.push(backHref);
        }}
      />
    </>
  );
}
