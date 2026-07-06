'use client';

import { X, Video, Radio, RefreshCw, BookOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoModalStore } from '@/store/videoModalStore';
import { useVideoUploadStore } from '@/store/videoUploadStore';
import { useFreebiesStore } from '@/store/freebiesStore';
import { UploadMode } from '@/types/videoUpload';

interface PostContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  isAdmin: boolean;
}

const CONTENT_TYPES = [
  {
    key: 'video',
    icon: Video,
    label: 'Video',
    desc: 'Upload a video to the community',
  },
  {
    key: 'live_class',
    icon: Radio,
    label: 'Live Class',
    desc: 'Create and schedule a live class',
  },
  {
    key: 'live_series',
    icon: RefreshCw,
    label: 'Live Series',
    desc: 'Create a recurring live series',
  },
  {
    key: 'freebie',
    icon: BookOpen,
    label: 'Resource / Freebie',
    desc: 'Share files, links, or documents',
  },
] as const;

type ContentKey = typeof CONTENT_TYPES[number]['key'];

export function PostContentModal({ isOpen, onClose, communityId, isAdmin }: PostContentModalProps) {
  const { openUploadModal, setCommunityContext, setGoLiveInitialMode } = useVideoModalStore();
  const { setUploadMode } = useVideoUploadStore();
  const { openUpload } = useFreebiesStore();

  function handleSelect(key: ContentKey) {
    onClose();

    switch (key) {
      case 'video':
        setUploadMode(UploadMode.UPLOAD);
        openUploadModal(communityId, isAdmin);
        break;

      case 'live_class':
        setCommunityContext(communityId, isAdmin);
        setUploadMode(UploadMode.GO_LIVE);
        setGoLiveInitialMode('single');
        openUploadModal(communityId, isAdmin);
        break;

      case 'live_series':
        setCommunityContext(communityId, isAdmin);
        setUploadMode(UploadMode.GO_LIVE);
        setGoLiveInitialMode('series');
        openUploadModal(communityId, isAdmin);
        break;

      case 'freebie':
        setCommunityContext(communityId, isAdmin);
        openUpload();
        break;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.80)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[520px] rounded-3xl p-6 flex flex-col gap-5"
            style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Post Content</h2>
                <p className="text-xs text-text-gray mt-0.5">
                  {isAdmin ? 'Content will be posted directly to the community.' : 'Content will be submitted for admin review.'}
                </p>
              </div>
              <button onClick={onClose} className="text-text-gray hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content type grid */}
            <div className="grid grid-cols-2 gap-3">
              {CONTENT_TYPES.map(({ key, icon: Icon, label, desc }) => (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{label}</p>
                    <p className="text-xs text-text-gray mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
