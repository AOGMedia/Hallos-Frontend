/**
 * Turns any failed request into a short, friendly sentence for the room UI.
 * The server's own message is used when it sent one we can show (4xx); network
 * problems, timeouts and server faults get plain-language wording instead of
 * technical text.
 */
export function friendlyError(error: unknown, fallback: string): string {
  const e = error as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  } | null;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You're offline. Check your connection and try again.";
  }
  if (e?.code === "ECONNABORTED" || /timeout/i.test(e?.message ?? "")) {
    return "That took too long — your connection may be slow. Please try again.";
  }
  if (e && !e.response && (e.code === "ERR_NETWORK" || /network/i.test(e.message ?? ""))) {
    return "We couldn't reach Hallos. Check your connection and try again.";
  }

  const status = e?.response?.status;
  const serverMessage = e?.response?.data?.message;
  if (status === 429) return serverMessage || "You're going a little fast. Please wait a moment.";
  if (status && status >= 500) return fallback;
  if (serverMessage) return serverMessage;
  if (error instanceof Error && error.message && !/status code|request failed/i.test(error.message)) {
    return error.message;
  }
  return fallback;
}
