// Keeps a selected file (e.g. a thumbnail) across reloads. Files can't go in
// localStorage, so this uses IndexedDB. Every call is best effort: any failure
// (private mode, quota, unsupported browser) just means no draft.

const DB_NAME = 'hallos-drafts'
const STORE = 'files'
const MAX_BYTES = 20 * 1024 * 1024

interface StoredFile {
  blob: Blob
  name: string
  type: string
  lastModified: number
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function run<T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest): Promise<T | null> {
  const db = await openDb()
  if (!db) return null
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, mode)
      const req = op(tx.objectStore(STORE))
      req.onsuccess = () => resolve((req.result as T) ?? null)
      req.onerror = () => resolve(null)
      tx.oncomplete = () => db.close()
      tx.onabort = () => {
        db.close()
        resolve(null)
      }
    } catch {
      db.close()
      resolve(null)
    }
  })
}

export async function saveDraftFile(slot: string, file: File): Promise<void> {
  if (file.size > MAX_BYTES) return
  const value: StoredFile = { blob: file, name: file.name, type: file.type, lastModified: file.lastModified }
  await run('readwrite', (s) => s.put(value, slot))
}

export async function loadDraftFile(slot: string): Promise<File | null> {
  const value = await run<StoredFile>('readonly', (s) => s.get(slot))
  if (!value?.blob) return null
  try {
    return new File([value.blob], value.name, { type: value.type, lastModified: value.lastModified })
  } catch {
    return null
  }
}

export async function clearDraftFile(slot: string): Promise<void> {
  await run('readwrite', (s) => s.delete(slot))
}

export function fileToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    } catch {
      resolve(null)
    }
  })
}
