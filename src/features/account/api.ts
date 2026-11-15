import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';

export interface DeletionRequest {
  id: string;
  status: 'pending';
  reason: string | null;
  requestedAt: string;
  scheduledFor: string;
}

export interface DeletionStatus {
  /** False when the server can't take requests right now. */
  available: boolean;
  /** Days between asking and deletion, during which it can be cancelled. */
  graceDays: number;
  /** Confirm with the password; false = Google sign-in, confirm by typing DELETE. */
  needsPassword: boolean;
  request: DeletionRequest | null;
}

export const accountKeys = { deletion: ['account', 'deletion'] as const };

/** The server's message for a failed request (also when the body came back as a file/blob). */
export async function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): Promise<string> {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as unknown;
  if (data instanceof Blob) {
    try {
      return (JSON.parse(await data.text()) as { message?: string }).message || fallback;
    } catch {
      return fallback;
    }
  }
  return (data as { message?: string } | undefined)?.message || fallback;
}

export const accountApi = {
  deletionStatus: async () => (await apiClient.get<{ data: DeletionStatus }>('/api/account/deletion')).data.data,

  requestDeletion: async (body: { password?: string; confirmText?: string; reason?: string }) =>
    (await apiClient.post<{ data: DeletionRequest }>('/api/account/deletion', body)).data.data,

  cancelDeletion: async () => {
    await apiClient.delete('/api/account/deletion');
  },

  /** Downloads "everything stored about me" as a JSON file. */
  downloadData: async () => {
    const res = await apiClient.get<Blob>('/api/account/export', { responseType: 'blob', timeout: 60000 });
    const name = /filename="([^"]+)"/.exec(String(res.headers['content-disposition'] || ''))?.[1] || `hallos-data-${new Date().toISOString().slice(0, 10)}.json`;
    const url = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  },
};
