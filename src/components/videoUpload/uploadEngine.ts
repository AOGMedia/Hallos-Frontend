import { createDraft, discardDraft, DraftsUnavailableError, restartDraft } from "@/lib/api/videos";
import { ResumableUpload, UploadAbortedError, UploadLinkExpiredError } from "./resumableUpload";

/**
 * The one video upload in progress, kept outside React so it carries on while
 * the creator fills in the details or moves around the dashboard.
 *
 * The file goes straight to Mux in chunks (see resumableUpload): it always
 * continues from what the server already has, so a dropped connection,
 * "Try again", or even finishing a draft after a reload never starts over.
 * The same upload link is reused until it expires.
 *
 * Two modes:
 *  - "draft": the upload starts when the file is picked (a private draft on
 *    the server until Publish);
 *  - "classic": an older server without drafts. The upload then happens at
 *    Publish, as before, but still chunked and resumable.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024;

export type UploadPhase =
  | "idle"
  | "starting" // asking the server for an upload link
  | "uploading"
  | "waiting" // classic mode: uploads when Publish is pressed
  | "done"
  | "failed";

export interface UploadState {
  phase: UploadPhase;
  mode: "draft" | "classic" | null;
  fileName: string;
  size: number;
  percent: number;
  loaded: number;
  /** Bytes per second, smoothed. */
  speed: number;
  secondsLeft: number | null;
  /** No connection: paused, carries on when it's back. */
  offline: boolean;
  /** Connected but nothing has moved for a while. */
  stalled: boolean;
  videoId: string | null;
  /** From the file name; the details step can prefill it. */
  suggestedTitle: string | null;
  /** Details saved: the video goes live when the upload finishes. */
  published: boolean;
  /** A draft from earlier whose file has to be picked again to finish. */
  needsFile: boolean;
  /** That draft's file size: the same file continues, another one starts over. */
  expectedSize: number | null;
  /** A failed chunk: seconds until the next try (null when sending). */
  retryIn: number | null;
  /** The upload link expired: trying again needs a fresh one (from 0). */
  linkExpired: boolean;
  error: string | null;
}

const INITIAL: UploadState = {
  phase: "idle",
  mode: null,
  fileName: "",
  size: 0,
  percent: 0,
  loaded: 0,
  speed: 0,
  secondsLeft: null,
  offline: false,
  stalled: false,
  videoId: null,
  suggestedTitle: null,
  published: false,
  needsFile: false,
  expectedSize: null,
  retryIn: null,
  linkExpired: false,
  error: null,
};

const STALL_AFTER_MS = 30_000;

let state: UploadState = INITIAL;
const listeners = new Set<() => void>();
let file: File | null = null;
let upload: ResumableUpload | null = null;
let lastEndpoint: string | null = null;
let lastOptions: { type: "long" | "short"; durationSeconds?: number } = { type: "long" };
let lastProgressAt = 0;
let lastSample = { at: 0, loaded: 0 };
let stallTimer: ReturnType<typeof setInterval> | null = null;
let waiters: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];
type Sentinel = { release: () => Promise<void> };
let wakeLock: Sentinel | null = null;

function set(patch: Partial<UploadState>) {
  state = { ...state, ...patch };
  syncPageGuards();
  listeners.forEach((l) => l());
}

