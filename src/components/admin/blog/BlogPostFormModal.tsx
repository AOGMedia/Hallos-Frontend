'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Newspaper, AlertCircle, ImagePlus, Trash2 } from 'lucide-react';
import { blogService, BlogPost, BlogPostStatus } from '@/services/blogService';

interface BlogPostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Full post record, fetched by the parent before opening — undefined means "new post" */
  post: BlogPost | null;
}

const MAX_COVER_BYTES = 5 * 1024 * 1024;

export default function BlogPostFormModal({ isOpen, onClose, post }: BlogPostFormModalProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<BlogPostStatus>('draft');

  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (post) {
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setBody(post.body);
      setStatus(post.status);
      setCoverPreview(post.coverImageUrl);
    } else {
      setTitle('');
      setExcerpt('');
      setBody('');
      setStatus('draft');
      setCoverPreview(null);
    }
    setCoverFile(undefined);
    setError(null);
  }, [isOpen, post]);

  const handleCoverPick = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_COVER_BYTES) {
      setError('Cover image must be under 5MB');
      return;
    }
    setError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Give the post a title';
    if (!excerpt.trim()) return 'Write a short excerpt for the listing card';
    if (excerpt.trim().length > 500) return 'Excerpt is too long (max 500 characters)';
    if (!body.trim()) return 'The post needs a body';
    return null;
  };

  const submit = (nextStatus: BlogPostStatus) => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    startTransition(async () => {
      setError(null);
      try {
        const fields = { title: title.trim(), excerpt: excerpt.trim(), body, status: nextStatus, coverImage: coverFile };
        if (post) {
          await blogService.update(post.id, fields);
        } else {
          await blogService.create(fields);
        }
        onClose();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e.response?.data?.message || e.message || 'Failed to save post');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#121212] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Newspaper size={20} className="text-indigo-400" /> {post ? 'Edit Post' : 'New Post'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 overflow-y-auto scrollbar-hide space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* Cover image */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Cover Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleCoverPick(e.target.files?.[0] ?? null)}
              />
              {coverPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-zinc-700 group">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob/remote preview, not worth next/image config here */}
                  <img src={coverPreview} alt="" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCoverFile(undefined); setCoverPreview(null); }}
                      className="p-1.5 bg-zinc-900 hover:bg-red-900/60 text-zinc-300 hover:text-red-300 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-colors"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">JPEG, PNG, or WebP — up to 5MB</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 Ways to Study Smarter, Not Harder"
                className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Excerpt</label>
                <span className={`text-[11px] ${excerpt.length > 500 ? 'text-red-400' : 'text-zinc-600'}`}>
                  {excerpt.length}/500
                </span>
              </div>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A one or two sentence teaser shown on the blog listing card"
                rows={2}
                className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Body <span className="normal-case text-zinc-600">(Markdown supported)</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={'## Heading\n\nWrite the post here. Markdown is rendered on the public page.'}
                rows={12}
                className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono resize-y"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-800 mt-2 pt-4">
              {status === 'published' || post?.status === 'published' ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => submit('draft')}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => submit('draft')}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
              )}
              <button
                type="button"
                disabled={isPending}
                onClick={() => submit('published')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
              >
                {isPending ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
