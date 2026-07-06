import { apiClient } from "./client";


  //  TYPES

export interface GetVideosParams {
  userId?: string;
  category?: string;
  type?: "short" | "long";
}

export interface VideoListItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  viewsCount?: number;
  price?: number;
  currency?: string;
  status?: string;
  playbackUrl?: string;
  type?: "short" | "long";
  durationSeconds?: number;
  createdAt?: string;
  userId?: string | number;
  playbackId?: string;
  muxPlaybackId?:string;
}

export interface VideoDetailResponse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
  author: string;
  authorAvatar: string;
  authorBio?: string;
  duration: number;
  postedDate: string;
  rating: number;
  ratingCount: number;
  category?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  isLive?: boolean;
  classStartDate?: string;
  viewsCount?: number;
  userId?: string | number; // Creator/owner ID for access control
}

export interface InitializeUploadResponse {
  message?: string;
  video?: {
    id?: string;
    title?: string;
    muxUploadUrl?: string;
    uploadUrl?: string;
    assetId?: string;
  };
  muxUploadUrl?: string;
  uploadUrl?: string;
  method?: "PUT" | "POST";
  uploadMethod?: "PUT" | "POST";
  fields?: Record<string, string>;
  postFields?: Record<string, string>;
}

export interface InitializeUploadResult {
  muxUploadUrl?: string;
  uploadUrl: string;
  uploadMethod: "PUT" | "POST";
  postFields?: Record<string, string>;
  videoId?: string;
  assetId?: string;
}

  //  HELPERS
 
function getAuthHeaders() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

  //  INITIALIZE VIDEO UPLOAD
 