export const uploadEngine = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getState: () => state,
  getServerState: () => INITIAL,

  /** The picked file is still here (this page session). */
  hasFile: () => file !== null,

  /** True while bytes still have to go up (or are about to). */
  isBusy: () => state.phase === "starting" || state.phase === "uploading",

  /** File picked: make the draft and start sending it. */
  async start(picked: File, options: { type: "long" | "short"; durationSeconds?: number }) {
    const resumeId = state.needsFile ? state.videoId : null;
    // Finishing a draft with the same file continues it; another file starts over.
    const sameFile = state.expectedSize === null || state.expectedSize === picked.size;
    if (!resumeId) await this.cancel();
    stopUpload();
    file = picked;
    lastOptions = options;
    set({ ...INITIAL, phase: "starting", fileName: picked.name, size: picked.size, videoId: resumeId });
    try {
      const draft = resumeId
        ? await restartDraft(resumeId, !sameFile)
        : await createDraft({
            fileName: picked.name,
            sizeBytes: picked.size,
            type: options.type,
            durationSeconds: options.durationSeconds,
          });
      if (file !== picked) return; // another file was picked meanwhile
      set({ mode: "draft", videoId: draft.videoId, suggestedTitle: draft.title });
      run(draft.uploadUrl);
    } catch (error) {
      if (file !== picked) return;
      if (error instanceof DraftsUnavailableError) {
        set({ mode: "classic", phase: "waiting" });
        return;
      }
      set({ phase: "failed", error: messageOf(error) });
    }
  },

  /** Classic mode: send the file to the link the classic upload returned. */
  uploadTo(endpoint: string) {
    if (!file) return Promise.reject(new Error("No file to upload"));
    run(endpoint);
    return this.whenDone();
  },

  /** Resolves when the file is fully uploaded; rejects if it fails. */
  whenDone(): Promise<void> {
    if (state.phase === "done") return Promise.resolve();
    if (state.phase === "failed") return Promise.reject(new Error(state.error || "Upload failed"));
    return new Promise((resolve, reject) => waiters.push({ resolve, reject }));
  },

  /**
   * Try again after a failure. It continues on the same link from where the
   * server got to; only an expired link needs a fresh one (from 0).
   */
  async retry() {
    if (!file) return;
    if (!state.mode) {
      // It never got a link: start again from the top.
      return this.start(file, lastOptions);
    }
    if (state.mode === "draft" && state.videoId) {
      const fresh = state.linkExpired;
      set({ phase: "starting", error: null, speed: 0, secondsLeft: null, ...(fresh ? { percent: 0, loaded: 0 } : {}) });
      try {
        const draft = await restartDraft(state.videoId, fresh);
        run(draft.uploadUrl);
      } catch (error) {
        set({ phase: "failed", error: messageOf(error) });
      }
    } else if (lastEndpoint) {
      run(lastEndpoint);
    }
  },

  /** The details were saved: cancelling no longer throws the video away. */
  markPublished() {
    set({ published: true });
  },

  /** Stop and throw away an unpublished upload. */
  async cancel() {
    const { videoId, mode, published } = state;
    stopUpload();
    file = null;
    rejectWaiters(new DOMException("Upload cancelled", "AbortError"));
    set(INITIAL);
    if (mode === "draft" && videoId && !published) {
      await discardDraft(videoId).catch(() => {});
    }
  },

  /** Forget the finished upload (e.g. "Create another"). Nothing is deleted. */
  reset() {
    stopUpload();
    file = null;
    set(INITIAL);
  },

  /**
   * Continue a draft from the uploads page. Uploaded already: straight to the
   * details. Not finished: the creator picks the file again.
   */
  attachDraft(draft: { videoId: string; fileName: string; uploaded: boolean; sizeBytes?: number | null }) {
    if (state.videoId === draft.videoId && state.phase !== "idle") return; // still going in this tab
    stopUpload();
    file = null;
    set({
      ...INITIAL,
      mode: "draft",
      videoId: draft.videoId,
      fileName: draft.fileName,
      phase: draft.uploaded ? "done" : "idle",
      percent: draft.uploaded ? 100 : 0,
      needsFile: !draft.uploaded,
      expectedSize: draft.sizeBytes ?? null,
    });
  },
};

