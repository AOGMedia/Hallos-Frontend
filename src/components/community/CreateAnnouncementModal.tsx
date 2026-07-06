'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, ImageIcon, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useCreateAnnouncement, useUpdateAnnouncement } from '@/hooks/useCommunityAPI';
import { RegistrationSuccess } from '@/components/event/RegistrationSuccess';
import Image from 'next/image';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  editAnnouncement?: {
    id: string;
    title: string;
    body: string;
    imageUrl?: string;
    isPinned: boolean;
  } | null;
}

export function CreateAnnouncementModal({ isOpen, onClose, communityId, editAnnouncement }: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const isEditing = !!editAnnouncement;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;
  const error = createMutation.error || updateMutation.error;

  useEffect(() => {
    if (isOpen) {
      if (editAnnouncement) {
        setTitle(editAnnouncement.title || '');
        setBody(editAnnouncement.body || '');
        setIsPinned(!!editAnnouncement.isPinned);
        setImagePreview(editAnnouncement.imageUrl || null);
      } else {
        setTitle('');
        setBody('');
        setIsPinned(false);
        setImageFile(null);
        setImagePreview(null);
      }
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editAnnouncement]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = () => {
    const payload = { title, body, isPinned, image: imageFile || undefined };

    if (isEditing) {
      updateMutation.mutate({ id: communityId, announcementId: editAnnouncement.id, payload }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate({ id: communityId, payload }, {
        onSuccess: () => setShowSuccess(true)
      });
    }
  };

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Announcement' : 'Post Announcement'} maxWidth="max-w-[600px]">
      <div className="flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="E.g. Welcome to the new semester!"
            className="live-event-input text-text-primary text-sm placeholder-text-muted/60 w-full outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">Message *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            placeholder="Write your announcement here..."
            className="live-event-input text-text-primary text-sm placeholder-text-muted/60 w-full outline-none resize-none focus:border-primary transition-colors"
          />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">Image (Optional)</label>
          {imagePreview ? (
            <div className="relative w-full rounded-xl overflow-hidden" style={{ maxHeight: 200 }}>
              <Image src={imagePreview} alt="Preview" width={560} height={200} className="w-full object-cover rounded-xl" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-text-gray hover:text-text-primary hover:border-primary/50 transition-colors w-fit"
            >
              <ImageIcon size={16} /> Upload image
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-xs text-text-gray">JPEG, PNG, GIF, WebP, SVG — max 5MB</p>
        </div>

        {/* Pin toggle */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setIsPinned(!isPinned)}
            className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isPinned ? 'bg-primary' : 'bg-white/10'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isPinned ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <span className="text-sm font-medium text-text-primary">Pin to top</span>
        </div>

        {isError && <p className="text-red-400 text-sm">{(error as Error)?.message}</p>}

        <div className="flex items-center justify-end gap-3 mt-4">
          <button onClick={onClose} disabled={isPending} className="px-6 py-2.5 rounded-full font-medium text-text-primary hover:bg-white/5 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="px-6 py-2.5 rounded-full bg-primary text-white font-medium disabled:opacity-50 flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isEditing ? 'Save Changes' : 'Post Announcement'}
          </button>
        </div>

      </div>
    </Modal>

    {showSuccess && (
      <RegistrationSuccess
        title="Announcement Posted!"
        subtitle="Your announcement is live."
        message="All community members will be notified of your new announcement."
        onClose={() => { setShowSuccess(false); onClose(); }}
      />
    )}
  </>
  );
}