export async function initializeVideoUpload(
  formData: FormData
): Promise<InitializeUploadResult> {
  try {
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const response = await apiClient.post<InitializeUploadResponse>(
      "/videos/upload",
      formData,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Upload initialization response:', response.data);

    const data = response.data;

    const muxUploadUrl =
      data.muxUploadUrl ??
      data.video?.muxUploadUrl ??
      undefined;

    const uploadUrl =
      data.uploadUrl ??
      data.video?.uploadUrl ??
      muxUploadUrl;

    if (!uploadUrl) {
      throw new Error("Upload URL missing from server response");
    }

    const uploadMethod =
      data.uploadMethod ??
      data.method ??
      (data.postFields || data.fields ? "POST" : "PUT");

    const postFields =
      data.postFields ??
      data.fields ??
      undefined;

    return {
      muxUploadUrl,
      uploadUrl,
      uploadMethod,
      postFields,
      videoId: data.video?.id,
      assetId: data.video?.assetId ?? data.video?.id,
    };
  } catch (err) {
    console.error(" initializeVideoUpload failed:", err);
    throw err;
  }
}

  //  GET ALL VIDEOS (with optional filters)

export async function getVideos(params: GetVideosParams = {}) {
  const response = await apiClient.get("/videos", {
    params,
    headers: getAuthHeaders(),
  });
  const data = response.data as unknown;
  const arr: unknown[] = Array.isArray(data)
    ? data
    : ((data as { videos?: unknown[] }).videos ?? []);
  return arr.map((item) => normalizeVideoItem(item as Record<string, unknown>));
}

  //  GET VIDEOS OF THE LOGGED-IN USER

export async function getMyVideos(params: Omit<GetVideosParams, "userId"> = {}) {
  const response = await apiClient.get(`/videos/my-videos`, {
    params,
    headers: getAuthHeaders(),
  });
  const data = response.data as unknown;
  const arr: unknown[] = Array.isArray(data)
    ? data
    : ((data as { videos?: unknown[] }).videos ?? []);
  let list = arr.map((item) => normalizeVideoItem(item as Record<string, unknown>));
  if (params.type) {
    list = list.filter((v) => v.type === params.type);
  }
  return list;
}

  //  GET SINGLE VIDEO

export async function getVideoById(
  id: string
): Promise<VideoDetailResponse> {
  try {
    const response = await apiClient.get(
      `/videos/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );

    const data = response.data as unknown;
    const raw = data as Record<string, unknown>;
    
    console.log('🔍 Raw video detail from backend:', raw);
    
    const muxPlaybackId = (raw?.muxPlaybackId ?? raw?.playbackId ?? raw?.mux_playback_id) as string | undefined;
    const playbackUrl = (raw?.playbackUrl as string | undefined) ?? (muxPlaybackId ? `https://stream.mux.com/${muxPlaybackId}.m3u8` : undefined);
    
    // Check multiple possible field names for thumbnail
    const thumb = (raw?.thumbnailUrl as string | undefined)
      || (raw?.thumbnail as string | undefined)
      || (raw?.thumb_url as string | undefined)
      || (raw?.poster as string | undefined)
      || '/images/video-thumbnail-1.svg';
    
    console.log('📸 Thumbnail fields check (detail):', {
      thumbnailUrl: raw?.thumbnailUrl,
      thumbnail: raw?.thumbnail,
      thumb_url: raw?.thumb_url,
      poster: raw?.poster,
      finalThumb: thumb
    });

    const mapped: VideoDetailResponse = {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? 'Untitled'),
      description: String((raw.description as string | undefined) ?? ''),
      thumbnailUrl: thumb ?? '',
      videoUrl: playbackUrl,
      author: String((raw.author as string | undefined) ?? 'Creator'),
      authorAvatar: String((raw.authorAvatar as string | undefined) ?? '/images/instructor-avatar.jpg'),
      authorBio: (raw.authorBio as string | undefined) ?? undefined,
      duration: Number((raw.durationSeconds as number | undefined) ?? (raw.duration as number | undefined) ?? 0),
      postedDate: String((raw.createdAt as string | undefined) ?? (raw.updatedAt as string | undefined) ?? new Date().toISOString()),
      rating: 0,
      ratingCount: 0,
      category: (raw.category as string | undefined) ?? undefined,
      tags: (raw.tags as string[] | undefined) ?? [],
      price: typeof raw.price === 'string' ? parseFloat(raw.price as string) : (raw.price as number | undefined) ?? undefined,
      currency: (raw.currency as string | undefined) ?? 'NGN',
      isLive: false,
      classStartDate: undefined,
      viewsCount: typeof raw.viewsCount === 'string' ? parseInt(raw.viewsCount as string, 10) : ((raw.viewsCount as number | undefined) ?? 0),
      userId: (raw.userId as string | number | undefined) ?? (raw.user_id as string | number | undefined) ?? (raw.creatorId as string | number | undefined) ?? (raw.creator_id as string | number | undefined) ?? undefined,
    };

    return mapped;
  } catch (error) {
    console.error("❌ getVideoById failed:", error);
    throw error;
  }
}

  // DELETE VIDEO
  
export async function deleteVideo(id: string): Promise<{ success: boolean; message: string; hasPurchases?: boolean }> {
  try {
    const response = await apiClient.delete(`/videos/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const axiosErr = error as { response?: { data?: unknown } };
      if (axiosErr.response?.data) {
        throw axiosErr.response.data;
      }
    }
    throw error;
  }
}
function normalizeVideoItem(raw: Record<string, unknown>): VideoListItem {
  
  const statusRaw = raw?.status ?? raw?.uploadStatus ?? raw?.state;
  const status = (() => {
    const s = typeof statusRaw === 'string' ? statusRaw.toLowerCase() : '';
    if (['uploading', 'processing', 'pending'].includes(s)) return 'uploading';
    if (['ready', 'published', 'completed', 'done'].includes(s)) return 'ready';
    return 'ready';
  })();

  const typeRaw = raw?.type ?? raw?.videoType;
  const type = typeRaw === 'short' ? 'short' : typeRaw === 'long' ? 'long' : undefined;

  const muxPlaybackId = raw?.muxPlaybackId ?? raw?.playbackId ?? raw?.mux_playback_id;
  
  // Check multiple possible field names for thumbnail (same as backend might use different naming)
  const thumb = (raw?.thumbnailUrl as string | undefined) 
    || (raw?.thumbnail as string | undefined)
    || (raw?.thumb_url as string | undefined)
    || (raw?.poster as string | undefined)
    || '/images/video-thumbnail-1.svg';
  
  // console.log('Thumbnail fields check:', {
  //   thumbnailUrl: raw?.thumbnailUrl,
  //   thumbnail: raw?.thumbnail,
  //   thumb_url: raw?.thumb_url,
  //   poster: raw?.poster,
  //   finalThumb: thumb
  // });

  return {
    id: String((raw?.id as string | number | undefined) ?? (raw?._id as string | number | undefined) ?? (raw?.videoId as string | number | undefined) ?? (raw?.assetId as string | number | undefined) ?? ''),
    title: String((raw?.title as string | undefined) ?? (raw?.name as string | undefined) ?? 'Untitled'),
    description: String((raw?.description as string | undefined) ?? (raw?.desc as string | undefined) ?? ''),
    thumbnailUrl: thumb,
    viewsCount: typeof raw?.viewsCount === 'string' ? parseInt(raw.viewsCount as string, 10) : ((raw?.viewsCount as number | undefined) ?? (raw?.views as number | undefined) ?? (raw?.view_count as number | undefined) ?? 0),
    price: typeof raw?.price === 'string' ? parseFloat(raw.price as string) : (raw?.price as number | undefined) ?? undefined,
    currency: (raw?.currency as string | undefined) ?? 'NGN',
    status,
    playbackUrl: (raw?.playbackUrl as string | undefined) ?? (muxPlaybackId ? `https://stream.mux.com/${String(muxPlaybackId)}.m3u8` : undefined),
    type,
    durationSeconds: (raw?.durationSeconds as number | undefined) ?? (raw?.duration as number | undefined) ?? undefined,
    createdAt: (raw?.createdAt as string | undefined) ?? (raw?.created_at as string | undefined) ?? undefined,
    userId: (raw?.userId as string | number | undefined) ?? (raw?.user_id as string | number | undefined) ?? undefined,
  };
}
