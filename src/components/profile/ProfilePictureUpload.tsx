'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Camera, X, Upload } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentPictureUrl?: string;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

export function ProfilePictureUpload({
  currentPictureUrl,
  onUpload,
  isUploading = false,
}: ProfilePictureUploadProps) {
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      alert('Please select a JPG, PNG, or SVG image');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setShowModal(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      setShowModal(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  }, [selectedFile, onUpload]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        <Image
          key={currentPictureUrl || 'default'} // Force re-render when URL changes
          src={currentPictureUrl || '/avatars/alex-chapman.jpg'}
          alt="Profile avatar"
          width={80}
          height={80}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
          unoptimized={currentPictureUrl?.includes('s3')} // Disable optimization for S3 images
        />
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-background-dark rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Update Profile Picture
              </h3>
              <button
                onClick={handleCancel}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {previewUrl && (
              <div className="mb-6">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-background-darker">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-text-muted mt-2 text-center">
                  Preview of your new profile picture
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-background-darker transition-colors text-text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
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
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