function run(endpoint: string) {
  if (!file) return;
  stopUpload();
  lastEndpoint = endpoint;
  const size = file.size;
  lastProgressAt = Date.now();
  lastSample = { at: Date.now(), loaded: state.loaded };
  set({
    phase: "uploading",
    error: null,
    linkExpired: false,
    retryIn: null,
    speed: 0,
    secondsLeft: null,
    stalled: false,
    offline: typeof navigator !== "undefined" && !navigator.onLine,
  });

  // Continues from whatever the server already has (see resumableUpload).
  const chunked = new ResumableUpload(endpoint, file, {
    onProgress: (loaded) => {
      if (upload !== chunked) return;
      const now = Date.now();
      if (loaded > state.loaded) lastProgressAt = now;
      let { speed } = state;
      const elapsed = now - lastSample.at;
      if (elapsed >= 1000) {
        const instant = ((loaded - lastSample.loaded) / elapsed) * 1000;
        speed = speed > 0 ? speed * 0.7 + Math.max(0, instant) * 0.3 : Math.max(0, instant);
        lastSample = { at: now, loaded };
      }
      set({
        loaded,
        percent: size ? Math.min(100, (loaded / size) * 100) : 0,
        speed,
        secondsLeft: speed > 0 ? (size - loaded) / speed : null,
        stalled: false,
      });
    },
    onRetry: (seconds) => {
      if (upload !== chunked) return;
      if (seconds === null) lastProgressAt = Date.now();
      set({ retryIn: seconds, stalled: false });
    },
    onOffline: (offline) => {
      if (upload !== chunked) return;
      lastProgressAt = Date.now();
      set({ offline, stalled: false });
    },
  });
  upload = chunked;

  chunked
    .start()
    .then(() => {
      if (upload !== chunked) return;
      upload = null;
      stopTimers();
      set({ phase: "done", percent: 100, loaded: size, secondsLeft: 0, stalled: false, offline: false, retryIn: null });
      waiters.forEach((w) => w.resolve());
      waiters = [];
    })
    .catch((error) => {
      if (upload !== chunked || error instanceof UploadAbortedError) return;
      upload = null;
      stopTimers();
      const expired = error instanceof UploadLinkExpiredError;
      const message = expired
        ? "This upload took too long and its link expired. Try again to start a fresh upload."
        : "The upload stopped. Try again; it picks up where it left off.";
      set({ phase: "failed", error: message, linkExpired: expired, stalled: false, retryIn: null });
      rejectWaiters(new Error(message));
    });

  stallTimer = setInterval(() => {
    if (state.phase !== "uploading" || state.offline) return;
    const stalled = Date.now() - lastProgressAt > STALL_AFTER_MS;
    if (stalled !== state.stalled) set({ stalled });
  }, 5000);
}

function stopUpload() {
  if (upload) {
    const current = upload;
    upload = null;
    try {
      current.abort();
    } catch {
      // Already finished.
    }
  }
  stopTimers();
}

function stopTimers() {
  if (stallTimer) clearInterval(stallTimer);
  stallTimer = null;
}

function rejectWaiters(error: Error) {
  waiters.forEach((w) => w.reject(error));
  waiters = [];
}

function messageOf(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "We couldn’t start your upload. Please try again.";
}

// ── Page guards while bytes are still going up ─────────────────────────────

const busy = () =>
  state.phase === "starting" || state.phase === "uploading" || (state.published && state.phase !== "done");

function onBeforeUnload(event: BeforeUnloadEvent) {
  event.preventDefault();
  // Older browsers need a value; modern ones show their own wording.
  event.returnValue = "";
}

let guarded = false;
function syncPageGuards() {
  if (typeof window === "undefined") return;
  const shouldGuard = busy();
  if (shouldGuard === guarded) return;
  guarded = shouldGuard;
  if (shouldGuard) {
    window.addEventListener("beforeunload", onBeforeUnload);
    void keepAwake();
    document.addEventListener("visibilitychange", onVisibility);
  } else {
    window.removeEventListener("beforeunload", onBeforeUnload);
    document.removeEventListener("visibilitychange", onVisibility);
    void wakeLock?.release().catch(() => {});
    wakeLock = null;
  }
}

/** Phones pause uploads when the screen sleeps: keep it on while uploading. */
async function keepAwake() {
  const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<Sentinel> } };
  if (!nav.wakeLock || document.visibilityState !== "visible") return;
  try {
    wakeLock = await nav.wakeLock.request("screen");
  } catch {
    // Not allowed (battery saver): the upload works the same.
  }
}

function onVisibility() {
  if (document.visibilityState === "visible" && guarded) void keepAwake();
}
