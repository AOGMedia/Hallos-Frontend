import apiClient from '@/lib/api/client';

export type BlogPostStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string | null;
  status: BlogPostStatus;
  authorId: number;
  authorName?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListPostsResponse {
  success: boolean;
  posts: BlogPost[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface GetPostResponse {
  success: boolean;
  post: BlogPost;
}

export interface SavePostFields {
  title: string;
  excerpt: string;
  body: string;
  status: BlogPostStatus;
  /** Only sent when the admin picked a new file — omit to keep the existing cover */
  coverImage?: File;
}

function toFormData(fields: SavePostFields): FormData {
  const fd = new FormData();
  fd.append('title', fields.title);
  fd.append('excerpt', fields.excerpt);
  fd.append('body', fields.body);
  fd.append('status', fields.status);
  if (fields.coverImage) fd.append('coverImage', fields.coverImage);
  return fd;
}

export const blogService = {
  // --- Public ---

  listPublished: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient.get<ListPostsResponse>('/api/blog/posts', {
      params: { page: 1, limit: 12, ...params },
    });
    return res.data;
  },

  getPublishedBySlug: async (slug: string) => {
    const res = await apiClient.get<GetPostResponse>(`/api/blog/posts/${slug}`);
    return res.data;
  },

  // --- Admin ---

  listAll: async (params: { page?: number; limit?: number; status?: BlogPostStatus } = {}) => {
    const res = await apiClient.get<ListPostsResponse>('/api/blog/admin/posts', {
      params: { page: 1, limit: 20, ...params },
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<GetPostResponse>(`/api/blog/admin/posts/${id}`);
    return res.data;
  },

  create: async (fields: SavePostFields) => {
    const res = await apiClient.post<GetPostResponse>('/api/blog/admin/posts', toFormData(fields), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  update: async (id: string, fields: SavePostFields) => {
    const res = await apiClient.put<GetPostResponse>(`/api/blog/admin/posts/${id}`, toFormData(fields), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  remove: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean }>(`/api/blog/admin/posts/${id}`);
    return res.data;
  },
};
