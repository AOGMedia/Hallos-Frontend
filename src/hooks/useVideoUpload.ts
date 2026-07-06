import { useMutation } from '@tanstack/react-query';
import { initializeVideoUpload, type InitializeUploadResult } from '@/lib/api/videos';
// import { useAuthStore } from '@/store/authStore';

export interface InitializePayload {
  thumbnail?: File | null;
  title: string;
  description?: string;
  price?: number | null;
  currency?: string;
  type: 'long' | 'short';
  category?: string;
  tags?: string[];
  privacy?: string;
  restriction?: boolean;
}

export function buildInitializeFormData(payload: InitializePayload) {
  const fd = new FormData();

  if (payload.thumbnail) fd.append('thumbnail', payload.thumbnail);
  fd.append('title', payload.title);

  if (payload.description) fd.append('description', payload.description);
  if (payload.price != null) fd.append('price', String(payload.price));
  if (payload.currency) fd.append('currency', payload.currency);

  fd.append('type', payload.type);

  if (payload.category) fd.append('category', payload.category);
  if (payload.tags && payload.tags.length) {
    payload.tags.forEach((t) => fd.append('tags', t));
  }

  if (payload.privacy) fd.append('privacy', payload.privacy);
  if (typeof payload.restriction === 'boolean') {
    fd.append('restriction', String(payload.restriction));
  }

 
  return fd;
}

export function useInitializeVideoUpload() {
  return useMutation<InitializeUploadResult, unknown, FormData>({
    mutationFn: async (formData: FormData) => {
      return await initializeVideoUpload(formData);
    },
  });
}

export async function performDirectUpload(
  init: InitializeUploadResult,
  file: File,
  onProgress?: (p: number) => void,
  signal?: AbortSignal
): Promise<void> {
  const uploadUrl = init.uploadUrl ?? init.muxUploadUrl;

  if (!uploadUrl) {
    throw new Error("Upload URL missing from initialization result");
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // abort
    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        const e = new Error("Upload aborted");
        e.name = "AbortError";
        reject(e);
      });
    }

    xhr.open("PUT", uploadUrl, true);

    

    xhr.withCredentials = false;

    //  Only valid header for Mux direct uploads
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    // progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    };

    // load
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Mux upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    // error
    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    // send file
    xhr.send(file);
  });
}
