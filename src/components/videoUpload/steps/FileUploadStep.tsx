'use client';

import { FileDropZone } from '../FileDropZone';
import { UploadProgressBar } from '../UploadProgressBar';
import { useVideoUploadStore } from '@/store/videoUploadStore';
import { useEffect, useRef } from 'react';
// import { UploadMode } from '@/types/videoUpload';
import CloseCircleIcon from '@/components/icons/CloseCircleIcon';

interface FileUploadStepProps {
  onGoLive: () => void;
}

export function FileUploadStep({ onGoLive }: FileUploadStepProps) {
  const {
    selectedFile,
    isUploading,
    isCancelled,
    uploadProgress,
    setSelectedFile,
    setIsUploading,
    setUploadProgress,
    setShowCancelModal,
    setCancelled,
  } = useVideoUploadStore();

  const intervalRef = useRef<number | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setCancelled(false);
    setIsUploading(true);
    
    // Calculate video duration
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      // Create a promise to get the duration
      const getDuration = new Promise<number>((resolve) => {
        video.onloadedmetadata = () => {
          resolve(Math.round(video.duration));
          URL.revokeObjectURL(video.src);
        };
      });
      
      video.src = URL.createObjectURL(file);
      
      // Wait for duration calculation
      const duration = await getDuration;
      useVideoUploadStore.getState().setVideoDuration(duration);
    }
    
    // Simulate upload progress
    let progress = 0;
    intervalRef.current = window.setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsUploading(false);
      }
    }, 300);
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  useEffect(() => {
    if (!isUploading || !selectedFile || isCancelled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isUploading, selectedFile, isCancelled]);

  return (
    <div className="flex flex-col gap-6">
      {!selectedFile ? (
        <>
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
            progress={uploadProgress}
            fileName={selectedFile.name}
            onCancel={handleCancelClick}
          />
        </div>
      )}
    </div>
  );
}