/**
 * Sends a file to a resumable upload link (the one Mux gives us), in chunks,
 * always continuing from what the server already has:
 *
 *  - before sending, it asks the server how many bytes it has
 *    (`Content-Range: bytes * /size`) and sends only the rest;
 *  - a failed chunk never restarts the file: it waits (2 s, 5 s, 10 s, 20 s,
 *    then every 30 s), asks again where the server is, and carries on;
 *  - it pauses while the browser is offline and wakes as soon as it's back;
 *  - a chunk that stops moving for a minute is dropped and retried;
 *  - chunk size follows the connection (1 MB on slow links, up to 64 MB).
 *
 * It only stops for good when the link is gone (expired or cancelled).
 */

const KB256 = 256 * 1024; // chunks must be multiples of this (except the last)
const MIN_CHUNK = 4 * KB256; // 1 MB
const MAX_CHUNK = 256 * KB256; // 64 MB
const BACKOFF_SECONDS = [2, 5, 10, 20, 30];
const STALL_MS = 60_000;

export class UploadLinkExpiredError extends Error {}
export class UploadAbortedError extends Error {}

export interface UploadHandlers {
  /** Bytes the server has confirmed plus the chunk in flight. */
  onProgress: (loaded: number) => void;
  /** Retrying after a failure: seconds until the next try (null when sending again). */
  onRetry: (seconds: number | null) => void;
  onOffline: (offline: boolean) => void;
}

type Res = { status: number; range: string | null };

export class ResumableUpload {
  private aborted = false;
  private xhr: XMLHttpRequest | null = null;
  private chunk = 8 * 4 * KB256; // 8 MB to start
  private wake: (() => void) | null = null;

  constructor(private url: string, private file: File, private on: UploadHandlers) {}

  abort() {
    this.aborted = true;
    this.xhr?.abort();
    this.wake?.();
  }

  /** Resolves when the server has the whole file. */
  async start(): Promise<void> {
    const size = this.file.size;
    let failures = 0;
    let offset = await this.retrying(() => this.serverOffset(), () => failures++);
    failures = 0;

    while (offset < size) {
      await this.whenOnline();
      const end = Math.min(offset + this.chunk, size);
      const startedAt = Date.now();
      try {
        const res = await this.send(this.file.slice(offset, end), `bytes ${offset}-${end - 1}/${size}`, (sent) => this.on.onProgress(offset + sent));
        if (res.status === 200 || res.status === 201) return this.on.onProgress(size);
        if (res.status === 308) {
          // The server may have kept less than we sent: continue from what it has.
          offset = rangeEnd(res.range);
          failures = 0;
          this.on.onProgress(offset);
          this.adapt(Date.now() - startedAt);
          continue;
        }
        this.fatalOrRetry(res.status);
      } catch (error) {
        if (error instanceof UploadLinkExpiredError || this.aborted) throw this.aborted ? new UploadAbortedError('Upload cancelled') : error;
      }
      // Something went wrong: wait, then ask the server where it really is.
      this.chunk = Math.max(MIN_CHUNK, Math.floor(this.chunk / 2 / KB256) * KB256);
      await this.pause(BACKOFF_SECONDS[Math.min(failures++, BACKOFF_SECONDS.length - 1)]);
      offset = await this.retrying(() => this.serverOffset(), () => failures++);
    }
    this.on.onProgress(size);
  }

  /** How many bytes the server has (the whole size when it's complete). */
  private async serverOffset(): Promise<number> {
    const res = await this.send(null, `bytes */${this.file.size}`);
    if (res.status === 200 || res.status === 201) return this.file.size;
    if (res.status === 308) return rangeEnd(res.range);
    this.fatalOrRetry(res.status);
    throw new Error('retry');
  }

  /** Runs `task` until it succeeds, backing off between tries. */
  private async retrying<T>(task: () => Promise<T>, onFail: () => number): Promise<T> {
    for (;;) {
      await this.whenOnline();
      try {
        const value = await task();
        this.on.onRetry(null);
        return value;
      } catch (error) {
        if (error instanceof UploadLinkExpiredError || this.aborted) throw this.aborted ? new UploadAbortedError('Upload cancelled') : error;
        await this.pause(BACKOFF_SECONDS[Math.min(onFail(), BACKOFF_SECONDS.length - 1)]);
      }
    }
  }

  private fatalOrRetry(status: number) {
    if (status === 404 || status === 410 || status === 403) throw new UploadLinkExpiredError('Upload link expired');
    throw new Error(`retry ${status}`); // 0 (network), 408, 429, 5xx…
  }

  /** Bigger chunks on fast links, smaller on slow ones. */
  private adapt(ms: number) {
    if (ms > 0 && ms < 8_000) this.chunk = Math.min(MAX_CHUNK, this.chunk * 2);
    else if (ms > 30_000) this.chunk = Math.max(MIN_CHUNK, Math.floor(this.chunk / 2 / KB256) * KB256);
  }

  private send(body: Blob | null, contentRange: string, onSent?: (bytes: number) => void): Promise<Res> {
    return new Promise((resolve) => {
      if (this.aborted) return resolve({ status: 0, range: null });
      const xhr = new XMLHttpRequest();
      this.xhr = xhr;
      let watchdog = setTimeout(() => xhr.abort(), STALL_MS);
      const kick = () => { clearTimeout(watchdog); watchdog = setTimeout(() => xhr.abort(), STALL_MS); };
      xhr.open('PUT', this.url);
      xhr.setRequestHeader('Content-Range', contentRange);
      xhr.upload.onprogress = (e) => { kick(); onSent?.(e.loaded); };
      const done = () => { clearTimeout(watchdog); resolve({ status: xhr.status, range: xhr.getResponseHeader('Range') }); };
      xhr.onload = done;
      xhr.onerror = done;
      xhr.onabort = done;
      xhr.ontimeout = done;
      xhr.send(body);
    });
  }

  /** Waits `seconds`, showing the countdown; wakes early when the connection is back. */
  private pause(seconds: number) {
    return new Promise<void>((resolve) => {
      let left = seconds;
      this.on.onRetry(left);
      const tick = setInterval(() => { left -= 1; this.on.onRetry(Math.max(left, 0)); }, 1000);
      const finish = () => { clearInterval(tick); clearTimeout(timer); window.removeEventListener('online', finish); this.wake = null; resolve(); };
      const timer = setTimeout(finish, seconds * 1000);
      window.addEventListener('online', finish);
      this.wake = finish;
    });
  }

  private whenOnline() {
    if (typeof navigator === 'undefined' || navigator.onLine || this.aborted) return Promise.resolve();
    this.on.onOffline(true);
    return new Promise<void>((resolve) => {
      const back = () => { window.removeEventListener('online', back); this.wake = null; this.on.onOffline(false); resolve(); };
      window.addEventListener('online', back);
      this.wake = back;
    });
  }
}

/** "bytes=0-8388607" -> 8388608 (the next byte to send); no header -> 0. */
function rangeEnd(range: string | null): number {
  const match = range && /bytes=\d+-(\d+)/.exec(range);
  return match ? Number(match[1]) + 1 : 0;
}
