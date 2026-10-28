const PREFIX = 'hallos-submission:'
const memory = new Map<string, { key: string; fingerprint: string }>()

export function newIdempotencyKey(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {}
  const bytes = new Uint8Array(16)
  try {
    crypto.getRandomValues(bytes)
  } catch {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function hash(input: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

export function fileSignature(file?: File | null): string {
  return file ? `${file.name}:${file.size}:${file.lastModified}` : ''
}

function read(slot: string) {
  try {
    const raw = localStorage.getItem(PREFIX + slot)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed?.key === 'string' && typeof parsed?.fingerprint === 'string') return parsed as { key: string; fingerprint: string }
    }
  } catch {}
  return memory.get(slot) ?? null
}

// Same form contents reuse the same key (a retry, even after a reload, can't
// duplicate); edited contents count as a new submission and get a new key.
export function submissionKeyFor(slot: string, payload: unknown): string {
  const fingerprint = hash(JSON.stringify(payload))
  const stored = read(slot)
  if (stored && stored.fingerprint === fingerprint) return stored.key
  const next = { key: newIdempotencyKey(), fingerprint }
  memory.set(slot, next)
  try {
    localStorage.setItem(PREFIX + slot, JSON.stringify(next))
  } catch {}
  return next.key
}

export function clearSubmissionKey(slot: string): void {
  memory.delete(slot)
  try {
    localStorage.removeItem(PREFIX + slot)
  } catch {}
}
