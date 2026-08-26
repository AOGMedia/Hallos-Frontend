'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Newspaper, Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { blogService, BlogPost } from '@/services/blogService';

const BlogPostFormModal = dynamic(() => import('@/components/admin/blog/BlogPostFormModal'), { ssr: false });

type StatusFilter = 'all' | 'draft' | 'published';

const STATUS_BADGE: Record<BlogPost['status'], string> = {
  published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [, startTransition] = useTransition();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogService.listAll(statusFilter === 'all' ? {} : { status: statusFilter });
      setPosts(res.posts ?? []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => { setEditingPost(null); setIsModalOpen(true); };

  const openEdit = async (id: string) => {
    try {
      const res = await blogService.getById(id);
      setEditingPost(res.post);
      setIsModalOpen(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      alert(e.response?.data?.message || e.message);
    }
  };

  const handleDelete = (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await blogService.remove(post.id);
        fetchPosts();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        alert(e.response?.data?.message || e.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Newspaper className="text-indigo-400" size={24} />
          <div>
            <h2 className="text-zinc-100 font-bold">Blog</h2>
            <p className="text-sm text-zinc-400">Write and publish posts for the Company blog.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="flex gap-2">
        {(['all', 'published', 'draft'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              statusFilter === f
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
          {error} <button onClick={fetchPosts} className="ml-2 underline hover:text-rose-300">Retry</button>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Post</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-500">
                    <Newspaper className="mx-auto mb-3 opacity-30" size={32} />
                    <p>No posts yet.</p>
                    <button onClick={openCreate} className="mt-4 text-indigo-400 hover:text-indigo-300 underline font-medium">
                      Write the first one
                    </button>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote S3 thumbnail
                          <img src={post.coverImageUrl} alt="" className="w-12 h-9 object-cover rounded-md border border-zinc-800 shrink-0" />
                        ) : (
                          <div className="w-12 h-9 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                            <Newspaper size={14} className="text-zinc-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-200 truncate">{post.title}</p>
                          <p className="text-xs text-zinc-600 truncate">/blog/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_BADGE[post.status]}`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{post.authorName || `User #${post.authorId}`}</td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={12} /> {new Date(post.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View live"
                            className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(post.id)}
                          title="Edit"
                          className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          title="Delete"
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BlogPostFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); fetchPosts(); }}
        post={editingPost}
      />
    </div>
  );
}
