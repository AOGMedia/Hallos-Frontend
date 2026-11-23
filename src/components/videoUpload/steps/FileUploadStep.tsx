'use client';

import { FileDropZone } from '../FileDropZone';
import { UploadProgressBar } from '../UploadProgressBar';
import { useVideoUploadStore } from '@/store/videoUploadStore';
import { VideoType } from '@/types/videoUpload';
import CloseCircleIcon from '@/components/icons/CloseCircleIcon';
import { uploadEngine } from '../uploadEngine';
import { useUploadProgress } from '@/hooks/useVideoUpload';

interface FileUploadStepProps {
  onGoLive: () => void;
}

/** Reads the video's length from the file (gives up after a few seconds). */
function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    const done = (seconds: number) => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(seconds) ? Math.round(seconds) : 0);
    };
    const timer = setTimeout(() => done(0), 8000);
    video.preload = 'metadata';
    video.onloadedmetadata = () => done(video.duration);
    video.onerror = () => done(0);
    video.src = url;
  });
}

const titleFromName = (name: string) => name.replace(/\.[^./\\]{1,5}$/, '').replace(/_+/g, ' ').trim().slice(0, 100);

export function FileUploadStep({ onGoLive }: FileUploadStepProps) {
  const { selectedFile, setSelectedFile, setShowCancelModal, setCancelled } = useVideoUploadStore();
  const upload = useUploadProgress();

  const handleFileSelect = (file: File) => {
    const store = useVideoUploadStore.getState();
    setSelectedFile(file);
    setCancelled(false);
    // A fresh video starts with its file name as the title (easy to change).
    if (!store.videoTitle.trim()) store.setVideoTitle(titleFromName(file.name));

    // The upload starts now, while the details are filled in.
    void uploadEngine.start(file, { type: store.videoType === VideoType.SHORT ? 'short' : 'long' });
    void readDuration(file).then((seconds) => useVideoUploadStore.getState().setVideoDuration(seconds));
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  // A draft from earlier whose upload is already done: no file needed.
  const showProgress = Boolean(selectedFile) || upload.phase === 'done';

  return (
    <div className="flex flex-col gap-6">
      {!showProgress ? (
        <>
          {upload.needsFile && (
            <p className="text-sm text-text-secondary text-center">
              Pick <span className="text-text-primary">{upload.fileName}</span> again to finish uploading it.
            </p>
          )}
          <FileDropZone onFileSelect={handleFileSelect}>
          <button
            onClick={onGoLive}
            className="self-center flex items-center gap-2 px-6 py-4 rounded-full border border-border bg-primary/[0.01] text-text-secondary hover:text-text-primary hover:border-text-primary transition-all"
            style={{
              boxShadow: 'inset 2px 2px 4px rgba(255, 255, 255, 0.30)'
            }}
            >
            <CloseCircleIcon width={26} height={26} color="#F5313B" />
            <span className="text-medium">Go live</span>
          </button>
            </FileDropZone>
        </>
      ) : (
        <div className="p-8 rounded-3xl  bg-primary/[0.06]">
          <UploadProgressBar
            progress={upload.percent}
            fileName={selectedFile?.name || upload.fileName}
            onCancel={handleCancelClick}
            upload={upload}
            onRetry={() => void uploadEngine.retry()}
          />
        </div>
      )}
    </div>
  );
}
