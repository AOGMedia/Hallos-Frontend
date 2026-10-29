'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Upload, AlertCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface ProfilePictureUploadProps {
  currentPictureUrl?: string | null;
  /** Used for the initial shown when there's no picture. */
  name?: string;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

/** The server's message for a failed upload, in plain words. */
function uploadErrorMessage(error: unknown): string {
  const e = error as { code?: string; response?: { status?: number; data?: { message?: string } } } | null;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return "You're offline. Check your connection and try again.";
  if (e?.response?.status === 413) return 'That picture is too large. Please choose one under 5 MB.';
  if (e?.code === 'ECONNABORTED') return 'The upload took too long. Please try again on a stronger connection.';
  const status = e?.response?.status;
  if (status && status < 500 && e?.response?.data?.message) return e.response.data.message;
  return "We couldn't update your picture. Please try again.";
}

export function ProfilePictureUpload({
  currentPictureUrl,
  name = '',
  onUpload,
  isUploading = false,
}: ProfilePictureUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP picture.');
      setShowModal(true);
      resetInput();
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That picture is too large. Please choose one under 5 MB.');
      setShowModal(true);
      resetInput();
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setShowModal(true);
    };
    reader.onerror = () => {
      setError("We couldn't read that picture. Please try another one.");
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setError(null);
    try {
      await onUpload(selectedFile);
      setShowModal(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      resetInput();
    } catch (err) {
      setError(uploadErrorMessage(err));
    }
  }, [selectedFile, onUpload]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    resetInput();
  }, []);

  return (
    <>
      <button
        type="button"
        className="relative group shrink-0 rounded-full"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Change profile picture"
      >
        <Avatar
          key={currentPictureUrl || 'none'}
          src={currentPictureUrl}
          alt={name}
          size="lg"
          className="sm:!w-20 sm:!h-20 sm:!text-2xl"
        />
        <span className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </span>
        {/* Always-visible hint on touch screens (no hover there) */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white ring-2 ring-background-darker sm:hidden">
          <Camera className="w-3.5 h-3.5" />
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-background-dark rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Update Profile Picture</h3>
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close"
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {previewUrl && (
              <div className="mb-6">
                <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-full bg-background-darker">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local preview (data URL) */}
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <p className="text-xs text-text-muted mt-3 text-center">This is how your picture will look</p>
              </div>
            )}

            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-background-darker transition-colors text-text-primary disabled:opacity-50"
              >
                {selectedFile ? 'Cancel' : 'Close'}
              </button>
              {selectedFile ? (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      {error ? 'Try again' : 'Upload'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                >
                  Choose another
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
